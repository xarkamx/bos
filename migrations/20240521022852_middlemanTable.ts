import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('middleman', (table) => {
    table.integer('bas_id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable();
    table.string('address').notNullable();
    table.string('phone').notNullable();
    table.string('rfc').notNullable();
    table.string('bank_name').notNullable();
    table.string('clabe').notNullable();
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('middleman');
}

