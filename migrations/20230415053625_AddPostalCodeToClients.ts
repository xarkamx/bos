import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('clients', (table) => {
    table.string('postal_code', 10);
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('clients', (table) => {
    table.dropColumn('postal_code');
  });
}

