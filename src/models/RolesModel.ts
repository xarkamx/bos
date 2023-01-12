import { db } from '../config/db';

export class RolesModel {
  db: any;
  tableName: string;
  constructor() {
    this.db = db;
    this.tableName = 'roles';
  }
  
  async  addRole(role:roleType) {
    const res = await this.db
      .transaction(async (trx: any) => 
      trx.insert({
        name: role.name,
        company_id: role.companyId
      }).into(this.tableName)
      );
    return res;
  }

  async getRole(query:roleType) {
    return this.db(this.tableName).where({
      name: query.name,
      company_id: query.companyId
    }).first();
  }

}
export type roleType = {
  name: string;
  companyId: number;
};