import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('payments',table=>{
    table.decimal('amount',10,2).alter();
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('payments',table=>{
    table.integer('amount').alter();
  })
}

