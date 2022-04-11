# decide whether to FROM builder or FROM python-slim and copy files
# https://www.docker.com/blog/containerized-python-development-part-1/#:~:text=our%20project%20structure.-,Multi-stage%20builds%C2%A0,-Although%20this%20may

FROM python:3.9 AS builder

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# TODO: See below.
RUN groupadd --gid 1000 avgs && \
    useradd --create-home --shell /bin/bash --uid 1000 --gid avgs avgs
USER avgs

WORKDIR /src

COPY requirements* .

RUN pip install --no-cache-dir -r requirements.txt

COPY src/ .

FROM builder AS cron

# Install cron and copy and enable our crontab.
USER root
RUN apt-get update && apt-get -y install cron
COPY crontab .
RUN chmod 0644 ./crontab && \
    crontab ./crontab

CMD [ "cron", "-f" ]
# In order to run our backend with cron we need to use a helper script.
# COPY --chown=avgs:avgs entrypoint.sh .
# RUN chmod 744 ./entrypoint.sh
# USER root
FROM builder AS development

RUN pip install --no-cache-dir -r requirements-dev.txt

# TODO: I think create-home is only needed coz of VSCode but I should test this
# RUN groupadd --gid 1000 avgs && \
#     useradd --create-home --shell /bin/bash --uid 1000 --gid avgs avgs
# USER avgs

CMD [ "python", "manage.py", "runserver", "0.0.0.0:8000" ]

FROM builder AS production

# TODO: Ensure the uid is unique and not the same as the host user
#       The gids of all apps should probably be the same but differ from the host's
# RUN groupadd --gid 1001 avgs && \
#     useradd --shell /bin/bash --uid 1001 --gid avgs avgs
# USER avgs

CMD [ "python", "manage.py", "runserver", "0.0.0.0:8000" ]
