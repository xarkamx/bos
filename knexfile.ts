import type { Knex } from 'knex'
import * as dotenv from 'dotenv'
// Update with your config settings.
dotenv.config()
const config: Record<string, Knex.Config> = {
  development: {
    client: 'mysql',
    connection: {
      database: process.env.DB_DATABASE,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST
    }
  },
  test: {
    client: 'mysql',
    connection: {
      database: 'bos',
      user: 'root',
      password: 'password',
      host: 'localhost',
      multipleStatements: true
    }
  },
  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'mysql',
    connection: {
      database: process.env.DB_DATABASE,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST
    }
  }
}

module.exports = config
