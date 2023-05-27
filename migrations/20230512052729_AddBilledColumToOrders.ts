import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('orders', (table) => {
    table.text('billed').nullable();
    table.dateTime('billed_at').nullable();
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('orders', (table) => {
    table.dropColumn('billed');
    table.dropColumn('billed_at');
  })
}

