import type { Knex } from 'knex'

export async function up (knex: Knex): Promise<void> {
  return knex.schema.createTable('order_billings', (table) => {
    table.integer('order_id').unsigned().notNullable().references('id').inTable('orders')
    table.decimal('amount', 10, 2).notNullable()
    table.integer('billing_id').unsigned().notNullable().references('id').inTable('billing')
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.primary(['order_id', 'billing_id'])
    table.index('billing_id')
  })
}

export async function down (knex: Knex): Promise<void> {
  return knex.schema.dropTable('order_billings')
}
