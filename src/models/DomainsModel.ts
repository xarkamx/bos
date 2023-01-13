import { db } from '../config/db';

export class DomainModel {
  readonly db: any;
  table;
  constructor(){
    this.db = db
    this.table = 'domains';
  }

  async addDomain(name: string) {
    const res = await this.db.transaction(async (trx: any) => 
      trx.insert({domain:name}).into(this.table)
    );
    return res;
  }

  async getDomainById(id:number) {
    const res = await this.db(this.table).where({id}).first();
    return res;
  }

  async addDomainToCompany(domainId: number, companyId: number) {
    return this.db
      .transaction(async (trx: any) => 
        trx.insert({domain_id:domainId, company_id:companyId}).into('company_domains')
        );
  }

  async addDomainToUser(domainId: number, userId: number) {
    return this.db
      .transaction(async (trx: any) => 
        trx.insert({domain_id:domainId, user_id:userId}).into('users_domains')
        );
  }
}
