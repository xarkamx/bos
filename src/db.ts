import Knex from 'knex'

export default class Db {
  public static getInstance (): Db {
    if (!Db.instance) {
      Db.instance = new Db()
    }

    return Db.instance.knex
  }

  private static instance: Db
  readonly knex: any
  private constructor () {
    this.knex = Knex({
      client: 'mysql',
      connection: {
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD
      }
    })
  }

  public getKnex () {
    return this.knex
  }
}
