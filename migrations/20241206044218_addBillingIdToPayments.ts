import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('payments', (table) => {
        table.string('billing_id').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('payments', (table) => {
        table.dropColumn('billing_id');
    });
}

