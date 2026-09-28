import { db } from '../config/db'
import { snakeCaseReplacer } from '../utils/objectFormat'

export class OrderBillingModel {
  public tableName = 'order_billings'
  public db = db

  async addOrderBilling (orderBilling: OrderBillingType) {
    return this.db(this.tableName).insert(snakeCaseReplacer(orderBilling))
  }

  getByOrderId (orderId: number) {
    return this.db(this.tableName).where({ order_id: orderId })
  }

  getByBillingId (billingId: string) {
    return this.db(this.tableName).where({ billing_id: billingId })
  }

  async addOrderBillings (orderBillings: OrderBillingType[]) {
    if (orderBillings.length === 0) return []
    return this.db(this.tableName).insert(orderBillings.map(snakeCaseReplacer))
  }

  async getBillsByOrderIds (orderIds: number[]) {
    if (orderIds.length === 0) return []
    return this.db(this.tableName)
      .join('billing', `${this.tableName}.billing_id`, 'billing.id')
      .whereIn(`${this.tableName}.order_id`, orderIds)
      .distinct('billing.*')
  }

  async unlink (orderIds: number[], billingId: string) {
    if (orderIds.length === 0) return 0
    return this.db(this.tableName)
      .whereIn('order_id', orderIds)
      .where({ billing_id: billingId })
      .del()
  }
}

export type OrderBillingType = {
  orderId: number;
  amount: number;
  billingId: string;
  createdAt?: Date;
}
