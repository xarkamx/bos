import { db } from '../config/db';
import { snakeCaseReplacer } from '../utils/objectFormat';


export class CompanyModel {
  tableName: string;
  db: any;
  constructor() {
    this.tableName = 'companies';
    this.db = db;
  }

  async addCompany(company: ICompany) {
    company = snakeCaseReplacer(company);
    const res = await this.db
      .transaction(async (trx: any) => 
      trx.insert(company).into(this.tableName)
      );
    return res;
  }

  async addUserToCompany(companyId: number, userId: number) {
    const res = await this.db
      .transaction(async (trx: any) => 
      trx.insert({company_id:companyId, user_id:userId}).into('company_users')
      );
    return res;
  }

  async getCompany(query:any) {
    const table = this.db(this.tableName);
    const element: any = query;
    Object.keys(query).forEach((key) => {
      if(element[key])
      table.orWhere(key, element[key]);
    });
    return table.first();
  }
}

export type ICompany = {
  name: string;
  addressId?: number;
}