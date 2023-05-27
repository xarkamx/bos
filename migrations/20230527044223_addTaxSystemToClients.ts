import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('clients', (table) => {
    table.string('tax_system').defaultTo('601');
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('clients', (table) => {
    table.dropColumn('tax_system');
  });
}

