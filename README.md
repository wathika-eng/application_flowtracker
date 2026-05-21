# APPLICATION FLOW TRACKER

## Structure

Backend (Django Ninja, PostgreSQL, Pipenv )
Frontend (Tanstack Start)

### Setup

```bash
git clone

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
cp .env.example .env
# update the .env file with your database credentials
python manage.py migrate
python manage.py runserver
```

On the other terminal tab:

```bash
cd frontend
bun i
bun run dev
```
