

export default {
  smtpConfig: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD
  },
  dbConfig: {
    development: {
      client: 'mysql',
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      },
      migrations: {
        directory: './src/database/migrations'
      },
      seeds: {
        directory: './src/database/seeds'
      }
    },
    production: {
      client: 'mysql',
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      },
      migrations: {
        directory: './src/database/migrations'
      },
      seeds: {
        directory: './src/database/seeds'
      }
    }
  }
}