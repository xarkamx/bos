import { PaymentsModel, type IPayment } from '../../models/PaymentsModel';

export class PaymentsServices {
  async getAllPayments (searchObject:any,page: number, limit:number): Promise<IPayment[]> {
    const paymentModel = new PaymentsModel();
    return paymentModel.getAllPayments(searchObject,page, limit).orderBy('id', 'desc');
  }

  async getPaymentsByOrderId (orderId: number): Promise<IPayment[]> {
    const paymentModel = new PaymentsModel();
    return paymentModel.getPaymentsByOrderId(orderId);
  }
  
  async addPayment (payment: IPayment): Promise<IPayment> {
    const paymentModel = new PaymentsModel();
    return paymentModel.addPayment(payment);
  }

  async deletePayment (id: number) {
    const paymentModel = new PaymentsModel();
    return paymentModel.deletePayment(id);
  }

  async cancelPaymentByOrderId (orderId: number) {
    const paymentModel = new PaymentsModel();
    return paymentModel.deletePaymentsByExternalId(orderId);
  }

  async getPaymentsPerReference (reference: PaymentReference) {
    const paymentModel = new PaymentsModel();
    return paymentModel.getAll()
    .where('external_id', reference.externalId)
    .andWhere('flow', reference.flow)
    .andWhere('payment_type', reference.paymentType)
    .orderBy('id', 'desc')
    ;
  }

  async getPaymentsByClientId (clientId: number) {
    const paymentModel = new PaymentsModel();
    return paymentModel.getAll([
      'payments.id',
      'payments.amount',
      'payments.created_at',
      'orders.id as orderId',
    ])
    .leftJoin('orders', 'payments.external_id', 'orders.id')
    .where('orders.client_id', clientId)
    .andWhere('payments.flow', 'inflow')
    .andWhere('payments.payment_type', 'order')
    .andWhere('payments.amount',">", '0')
    .orderBy('payments.id', 'desc')
    ;
  }
}

type PaymentReference = {
  externalId: number,
  paymentType: string,
  flow: string,
}