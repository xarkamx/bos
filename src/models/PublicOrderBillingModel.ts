import { db } from '../config/db'

export class PublicOrderBillingModel {
  findByUuid (uuid: string) {
    return db('orders').where({ public_uuid: uuid }).first()
  }

  async claim (id: number, uuid: string): Promise<boolean> {
    const updated = await db('orders')
      .where({ id, public_uuid: uuid, status: 'paid' })
      .whereNull('deleted_at')
      .whereNull('billed')
      .whereNull('public_billing_attempted_at')
      .update({ public_billing_attempted_at: db.fn.now() })
    return updated === 1
  }
}
