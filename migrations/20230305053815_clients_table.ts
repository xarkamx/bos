import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('clients', table => {
    table.increments('client_id').notNullable().primary();
    table.string('rfc').defaultTo('XAXX010101000').notNullable();
    table.text('name');
    table.text('email');
    table.json('phones');
    table.boolean('legal');
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('clients');
}

