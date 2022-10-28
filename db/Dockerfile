FROM postgres:13.4

# Set POSTGRES_USER if using custom username and update django settings
# USER postgres
# Although not here coz localedef needs to be run as sudo, I guess

RUN localedef -i en_GB -c -f UTF-8 -A /usr/share/locale/locale.alias en_GB.UTF-8
ENV LANG en_GB.utf8

ENV POSTGRES_DB lsuves_website

# Should this be here or in the compose spec where db-password is defined?
ENV POSTGRES_PASSWORD_FILE /run/secrets/db-password
