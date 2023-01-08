import type { Knex } from 'knex';

exports.up =  async function (knex: Knex): Promise<void> {
  return knex.schema.createTable('company_domains', (table) => {
    table.increments('id');
    table.integer('company_id');
    table.integer('domain_id');
    table.timestamps(true, true);
  });
};

exports.down =  async function (knex: Knex): Promise<void> {
  return knex.schema.dropTable('company_domains');
};
