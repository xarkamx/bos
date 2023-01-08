import type { Knex } from 'knex';

exports.up =  async function (knex: Knex): Promise<void> {
  return knex.schema.createTable('address', (table) => {
    table.increments('id');
    table.string('ext_number');
    table.string('int_number');
    table.string('street');
    table.integer('city_id');
    table.integer('state_id');
    table.integer('country_id');
    table.point('location').nullable();
    table.string('zip').nullable();
    table.timestamps(true, true);
  });
};

exports.down =  async function (knex: Knex): Promise<void> {
  return knex.schema.dropTable('address');
};
