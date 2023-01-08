import type { Knex } from 'knex';

exports.up = async function (knex: Knex): Promise<void> {
  return knex.schema.createTable('companies', (table) => {
    table.increments('id');
    table.string('name');
    table.integer('address_id');
    table.timestamps(true, true);
  });
};


exports.down = async function (knex: Knex): Promise<void> {
  return knex.schema.dropTable('companies');
};
