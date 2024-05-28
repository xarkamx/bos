import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('link', (table) => {
    table.increments('id').primary();
    table.string('middleman_id').notNullable();
    table.string('client_id').notNullable();
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('link');
}

