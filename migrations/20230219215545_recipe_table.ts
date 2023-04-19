import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('recipes', table => {
        table.increments('id').primary();
        table.integer('product_id').notNullable();
        table.integer('material_id').notNullable();
        table.integer('quantity').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('recipes');
}

