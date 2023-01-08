import knex from 'knex';
import { snakeCaseReplacer } from '../utils/objectFormat';
import { db } from '../config/db';
import { passwordEncrypt } from '../utils/passwordUtils';

export class UserModel {
  tableName: string;
  db: any;
  constructor() {
    this.tableName = 'users';
    this.db = db;
  }

  async addUser(user: IUser) {
    user = snakeCaseReplacer(user);
    const res = await this.db.transaction(async (trx: any) => {
      user.password = passwordEncrypt(user.password);
      return trx.insert(user).into(this.tableName);
    });
    return res;
  }

  async getUser(query: queryUser) {
    const table = this.db(this.tableName);
    const element: any = query;
    Object.keys(query).forEach((key) => {
      if(element[key])
      table.orWhere(key, element[key]);
    });
    return table.first();
  }
}

export type IUser = {
  name: string;
  email: string;
  password: string;
  addressId?: number;
}
export type queryUser = {
  id?: number;
  email?: string;
  name?: string;
}