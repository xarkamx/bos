import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('payroll', table => {
    table.increments('id').primary()
    table.text('name').notNullable()
    table.decimal('salary_per_day',10,2).notNullable()
    table.integer('payment_method').defaultTo(1)
    table.text('status').notNullable()
    table.text('account_number')
    table.text('bank_name')
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('payroll')
}

