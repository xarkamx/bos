import knex from 'knex';
import * as dbConfig from '../../knexfile';
const key:string= process.env.NODE_ENV ?? 'development';
const config:any = dbConfig;
export const db: any = knex(config[key]);
