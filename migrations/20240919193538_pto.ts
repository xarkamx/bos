import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('pto', (table) => {
    table.increments('id').primary()
    table.string('employee_Id').notNullable()
    table.string('pto_type').notNullable()
    table.date('start_date').notNullable()
    table.date('end_date').notNullable()
    table.string('status').notNullable()
    table.timestamps(true, true)
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('pto')
}

