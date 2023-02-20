import {type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('orders', table => {
        table.increments('id').primary();
        table.string('rfc').notNullable().defaultTo('XAXX010101000');
        table.decimal('total').notNullable();
        table.decimal('discount').notNullable();
        table.decimal('subtotal').notNullable();
        table.decimal('partial_payment').notNullable().defaultTo(0);
        table.string('status').notNullable();

        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('orders');
}

