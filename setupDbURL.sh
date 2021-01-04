#call this in your shell like: . setupDbURL.sh
export DATABASE_URL=$(heroku config:get DATABASE_URL -a alta-snow-daily-data)