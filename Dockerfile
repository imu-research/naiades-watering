FROM python:3.7
ENV PYTHONUNBUFFERED=1
RUN apt update && apt install gettext -y
RUN mkdir /code
WORKDIR /code
COPY requirements.txt /code/
RUN pip install -r requirements.txt
COPY . /code/
RUN python manage.py compilemessages --locale=fr
