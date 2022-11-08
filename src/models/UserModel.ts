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
    const res = await this.db.transaction(async (trx) => {
      user.password = passwordEncrypt(user.password);
      return trx.insert(user).into(this.tableName);
    });
    return res;
  }
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  addressId: number;
}
