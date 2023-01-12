import type { Knex } from 'knex';

exports.up =  async function (knex: Knex): Promise<void> {
  return knex.schema.createTable('roles', (table) => {
    table.increments('id');
    table.string('name');
    table.integer('company_id');
    table.foreign('company_id').references('id').inTable('companies');
    table.timestamps(true, true);
  });
};

exports.down =  async function (knex: Knex): Promise<void> {
  return knex.schema.dropTable('roles');
};
