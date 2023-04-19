docker-compose up -d db
sleep 5
yarn knex migrate:latest
yarn dev
docker-compose down