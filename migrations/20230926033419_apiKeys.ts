import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('apiKeys', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('key').notNullable();
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('apiKeys');
}

