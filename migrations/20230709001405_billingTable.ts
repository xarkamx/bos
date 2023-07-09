import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('billing', (table) => {
    table.increments('id').primary();
    table.string('external_id').nullable();
    table.string('status').defaultTo('in progress');
    table.integer('order_id').unsigned().nullable();
    table.integer('owner_id').unsigned().nullable();
    table.timestamps(true, true);
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('billing')
}

