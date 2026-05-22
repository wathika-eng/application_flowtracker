## Deploying to Gcloud Run

```bash
# install mise first
curl https://mise.run | sh
# then install requirements
mise use -g pack
mise use -g gcloud
mise use -g overmind
# test locally with buildpacks
pack build application-flowtracker   --builder heroku/builder:24
# run the container locally
docker run -p 8080:8080 application-flowtracker
# deploy to gcloud run
gcloud deploy source .
# gcloud run deploy django-app   --source .   --region africa-south1   --allow-unauthenticated
```

Test the Procfile:

```bash
# run the Procfile locally with honcho or with foreman
# gem install foreman
pipx install honcho
honcho start -f Procfile.dev
```

Reference: <https://youtu.be/5aOF-RIZS5c>
