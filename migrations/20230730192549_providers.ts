import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('providers', table => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.string('email').notNullable()
    table.string('phone').notNullable()
    table.string('address').notNullable()
    table.string('RFC').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('providers')
}

