import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('payroll', (table) => {
    table.integer('employee_id').notNullable()
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('payroll', (table) => {
    table.dropColumn('employee_id')
  })
}

