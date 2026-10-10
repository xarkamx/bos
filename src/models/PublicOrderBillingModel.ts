import type { Knex } from 'knex'
import { db } from '../config/db'

export class PublicOrderBillingModel {
  findByUuid (uuid: string) {
    return db('orders').where({ public_uuid: uuid }).first()
  }

  async claim (id: number, uuid: string, paymentType: number): Promise<boolean> {
    const updated = await db('orders')
      .where({ id, public_uuid: uuid, payment_type: paymentType })
      .where(function (this: Knex.QueryBuilder) {
        this.where('status', 'paid')
          .orWhere(function (this: Knex.QueryBuilder) { this.where({ status: 'pending', payment_type: 99 }) })
      })
      .whereNull('deleted_at')
      .whereNull('billed')
      .whereNull('public_billing_attempted_at')
      .update({ public_billing_attempted_at: db.fn.now() })
    return updated === 1
  }
}
