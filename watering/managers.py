from requests import ReadTimeout

from watering.models import WateringBox
from watering.utils import merge, merge_by_date


class ReportDataManager:
    consumption_history = None
    prediction_history = None
    watering_duration = None

    def __init__(self, date_range):
        self.date_range = date_range

    def load(self):
        # get consumption historic data
        try:
            self.consumption_history = WateringBox.consumption_history_list_values(
                from_date=self.date_range["formatted"]["from"],
                to=self.date_range["formatted"]["to"]
            )
        except ReadTimeout:
            self.consumption_history = []

        # get prediction historic data
        try:
            self.prediction_history = WateringBox.prediction_history_list(
                self.date_range["formatted"]["from"], self.date_range["formatted"]["to"]
            )
        except ReadTimeout:
            self.prediction_history = []

        # get watering duration historic data
        try:
            self.watering_duration = WateringBox.watering_duration_history_list(
                self.date_range["formatted"]["from"], self.date_range["formatted"]["to"]
            )
        except ReadTimeout:
            self.watering_duration = []

    def get_entities_data(self):
        # check if data have been loaded
        if self.consumption_history is None:
            self.load()

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
