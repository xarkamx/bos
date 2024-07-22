import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('bank_details', table => {
    table.increments('id').primary()
    table.string('bank_name').notNullable()
    table.string('bank_account').notNullable()
    table.string('bank_clabe').notNullable()
    table.string('bank_reference').notNullable()
    table.string('person_type').notNullable()
    table.string('external_id').notNullable()
    table.string('accountant_name').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('bank_details')
}

