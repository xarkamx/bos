import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('orders', (table) => {
    table.timestamp('deleted_at').defaultTo(null)
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('orders', (table) => {
    table.dropColumn('deleted_at')
  })
}

