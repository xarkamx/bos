import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('materials_price_list', table => {
    table.increments('id').primary()
    table.float('price').notNullable()
    table.integer('material_id').unsigned()
    table.integer('provider_id').unsigned()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('materials_price_list')
}

