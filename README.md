# APPLICATION FLOW TRACKER

## Structure

Backend (Django Ninja, Sqlite, Pipenv )
Frontend (React, Cuppertino UI)

### Setup

You need Python 3.12+ and NodeJS 20+ installed on your machine:

```bash
# to setup nodejs
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
```

```bash
# clone the repo
git clone https://github.com/wathika-eng/application_flowtracker
#cd into the app
cd application_flowtracker

# open two tabs in your terminal
cd backend

#ensure you have pipenv installed (use uv or pipx to install pipenv)
pipx install pipenv #or
uv tool install pipenv

# to change python version, use pyenv
curl -sS https://webi.sh/pyenv | sh; \
source ~/.config/envman/PATH.env

#then install dependencies and run the server
pipenv install
pipenv shell
# to use venv instead of pipenv, you can run
# virtualenv .venv
# source .venv/bin/activate
# pip install -r requirements.txt
cp .env.example .env


# update the .env file with your database credentials
python manage.py make migrations
python manage.py migrate
python manage.py runserver

# or use uviconrn
uvicorn backend.asgi:application --reload

# the api uses rate limiting to prevent abuse and sqlite db for demo purposes

# docs
http://localhost:8000/api/docs
# or use rest client to test the http calls
https://marketplace.visualstudio.com/items?itemName=humao.rest-client

# to view the sqlite db locally, use:
https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer
```

On the other terminal tab, setup the frontend:

```bash
cd frontend
# install bun or use npm or pnpm (curl -fsSL https://bun.com/install | bash)
bun i
bun run dev
# open http://localhost:5173 in your browser
# frontend follows https://lawsofux.com/ with minimalistic routing
```

What can be improved:
> Cache the  applications in redis Key-Value storage to reduce database calls.
> Add auth with RBAC so as to track who editted what and prevent abuse
> dockerize the app for ease of deployment and setup github actions CI/CD pipelines for automated testing and deployment.

Production URL:
API -> <https://django-app-506915313256.africa-south1.run.app/api/>

Frontend -> <https://appflowtrack.vercel.app>

Joseph Wathika - <wathika02@gmail.com>
