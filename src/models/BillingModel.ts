import { db } from '../config/db';
import { snakeCaseReplacer } from '../utils/objectFormat';

export class BillingModel {
  public tableName = 'billing';
  public db: any;
  constructor(){
    this.db = db;
  }

  async addBilling(billing: BillingType) {
    billing = snakeCaseReplacer(billing);
    return this.db(this.tableName).insert(billing);
  }

  async getBillingById(id: number) {
    return this.db(this.tableName).where('id', id).first();
  }

  async getBillings(query:Partial<BillingType>) {
    query = snakeCaseReplacer(query);
    return this.db(this.tableName).where(query);
  }

  async updateBilling(id: number, billing: Partial<BillingType>) {
    billing = snakeCaseReplacer(billing);
    return this.db(this.tableName).where('id', id).update(billing);
  }

}

export type BillingType = {
  externalId: number;
  status: string;
  orderId: number;
  ownerId: number;
}