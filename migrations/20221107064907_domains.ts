import type { Knex } from 'knex';
exports.up = async function (knex: Knex): Promise<void> {
  return knex.schema.createTable('domains', (table) => {
    table.increments('id');
    table.string('domain').unique().notNullable();
    table.timestamps(true, true);
  });
};

exports.down = async function (knex: Knex): Promise<void> {
  return knex.schema.dropTable('domains');
};
