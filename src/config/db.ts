import knex from 'knex';
import * as dbConfig from '../../knexfile';
export const db: any = knex(dbConfig[process.env.NODE_ENV || 'development']);
