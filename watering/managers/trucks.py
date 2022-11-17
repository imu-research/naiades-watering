import requests

from geopy.distance import great_circle


class TruckDistanceManager:

    @staticmethod
    def calculate_distance(points):
        total_distance = 0

        if not points:
            return total_distance

        previous_point = points[0]
        for point in points[1:]:
            # calculate distance between this & previous point
            total_distance += great_circle(
                (previous_point["lat"], previous_point["lng"]),
                (point["lat"], point["lng"]),
            ).meters

            # continue for next point
            previous_point = point

        return total_distance
