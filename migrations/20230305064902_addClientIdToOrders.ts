import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('orders', table => {
    table.integer('client_id').notNullable();
    table.dropColumn('rfc');
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('orders', table => {
    table.dropColumn('client_id');
    table.string('rfc').defaultTo('XAXX010101000').notNullable();
  });
}

