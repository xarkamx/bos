import { type Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('metadata_billing', (table)=> {
    table.uuid('uuid').primary();
    table.string('issuer_rfc');
    table.string('issuer_name');
    table.string('receiver_rfc');
    table.string('receiver_name');
    table.string('pac_rfc');
    table.date('issue_date');
    table.date('sat_certification_date');
    table.float('amount');
    table.string('voucher_effect');
    table.string('status');
    table.date('cancellation_date').nullable();
    table.string('payment_status').defaultTo('pending');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('metadata_billing');
}
