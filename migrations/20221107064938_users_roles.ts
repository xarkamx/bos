import type { Knex } from 'knex';

exports.up =  async function (knex: Knex): Promise<void> {
  return knex.schema.createTable('users_roles', (table) => {
    table.increments('id');
    table.integer('user_id').notNullable();
    table.integer('role_id').notNullable();
    table.foreign('user_id').references('id').inTable('users');
    table.foreign('role_id').references('id').inTable('roles');
    table.timestamps(true, true);
  });
};

exports.down =  async function (knex: Knex): Promise<void> {
  return knex.schema.dropTable('users_roles');
};
