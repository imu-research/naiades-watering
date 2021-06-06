import json
import requests

from requests import ReadTimeout

from watering.models import WateringBox
from watering.utils import merge, merge_by_date


class TruckDistanceManager:
    def __init__(self, parking=None):
        self.parking = parking or {
            "lat": 46.1822,
            "lng": 6.14954,
        }

    def calculate_distance(self, points):
        # no distance driven
        if not points:
            return 0

        # add parking at beginning & end
        points = [self.parking] + points + [self.parking]

        # format for API call - notice the reverse order!
        formatted_points = [
            f"{point['lng']},{point['lat']}"
            for point in points
        ]

        # call the OSMR API
        response = requests.get(
            f"http://router.project-osrm.org/route/v1/car/{';'.join(formatted_points)}?overview=false"
        )

        if response.status_code != 200:
            import pdb; pdb.set_trace()
        # then you load the response using the json libray
        # by default you get only one alternative so you access 0-th element of the `routes`
        return response.\
            json().\
            get("routes", [])[0]["distance"]


class ReportDataManager:
    consumption_history = None
    prediction_history = None
    watering_duration = None
    truck_location_history = None

    def __init__(self, date_range):
        self.date_range = date_range

    def load_history_data(self):
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
        # get truck location data
        try:
            self.truck_location_history = WateringBox.truck_location_history(
                self.date_range["formatted"]["from"], self.date_range["formatted"]["to"]
            )
        except ReadTimeout:
            self.truck_location_history = []

    def get_entities_data(self):
        # check if data have been loaded
        if self.consumption_history is None:
            self.load_history_data()

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
                datum["date"] = datum["date"].split("T")[0]

                for prop in ["consumption", "prediction"]:
                    datum[prop] = round(datum[prop], 2) if datum[prop] is not None else None

                datum["duration"] = datum["duration"] / 1000 if datum["duration"] is not None else None

            entities_data.append({
                "entity_id": entity["entity_id"],
                "box_id": entity["entity_id"].split("ld:FlowerBed:FlowerBed-")[-1],
                "data": data_by_date,
            })

        return entities_data

    def get_distances_data(self):
        # check if data have been loaded
        if self.truck_location_history is None:
            self.load_location_history()

        # collect all locations
        location_entries = []
        for entity_data in self.truck_location_history:
            location_entries += entity_data["results"]

        # sort from least to most recent
        location_entries = sorted(location_entries, key=lambda entry: entry["date"])

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

        # calculate distance per date
        return {
            location_date: TruckDistanceManager().calculate_distance(points=points)
            for location_date, points in locations_by_date.items()
        }
