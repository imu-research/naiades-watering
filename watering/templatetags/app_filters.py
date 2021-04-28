import django.template

register = django.template.Library()


@register.filter
def exclude_none(data):
    if type(data) == list:
        return [
            exclude_none(datum)
            for datum in data
        ]

    if type(data) != dict:
        return data

    return {
        key: exclude_none(value)
        for key, value in data.items()
        if value is not None
    }
