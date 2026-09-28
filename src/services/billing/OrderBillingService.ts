import { OrderBillingModel, type OrderBillingType } from '../../models/OrderBillingModel'

export class OrderBillingService {
  linkOrdersToBillId (orders: Pick<OrderBillingType, 'orderId' | 'amount'>[], billingId: string) {
    const model = new OrderBillingModel()
    return model.addOrderBillings(orders.map(({ orderId, amount }) => ({
      orderId,
      amount,
      billingId
    })))
  }

  getAllBillsfromOrderIds (orderIds: number[]) {
    const model = new OrderBillingModel()
    return model.getBillsByOrderIds(orderIds)
  }

  unlink (orderIds: number[], billingId: string) {
    const model = new OrderBillingModel()
    return model.unlink(orderIds, billingId)
  }
}
