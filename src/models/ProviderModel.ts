import { db } from '../config/db';

export class ProviderModel {
  tableName: string;
  db: any;
  constructor() {
    this.tableName = 'providers';
    this.db = db;
  }

  add(provider: IProvider) {
    return this.db(this.tableName).insert(provider);
  }
  
  getAll() {
    return this.db(this.tableName).select('*');
  }
}

export type IProvider = {
  name: string;
  email: string;
  phone: string;
  address: string;
  RFC: string;
}