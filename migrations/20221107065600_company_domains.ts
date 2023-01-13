import type { Knex } from 'knex';

exports.up =  async function (knex: Knex): Promise<void> {
  return knex.schema.createTable('company_domains', (table) => {
    table.increments('id');
    table.integer('company_id').unsigned();
    table.integer('domain_id').unsigned();
    table.foreign('company_id').references('id').inTable('companies');
    table.timestamps(true, true);
  });
};

exports.down =  async function (knex: Knex): Promise<void> {
  return knex.schema.dropTable('company_domains');
};
