docker-compose up -d db
sleep 5

export DB_CONNECTION=mariadb
export DB_HOST=localhost
export DB_PORT=3306
export DB_DATABASE=bos
export DB_USERNAME=root
export DB_PASSWORD=password


yarn knex migrate:latest
yarn dev
docker-compose down