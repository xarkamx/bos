import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('process', (table) => {
    table.increments('id').primary();
    table.integer('product_id').unsigned().notNullable();
    table.float('quantity').unsigned().notNullable();
    table.enum('unit',['kg','units']).notNullable();
    table.text('status').notNullable();
    table.enum('flow',['inflow','outflow']).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('process');
}

