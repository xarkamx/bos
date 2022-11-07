/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('phone_numbers', (table) => {
    table.increments('id');
    table.string('country_code');
    table.string('phone_number');
    table.enum('type', ['home', 'work', 'mobile', 'other']);
    table.integer('user_id');
    table.timestamps();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('phone_numbers');
};
