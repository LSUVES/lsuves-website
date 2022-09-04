# LSUVES website
## Deployment
The website is built using Docker images.
### FYP deployment
A rough deployment of the site (without HTTPS configured) is hosted at http://158.125.160.232/. The credentials for the superuser are username: `committee`, password: `meteoree`. To host the site yourself, follow these steps:
<ol>
<li>Ensure the latest version of Docker is set up.</li>
<li>In `frontend/src/index.jsx`, change the assignment for `axios.defaults.baseURL` to the hostname/address of the API server.</li>
<li>In `backend/src/lsuves_website/settings.py`, change the assignments for ALLOWED_HOSTS, CSRF_TRUSTED_ORIGINS, and CORS_ALLOWED_ORIGINS to lists containing the hostname/address of the frontend server.</li>
<li>From the root directory where the docker-compose.yml file is located, run `docker compose up -d`.</li>
<li>Run `docker exec -it lsuves-website-backend-1 bash`</li>
<li>Inside the back-end container, run `./manage.py makemigrations users`, `./manage.py makemigrations`, `./manage.py migrate`, `./manage.py createsuperuser` and provide your own credentials for the superuser. Then run `exit`.</li>
<li>Finally, we need to edit the Nginx configuration so that directly entering the URLs of sub-pages takes us to our SPA so run `docker cp lsuves-website-frontend-1:/etc/nginx/conf.d/default.conf .`, then edit this file to add the line `try_files $uri $uri/ /index.html;` to the `location / {}` block, run `docker cp default.conf lsuves-website-frontend-1:/etc/nginx/conf.d/default.conf`, and then `docker compose up` to restart everything.</li>
</ol>
### Development
To run in a development environment, from `.devcontainer/`, run `docker-compose up`. Alternatively, if you're using VS Code, you can install the "Remote - Containers" extension (ms-vscode-remote.remote-containers) and run (F1) `Remote-Containers: Open Folder in Container...` and then select the frontend/backend folder to open (both containers will be created anyway).

### Production
When deploying to a production environment, there are a few things you need to do.

In `frontend/src/index.jsx`, change the assignment for `axios.defaults.baseURL` to the hostname/address of the API server.

In `backend/src/lsuves_website/settings.py`, change the assignments for ALLOWED_HOSTS, CSRF_TRUSTED_ORIGINS, and CORS_ALLOWED_ORIGINS to lists containing the hostname/address of the frontend server. Also, change DEBUG to false and SECRET_KEY to a large random value. Follow the guidance given here https://docs.djangoproject.com/en/4.0/howto/deployment/checklist/.

The backend should only allow secure (HTTPS) connections, i.e. HTTP Strict Transport Security should be enabled to prevent downgrade attacks. See: 
https://docs.djangoproject.com/en/4.0/topics/security/#ssl-https
https://docs.djangoproject.com/en/4.0/ref/middleware/#http-strict-transport-security, https://docs.djangoproject.com/en/4.0/ref/settings/#csrf-cookie-secure, and https://docs.djangoproject.com/en/4.0/ref/settings/#session-cookie-secure.

Finally, run `./manage.py test` to run all tests and make sure there are no failures/errors.

You may need to create a cron job to clean up expired sessions occassionally to prevent records building up in the database. See: https://docs.djangoproject.com/en/4.0/topics/http/sessions/#clearing-the-session-store.

---

## Structure
TODO

---

## Contributing
Ensure changes to the backend are thoroughly tested so as not to introduce bugs/vulnerabilities. If you're unfamiliar with testing in Django, read [the section on it in the docs](https://docs.djangoproject.com/en/4.0/topics/testing/) and for an example, see users/tests.py.

Note that forms on the frontend are validated from values in frontend/src/utils/validation, which may lead to bugs if not kept consistent with the backend constraints.