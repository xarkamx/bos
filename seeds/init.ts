import { Knex } from 'knex'

export async function seed (knex: Knex): Promise<void> {
  // import sql file
  const fs = require('fs')
  const path = require('path')
  const sql =  fs.readFileSync(path.join(__dirname,'sql', 'init.sql'),'utf8').trim()
  await knex.raw(sql)
};
