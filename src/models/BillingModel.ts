import { db } from '../config/db'
import { snakeCaseReplacer } from '../utils/objectFormat'

export class BillingModel {
  public tableName = 'billing'
  public db: any
  constructor () {
    this.db = db
  }

  async addBilling (billing: BillingType) {
    billing = snakeCaseReplacer(billing)
    return this.db(this.tableName).insert(billing)
  }

  async getBillingById (id: number) {
    return this.db(this.tableName).where('id', id).first()
  }

  getBillings (query:Partial<BillingType>) {
    query = snakeCaseReplacer(query)
    return this.db(this.tableName).where(query)
  }

  getBillingsByOrderId (orderId: number) {
    const linkedBillingIds = this.db('order_billings')
      .select('billing_id')
      .where({ order_id: orderId })
    return this.db(this.tableName)
      .where({ order_id: orderId })
      .orWhereIn('id', linkedBillingIds)
  }

  async updateBilling (id: number, billing: Partial<BillingType>) {
    billing = snakeCaseReplacer(billing)
    return this.db(this.tableName).where('id', id).update(billing)
  }

}

export type BillingType = {
  externalId: string;
  status: string;
  orderId: number;
  ownerId: number;
  type?: string;
  folio?: string;
}
