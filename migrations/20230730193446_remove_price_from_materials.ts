import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('materials', table => {
    table.dropColumn('price')
    table.integer('provider_id').unsigned()
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('materials', table => {
    table.float('price').notNullable()
    table.dropColumn('provider_id')
  })
}

