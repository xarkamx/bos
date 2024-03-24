import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('products', table => {
    table.string('category').notNullable().defaultTo('general');
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('products', table => {
    table.dropColumn('category');
  })
}

