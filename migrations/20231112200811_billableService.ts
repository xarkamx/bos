import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('billableServices', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('code').notNullable();
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('billableServices');
}

