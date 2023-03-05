import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('payments', table => {
    table.increments('id').primary();
    table.integer('client_id').notNullable();
    table.integer('order_id').notNullable();
    table.integer('amount').notNullable();
    table.integer('payment_method').notNullable();
    table.enum('flow',['inflow','outflow']).notNullable().defaultTo('inflow');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('payments');
}

