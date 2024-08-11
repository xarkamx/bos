import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.table('inventory', (table) => {
        table.string('description').defaultTo('');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.table('inventory', (table) => {
        table.dropColumn('description');
    });
}

