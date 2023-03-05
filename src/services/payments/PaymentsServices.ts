import { PaymentsModel, type IPayment } from '../../models/PaymentsModel';

export class PaymentsServices {
  async getAllPayments (searchObject:any,page: number, limit:number): Promise<IPayment[]> {
    const paymentModel = new PaymentsModel();
    return paymentModel.getAllPayments(searchObject,page, limit);
  }
}

