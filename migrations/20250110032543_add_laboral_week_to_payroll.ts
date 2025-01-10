import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('payroll', (table) => {
    table.integer('work_week').defaultTo(5);
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('payroll', (table) => {
    table.dropColumn('work_week');
  });
}

