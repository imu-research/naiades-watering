from django.utils.timezone import now


def preprocessed_history(history):
    preprocessed = []
    previous_humidity = None

    for idx, entry in enumerate(history):
        if idx > 0:
            preprocessed.append({
                "date": entry['date'],
                "value": previous_humidity
            })

        preprocessed.append(entry)
        previous_humidity = entry['value']

    # add an entry for right now, with previous humidity
    preprocessed.append({
        "date": now().strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "value": previous_humidity
    })

    return preprocessed


def merge(key_field, value_field, results_lists, prop_names, preprocessing=None):
    if len(results_lists) != len(prop_names):
        raise ValueError("Invalid prop_names parameter.")

    # check if a callable has been passed for preprocessing
    if preprocessing:
        results_lists = [
            preprocessing(result)
            for result in results_lists
        ]

    merged = {}
    for idx, results in enumerate(results_lists):
        for entry in results:

            # new entry for this key
            if entry[key_field] not in merged:
                merged[entry[key_field]] = {
                    prop_name: None
                    for prop_name in prop_names
                }

                # also add key
                merged[entry[key_field]][key_field] = entry[key_field]

            # set relevant prop
            merged[entry[key_field]][prop_names[idx]] = entry[value_field]

    # return sorted by key
    return sorted(list(merged.values()), key=lambda entry: entry[key_field])


def merge_by_date(results_lists, prop_names, preprocessing=None):
    return merge(
        key_field="date",
        value_field="value",
        results_lists=results_lists,
        prop_names=prop_names,
        preprocessing=preprocessing
    )


def merge_histories(old_history, new_history, preprocessing=None):
    return merge_by_date(
        results_lists=[old_history, new_history],
        prop_names=["value_old", "value_new"],
        preprocessing=preprocessing
    )
