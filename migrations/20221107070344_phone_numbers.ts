import type { Knex } from 'knex';

exports.up =  async function (knex: Knex): Promise<void> {
  return knex.schema.createTable('phone_numbers', (table) => {
    table.increments('id');
    table.string('country_code');
    table.string('phone_number');
    table.enum('type', ['home', 'work', 'mobile', 'other']);
    table.integer('user_id');
    table.timestamps(true, true);
  });
};

exports.down =  async function (knex: Knex): Promise<void> {
  return knex.schema.dropTable('phone_numbers');
};
