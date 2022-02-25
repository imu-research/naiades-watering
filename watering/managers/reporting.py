from datetime import datetime, timedelta

from requests import ReadTimeout

from watering.utils import merge, merge_by_date


class ReportDataManager:
    consumption_history = None
    prediction_history = None
    watering_duration = None
    truck_location_history = None

    def __init__(self, date_range):
        self.date_range = date_range

    def get_time_spent(self, box_id):
        from watering.models import LocationEvent

        # get time spent
        time_spent = 0

        try:
            box_id = int(box_id.split("-")[-1])
        except (IndexError, ValueError, TypeError):
            box_id = box_id

        location_events = LocationEvent.objects. \
            filter(box_id=box_id).\
            filter(exited__gte=self.date_range["from"]). \
            filter(exited__lte=self.date_range["to"]). \
            exclude(entered=None)

        for location_event in location_events:
            time_spent += location_event.duration

        return time_spent

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
        return datetime.strptime(value.split("T")[0], "%Y-%m-%d")

    @staticmethod
    def _rounded(value):
        if value is None:
            return None

        return round(value, 2)

    def _process_entity_data(self, datum, box_id, entity_id, watering_dates_by_entity):
        # get watering dates for this entity
        watering_dates = watering_dates_by_entity.get(entity_id, set())

        # only k
        datum["date"] = datum["date"].split("T")[0]

        # parse date
        parsed_date = self.parse_date(value=datum["date"])

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

        datum["time_spent"] = ReportDataManager(date_range={
            "from": parsed_date,
            "to": parsed_date + timedelta(days=1),
        }). \
            get_time_spent(box_id=box_id)

    def get_entities_data(self):
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

            entities_data.append({
                "entity_id": entity["entity_id"],
                "box_id": box_id,
                "data": data_by_date,
            })

        return entities_data

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
