import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('middleman', (table) => {
    table.decimal('comission', 5, 2).defaultTo(0.05);
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('middleman', (table) => {
    table.dropColumn('comission');
  })
}

