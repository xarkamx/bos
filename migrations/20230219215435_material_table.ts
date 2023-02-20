import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('materials', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('description').notNullable();
        table.decimal('price').notNullable();
        table.string('unit').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('materials');
}

