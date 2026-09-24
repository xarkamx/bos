import type { Knex } from 'knex'


export async function up (knex: Knex): Promise<void> {
  return knex.schema.alterTable('billing', (table) => {
    table.string('type').defaultTo('I')
    table.string('folio').nullable()
  })
}


export async function down (knex: Knex): Promise<void> {
  return knex.schema.alterTable('billing', (table) => {
    table.dropColumn('type')
    table.dropColumn('folio')
  })
}

