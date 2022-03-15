# AVGS website
## Deployment
The website is built using Docker images, 
### Development
To run in a development environment, from `.devcontainer/`, run `docker-compose up`. Alternatively, if you're using VS Code, you can install the "Remote - Containers" extension (ms-vscode-remote.remote-containers) and run (F1) `Remote-Containers: Open Folder in Container...` and then select the frontend/backend folder to open (both containers will be created anyway).

### Production
When deploying to a production environment, there are a few things you need to do.

In `frontend/src/index.jsx`, change the assignment for `axios.defaults.baseURL` to the hostname/address of the API server.

In `backend/src/avgs_website/settings.py`, change the assignments for ALLOWED_HOSTS, CSRF_TRUSTED_ORIGINS, and CORS_ALLOWED_ORIGINS to lists containing the hostname/address of the frontend server. Also, change DEBUG to false and SECRET_KEY to a large random value. Follow the guidance given here https://docs.djangoproject.com/en/4.0/howto/deployment/checklist/.

The backend should only allow secure (HTTPS) connections, i.e. HTTP Strict Transport Security should be enabled to prevent downgrade attacks. See: https://docs.djangoproject.com/en/4.0/ref/middleware/#http-strict-transport-security, https://docs.djangoproject.com/en/4.0/ref/settings/#csrf-cookie-secure, and https://docs.djangoproject.com/en/4.0/ref/settings/#session-cookie-secure.

Finally, run `./manage.py test` to run all tests and make sure there are no failures/errors.

You may need to create a cron job to clean up expired sessions occassionally to prevent records building up in the database. See: https://docs.djangoproject.com/en/4.0/topics/http/sessions/#clearing-the-session-store.

---

## Structure

---

## Contributing
Ensure changes to the backend are thoroughly tested so as not to introduce bugs/vulnerabilities. If you're unfamiliar with testing in Django, read [the section on it in the docs](https://docs.djangoproject.com/en/4.0/topics/testing/) and for an example, see users/tests.py.
