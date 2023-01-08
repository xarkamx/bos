import type { Knex } from 'knex';

exports.up = async function (knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id');
    table.string('name').unique();
    table.string('email').unique();
    table.string('password');
    table.integer('address_id').nullable();
    table.timestamps(true, true);
  });
};


exports.down = async function (knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
};
