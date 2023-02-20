import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  knex.schema.createTable('clients', table => {
    table.text('rfc').primary();
    table.text('name');
    table.boolean('legal');
  })
}


export async function down(knex: Knex): Promise<void> {
  knex.schema.dropTable('clients');
}

