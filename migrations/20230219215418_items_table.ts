import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('items', table => {
        table.increments('id').primary();
        table.integer('order_id').notNullable();
        table.integer('product_id').notNullable();
        table.integer('quantity').notNullable();
        table.decimal('price').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('items');
}

