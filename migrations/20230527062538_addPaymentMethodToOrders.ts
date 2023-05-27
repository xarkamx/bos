import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('orders', (table) => {
    table.string('payment_type').defaultTo('1');
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('orders', (table) => {
    table.dropColumn('payment_type');
  })
}

