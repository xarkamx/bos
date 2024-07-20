import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('clients', (table) => {
    table.string('bas_id').nullable();
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('clients', (table) => {
    table.dropColumn('bas_id');
  });
}

