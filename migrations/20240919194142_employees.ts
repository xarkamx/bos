import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('employees', (table) => {
    table.increments('id').primary()
    table.integer('bas_id').notNullable().unique()
    table.string('name').notNullable()
    table.string('email').notNullable().unique()
    table.string('phone').notNullable()
    table.integer('pto_days').notNullable()
    table.string('rfc').defaultTo('XAXX010101000')
    table.timestamps(true, true)
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('employees')
}

