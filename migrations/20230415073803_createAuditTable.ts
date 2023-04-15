import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('audit', (table) => {
    table.increments('id').primary();
    table.string('url').notNullable();
    table.string('method').notNullable();
    table.integer('status').notNullable();
    table.string('ip').notNullable();
    table.json('body').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('audit');
}

