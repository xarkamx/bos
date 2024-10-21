import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('cronjobs', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('schedule').notNullable();
        table.string('status').notNullable();
        table.string('type').defaultTo('cron');
        table.string('command').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('executed_at').defaultTo(knex.fn.now());
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('cronjobs');
}

