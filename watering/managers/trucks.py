import requests


class TruckDistanceManager:

    POINTS_BATCH_SIZE = 251

    def __init__(self, parking=None):
        self.parking = parking or {
            "lat": 46.1822,
            "lng": 6.14954,
        }

    def _calculate_batch_distance(self, points):
        # no distance driven
        if not points:
            return 0

        # validate number of points
        if len(points) > self.POINTS_BATCH_SIZE:
            raise ValueError("Too many points in a single batch request.")

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

        # load the response using the json library
        # by default you get only one alternative so you access 0-th element of the `routes`
        return response.\
            json().\
            get("routes", [])[0]["distance"]

    def calculate_distance(self, points):
        # no distance driven
        if not points:
            return 0

        # add parking at beginning & end
        points = [self.parking] + points + [self.parking]

        # process points in fixed-size batches
        # this is because requests to external service
        # can not include more than a fixed number of points
        total_distance = 0
        for idx in range(0, len(points), self.POINTS_BATCH_SIZE - 1):

            # start from last point in previous batch
            # except for the very first batch
            batch = points[
                idx - (1 if idx else 0):
                min(idx + self.POINTS_BATCH_SIZE - 1, len(points))
            ]

            # calculate distance for this batch of points
            # and add to total distance
            total_distance += self._calculate_batch_distance(points=batch)

        return total_distance
