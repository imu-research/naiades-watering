# Naiades Watering App

Allows city workers that deploy the Naiades Platform solution to optimize their watering schedule.

## Installation

Follow the steps bellow in order to setup & deploy:

### Install Git & Docker
First, install Docker & Docker compose:

On Ubuntu, run the following command:
```
sudo apt update && sudo apt install git docker docker-compose -y
```

On Windows, follow directions [these directions](https://docs.docker.com/docker-for-windows/install/).

### Clone
Run this to clone the naiades app repository:
```
git clone https://github.com/EvangelieAnagnostopoulou/naiades-watering.git
```

### Build
After that, build the app:

```
cd naiades-watering && sudo docker-compose build
```

### Run
After the build finishes successfully, deploy the app:
```
sudo docker-compose up -d
```

By default, the application is exposed on port 80, 
but you can control this behaviour by setting the `NAIADES_WATERING_PORT` environment variable.

### Setup
After running the app for the first time, connect to the `web` container in order to initialize it:

```
sudo docker exec -it naiades-watering_web_1 /bin/bash
python manage.py migrate
```

After that, run the command below and follow its interactive instructions, 
in order to create a staff account 
(feel free to repeat this step more than once if necessary):
:
```
python manage.py createsuperuser
```

Finally, exit the worker container:
```
exit
```

### Update to a new version
In order to update the app to a new version, perform the following steps:

1. Pull latest changes from repository:
```
cd naiades-watering && git pull
```

2. Rebuild the updated app:
```
sudo docker-compose build
```

3. Restart it:
```
sudo docker-compose stop
sudo docker-compose up -d
```

4. Apply database migrations in the web container:
```
sudo docker exec -it naiades-watering_web_1 /bin/bash
python manage.py migrate
exit
```