from datetime import datetime

from requests import ReadTimeout

from naiades_watering.settings import (
    DISTANCES_MIN_LAT,
    DISTANCES_MAX_LAT,
    DISTANCES_MIN_LNG,
    DISTANCES_MAX_LNG,
)
from watering.utils import merge, merge_by_date


class ReportDataManager:
    consumption_history = None
    prediction_history = None
    watering_duration = None
    next_watering_dates = None
    truck_location_history = None
    truck_total_time_spent = None

    MAX_CONSUMPTION_PER_SECOND = 50  # watering records are invalid if flow is more than 0,5 lt/second
    MAX_TIME_SPENT_PER_DURATION = 5  # total time spent should not be more than 5x the watering duration

    def __init__(self, date_range):
        self.date_range = date_range

    def load_history_data(self):
        from watering.models import WateringBox

        params = (
            self.date_range["formatted"]["from"],
            self.date_range["formatted"]["to"],
        )

        # get consumption historic data
        try:
            self.consumption_history = WateringBox.consumption_history_list_values(*params)
        except ReadTimeout:
            self.consumption_history = []

        # get prediction historic data
        try:
            self.prediction_history = WateringBox.prediction_history_list(*params)
        except ReadTimeout:
            self.prediction_history = []

        # get watering duration historic data
        try:
            self.watering_duration = WateringBox.watering_duration_history_list(*params)
        except ReadTimeout:
            self.watering_duration = []

        # get next watering dates
        try:
            self.next_watering_dates = WateringBox.next_watering_dates(*params)
        except ReadTimeout:
            self.next_watering_dates = []

        # filter out invalid predictions
        for prediction_history_item in self.prediction_history:

            box_id = prediction_history_item["entity_id"].split("-")[-1]

            self.filter_out_predictions_next_watering_date_in_past(
                prediction_history=prediction_history_item["results"],
                next_watering_dates=self.next_watering_dates[box_id],
            )

        # get total time spent by trucks
        try:
            self.truck_total_time_spent = WateringBox.get_truck_total_time_spent(*params)
        except ReadTimeout:
            self.truck_total_time_spent = 0

    @staticmethod
    def filter_out_predictions_next_watering_date_in_past(prediction_history, next_watering_dates, value_key="value"):
        for prediction_value in prediction_history:

            # get date for prediction
            prediction_date = prediction_value["date"].split("T")[0]

            # find in next watering dates
            next_watering_date = (next_watering_dates or {}).get(prediction_date)

            # set predicted value to zero
            # if next watering date was before prediction date
            if next_watering_date and next_watering_date >= datetime.strptime(prediction_date, "%Y-%m-%d").date():
                pass
            else:
                prediction_value[value_key] = 0

    def load_location_history(self):
        from watering.models import WateringBox

        # get truck location data
        try:
            self.truck_location_history = WateringBox.truck_location_history(
                self.date_range["formatted"]["from"], self.date_range["formatted"]["to"]
            )
        except ReadTimeout:
            self.truck_location_history = []

    @staticmethod
    def parse_date(value):
        try:
            return datetime.strptime(value.split("T")[0], "%Y-%m-%d")
        except AttributeError:
            return datetime.utcfromtimestamp(value / 1000)

    @staticmethod
    def _rounded(value):
        if value is None:
            return None

        return round(value, 2)

    def _calculate_time_spent(self, event_times):
        event_times = sorted(event_times)

        current_time = None
        time_spent_by_date = {}
        for event_time in event_times:
            if (current_time is None) or (current_time.date() != event_time.date()):
                current_time = event_time
            else:
                time_spent_by_date[event_time.date()] = (event_time - current_time).total_seconds()

        return sum(time_spent_by_date.values())

    def _process_entity_data(self, datum, box_id, entity_id, watering_dates_by_entity):
        # get watering dates for this entity
        watering_dates = [
            watering_time.date() for watering_time in watering_dates_by_entity.get(entity_id, set())
        ]

        # only k
        datum["date"] = datum["date"].split("T")[0]

        # parse date
        parsed_date = self.parse_date(value=datum["date"]).date()

        # get consumption, filter by date
        datum["consumption"] = (
            self._rounded(datum["consumption"])
            if parsed_date in watering_dates
            else None
        )

        # get prediction
        datum["prediction"] = self._rounded(datum["prediction"])

        # get duration, filter by date
        datum["duration"] = (
            (
                datum["duration"] / 1000
                if parsed_date in watering_dates
                else None
            )
        ) if datum["duration"] is not None else None

        datum["time_spent"] = min(
            max(
                self._calculate_time_spent(
                    event_times=[
                        event_time
                        for event_time in watering_dates_by_entity.get(entity_id, set())
                        if event_time.date().strftime("%Y-%m-%d") == datum["date"]
                    ]
                ) or 0,
                datum["duration"] or 0
            ),
            (datum["duration"] or 0) * self.MAX_TIME_SPENT_PER_DURATION
        )

    def _filter_out_invalid_consumptions(self, records):
        return [
            record
            for record in records
            if (not record.get("consumption")) or
               (not record.get("duration")) or
               ((record["consumption"] / record["duration"]) < self.MAX_CONSUMPTION_PER_SECOND)
        ]

    def _get_entities_data_by_date(self, by_entity, watering_dates_by_entity):
        entities_data = []
        for entity in by_entity:
            # get box ID
            box_id = entity["entity_id"].split("ld:FlowerBed:FlowerBed-")[-1]

            # merge data by individual date
            data_by_date = merge_by_date(
                results_lists=[
                    entity["predictions"],
                    entity["consumptions"],
                    entity["durations"],
                ],
                prop_names=["prediction", "consumption", "duration"]
            )

            # ignore hour part, format metrics
            for datum in data_by_date:
                self._process_entity_data(
                    datum=datum,
                    box_id=box_id,
                    entity_id=entity["entity_id"],
                    watering_dates_by_entity=watering_dates_by_entity,
                )

            # filter out invalid consumption records
            data_by_date = self._filter_out_invalid_consumptions(records=data_by_date)

            entities_data.append({
                "entity_id": entity["entity_id"],
                "box_id": box_id,
                "data": data_by_date,
            })

        return entities_data

    def get_monthly_response_data(self):
        # check if data have been loaded
        if self.consumption_history is None:
            self.load_history_data()

        # load watering dates by entity
        watering_dates_by_entity = self.preprocessing_duration_data()

        # group by entity
        by_entity = merge(
            key_field="entity_id",
            value_field="results",
            results_lists=[
                self.prediction_history,
                self.consumption_history,
                self.watering_duration,
            ],
            prop_names=["predictions", "consumptions", "durations"]
        )

        # for each entity, group by date
        entities_data_by_date = self._get_entities_data_by_date(
            by_entity=by_entity,
            watering_dates_by_entity=watering_dates_by_entity,
        )

        return {
            "data": entities_data_by_date,
            "truck_total_time_spent": self.truck_total_time_spent,
        }

    @staticmethod
    def _is_valid_location(latitude, longitude):
        # only handle locations around Carouge
        return \
            (DISTANCES_MIN_LAT <= latitude <= DISTANCES_MAX_LAT) and \
            (DISTANCES_MIN_LNG <= longitude <= DISTANCES_MAX_LNG)

    @staticmethod
    def _get_locations_by_date(location_entries):
        # group by date
        locations_by_date = {}
        for location_entry in location_entries:
            location_date = location_entry["date"].split("T")[0]

            if location_date not in locations_by_date:
                locations_by_date[location_date] = []

            # get coordinates
            try:
                coordinates = location_entry["value"]["coordinates"]
            except TypeError:
                continue

            # create point
            point = {
                "lat": coordinates[0],
                "lng": coordinates[1],
            }

            # deduplicate
            if (
                locations_by_date[location_date] and
                locations_by_date[location_date][-1]["lat"] == point["lat"] and
                locations_by_date[location_date][-1]["lng"] == point["lng"]
            ):
                continue

            # exclude invalid locations
            if not ReportDataManager._is_valid_location(latitude=point["lat"], longitude=point["lng"]):
                continue

            # add to locations for this date
            locations_by_date[location_date].append(point)

        return locations_by_date

    def get_distances_data(self):
        from watering.managers.trucks import TruckDistanceManager

        # check if data have been loaded
        if self.truck_location_history is None:
            self.load_location_history()

        # collect all locations
        location_entries = []
        for entity_data in self.truck_location_history:
            location_entries += entity_data["results"]

        # sort from least to most recent
        # then group by date
        locations_by_date = self._get_locations_by_date(
            location_entries=sorted(location_entries, key=lambda entry: entry["date"])
        )

        # calculate distance per date (in km)
        return [
            {
                "date": location_date,
                "total_distance": round(TruckDistanceManager().calculate_distance(points=points) / 1000, 1)
            }
            for location_date, points in locations_by_date.items()
        ]

    def preprocessing_duration_data(self):

        from watering.models import WateringBox

        params = (
            self.date_range["formatted"]["from"],
            self.date_range["formatted"]["to"],
        )

        # get last watering date historic data
        try:
            last_watering_date_history_list = WateringBox.last_watering_date_history_list_values(*params)
        except ReadTimeout:
            last_watering_date_history_list = []

        # group by entity id, only unique dates
        return {
            last_watering_date_history["entity_id"]: set([
                self.parse_date(result["value"])
                for result in last_watering_date_history.get("results", [])
            ])
            for last_watering_date_history in last_watering_date_history_list
        }

    def _get_daily_report_consumptions(self):
        consumptions = []
        for consumption_history_item in self.consumption_history:
            try:
                results = [item for item in reversed(consumption_history_item['results']) if item["value"] is not None][0]
            except IndexError:
                results = None
            if results:
                value = results['value']
                consumptions.append({'entity_id': consumption_history_item['entity_id'], 'value': value})

        return consumptions

    def _prepare_daily_report_response_data(self, response, consumptions, watering_dates_by_entity):
        # initialize response
        response["total_consumption"] = 0
        response["total_watering_time"] = 0
        response["data"] = []

        # update for each box
        for box in response["boxes"]:
            if box.data['lastWatering'] == "TODAY":
                # update totals
                response["total_consumption"] = response["total_consumption"] + box.data['consumption']
                response["total_watering_time"] = response["total_watering_time"] + box.data['duration']

                # measure last watering
                last_watering = 0
                for consumption in consumptions:
                    if consumption["entity_id"] == box.data['id']:
                        last_watering = round(consumption["value"], 2)

                # calculate time spent
                box.data["time_spent"] = self._calculate_time_spent(event_times=[
                    event_time
                    for event_time in watering_dates_by_entity.get(box.data["id"], set())
                    if self.date_range["from"].date() <= event_time.date() <= self.date_range["to"].date()
                ])

                # add to response data
                response["data"].append({
                    "box": f"Box{box.data['boxId']}",
                    "this_watering": box.data['consumption'],
                    "last_watering": last_watering,
                })

        return response

    def get_daily_report_data(self):
        from watering.models import WateringBox

        # get boxes for this user
        boxes = WateringBox.list()

        # check if data have been loaded
        if self.consumption_history is None:
            self.load_history_data()

        # load watering dates by entity
        watering_dates_by_entity = self.preprocessing_duration_data()

        # Get the last watering value
        consumptions = self._get_daily_report_consumptions()

        # prepare daily response data
        response = {
            "boxes": boxes,
            "truck_total_time_spent": self.truck_total_time_spent,
        }

        # calculate total watering consumption and time spend
        return self._prepare_daily_report_response_data(
            response=response,
            consumptions=consumptions,
            watering_dates_by_entity=watering_dates_by_entity,
        )
