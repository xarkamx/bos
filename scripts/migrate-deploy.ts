import knex, { Knex } from 'knex'
import { resolve } from 'path'
import config = require('../knexfile')

export async function migrateDeploy (createConnection: typeof knex = knex) {
  const settings = (config as unknown as Record<string, Knex.Config>).production
  const connection = settings.connection as Knex.MySqlConnectionConfig
  if (!connection.host || !connection.database || !connection.user || connection.password === undefined) {
    throw new Error('Deployment migrations require DB_HOST, DB_DATABASE, DB_USERNAME and DB_PASSWORD')
  }

  const db = createConnection({
    ...settings,
    migrations: {
      ...settings.migrations,
      directory: resolve(__dirname, '../migrations'),
      loadExtensions: ['.ts']
    }
  })
  try {
    // Knex tracks completed migrations and locks concurrent migration runners.
    return await db.migrate.latest()
  } finally {
    await db.destroy()
  }
}

if (require.main === module) {
  migrateDeploy().then(([batch, migrations]) => {
    process.stdout.write(`Migration batch ${batch}: ${migrations.length} pending migration(s) applied.\n`)
  }).catch(() => {
    process.stderr.write('Database migration failed; deployment blocked. Check database connectivity, permissions and migration state.\n')
    process.exitCode = 1
  })
}
