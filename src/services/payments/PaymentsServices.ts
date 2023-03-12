import { PaymentsModel, type IPayment } from '../../models/PaymentsModel';

export class PaymentsServices {
  async getAllPayments (searchObject:any,page: number, limit:number): Promise<IPayment[]> {
    const paymentModel = new PaymentsModel();
    return paymentModel.getAllPayments(searchObject,page, limit);
  }
  
  async addPayment (payment: IPayment): Promise<IPayment> {
    const paymentModel = new PaymentsModel();
    return paymentModel.addPayment(payment);
  }

  async deletePayment (id: number) {
    const paymentModel = new PaymentsModel();
    return paymentModel.deletePayment(id);
  }
}

