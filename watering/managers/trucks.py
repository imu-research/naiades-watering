import requests


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
            raise ValueError(response.content)

        # then you load the response using the json libray
        # by default you get only one alternative so you access 0-th element of the `routes`
        return response.\
            json().\
            get("routes", [])[0]["distance"]
