import type { Knex } from 'knex'

export async function up (knex: Knex): Promise<void> {
  await knex.schema.alterTable('orders', table => {
    table.uuid('public_uuid').nullable().unique()
    table.timestamp('public_billing_attempted_at').nullable().defaultTo(null)
  })
  // No backfill: historical orders must not acquire a public link.
}

export async function down (knex: Knex): Promise<void> {
  await knex.schema.alterTable('orders', table => {
    table.dropUnique(['public_uuid'])
    table.dropColumn('public_uuid')
    table.dropColumn('public_billing_attempted_at')
  })
}
