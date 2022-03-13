import django.template

from naiades_watering.settings import GROUP_GARDENER, GROUP_BACKOFFICE

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


@register.filter
def get_issues_by_box(issues_by_box, box):
    return issues_by_box.get(box['boxId'], [])


@register.filter
def in_group(user, group_name):
    return user.groups.filter(name=group_name).exists()


@register.filter
def is_gardener(user):
    return in_group(user, GROUP_GARDENER)


@register.filter
def is_backoffice(user):
    return in_group(user, GROUP_BACKOFFICE)


@register.filter
def display_seconds(seconds):
    # convert to int
    seconds = int(seconds)

    if seconds < 60:
        return "00:%02d" % seconds

    minutes = seconds // 60

    if minutes < 60:
        return "%02d:%02d" % (minutes, seconds % 60)

    return "%02d:%02d:%02d" % (minutes // 60, minutes % 60, seconds % 60)
