import type { Knex } from 'knex';

exports.up =  async function (knex: Knex): Promise<void> {
  return knex.schema.createTable('company_users', (table) => {
    table.increments('id');
    table.integer('user_id');
    table.integer('company_id');
    table.foreign('user_id').references('users.id');
    table.timestamps(true, true);
  });
};

exports.down =  async function (knex: Knex): Promise<void> {
  return knex.schema.dropTable('company_users');
};
