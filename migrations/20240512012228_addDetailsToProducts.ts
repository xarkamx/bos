import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('products', table => {
    table.string('description').nullable().defaultTo('general');
    table.string('short_description').nullable().defaultTo('general');
    table.string('image').nullable().defaultTo('https://surtidoraferreteramexicana.com/wp-content/uploads/2023/11/logoFilled.png');
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('products', table => {
    table.dropColumn('description');
    table.dropColumn('short_description');
    table.dropColumn('image');
  })
  
}

