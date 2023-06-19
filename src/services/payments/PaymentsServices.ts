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
}

