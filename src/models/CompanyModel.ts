
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

  getCompanyUsers(id: number) {
    return this.db('company_users')
    .select(
      'users.name',
      'users.email',
       'users_domains.id as domain_id',
        'domains.domain as domain_name'
        )
    .rightJoin('users', 'users.id', 'company_users.user_id')
    .rightJoin('company_domains as cd', 'cd.company_id', 'company_users.company_id')
    .leftJoin('users_domains', 'users_domains.user_id', 'users.id')
    .rightJoin('domains', (resp: any)=> {
      resp.on('domains.id', 'users_domains.domain_id')
      .andOn('domains.id', 'cd.domain_id')
    })
    .where({'company_users.company_id':id});
  }

  async getCompanyUserByEmail(id: number, email: string) {
    return this.getCompanyUsers(id).where({email});
  }

  async getCompanyDomains(id: number) {
    return this.db('company_domains')
    .select('domains.domain')
    .rightJoin('domains', 'domains.id', 'company_domains.domain_id')
    .where({'company_domains.company_id':id});
  }
}

export type ICompany = {
  name: string;
  addressId?: number;
}
export type UserWithDomainName = {
  name: string;
  email: string;
  domain_name: string;
  role_name: string;
}