import { db } from '../config/db';
import { snakeCaseReplacer } from '../utils/objectFormat';

export class PaymentsModel{
  tableName: string;
  db: any;
  constructor() {
    this.tableName = 'payments';
    this.db = db;
  }

  addPayment(payment: IPayment) {
    payment = snakeCaseReplacer(payment);
    return this.db
      .transaction(async (trx: any) => 
      trx.insert(payment).into(this.tableName)
      );
  }

  async getAllPayments(searchObject:any,page: number, limit:number):Promise<IPaymentResponse[]> {
    searchObject = snakeCaseReplacer(searchObject);
    const res =  this.db
      .select(
        'id',
        'order_id as orderId',
        'payment_method as paymentMethod',
        'amount',
        'created_at as createdAt'
      )
      .from(this.tableName)
    if (searchObject) {
      delete searchObject?.page;
      delete searchObject?.limit;
      res.where(searchObject);
    }
    
    if (page && limit) {
      res.limit(limit).offset((page - 1) * limit);
    }

    return res;
  }
}

export type IPayment = {
  orderId: number;
  paymentMethod: number;
  amount: number;
  clientId?: number;
}
type IPaymentResponse = {
  id: number;
  orderId: number;
  paymentMethod: number;
  amount: number;
  createdAt: Date;
}