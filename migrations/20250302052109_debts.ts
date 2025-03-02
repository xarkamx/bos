import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('debts', table => {
    table.increments('id').primary()
    table.enum('type', ['client', 'provider']).notNullable()
    table.integer('entity_id').notNullable()
    table.integer('amount').notNullable()
    table.enum('status', ['pending', 'paid','canceled']).defaultTo('pending')
    table.text('bill_id')
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  });
}


export async function down(knex: Knex): Promise<void> {

  return knex.schema.dropTable('debts')
}

