import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('users_domains', (table) => {
        table.increments('id');
        table.integer('user_id').unsigned().notNullable();
        table.integer('domain_id').unsigned().notNullable();
        table.integer('role_id').nullable();
        table.timestamps(true, true);
        table.foreign('user_id').references('users');
        table.foreign('domain_id').references('domains');
        table.foreign('role_id').references('roles');
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('users_domains');
}

