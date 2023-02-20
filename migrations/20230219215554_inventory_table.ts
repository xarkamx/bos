import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('inventory', table => {
        table.increments('id').primary();
        table.integer('external_id').notNullable();
        table.text('type').notNullable();
        table.integer('quantity').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('inventory');
}

