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
        'external_id as externalId',
        'payment_method as paymentMethod',
        'payment_type as paymentType',
        'flow',
        'description',
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

  async getAll(columns: string[] = []):Promise<any> {
    return this.db.select(columns).from(this.tableName);
  }

  async deletePayment(id: number) {
    return this.db
      .transaction(async (trx: any) => 
      trx(this.tableName).where('id', id).del()
      );
  }
}

export type IPayment = {
  externalId?: number;
  paymentType?: string;
  paymentMethod: number;
  flow?: string;
  description?: string;
  amount: number;
  clientId?: number;
}
type IPaymentResponse = {
  id: number;
  externalId: number;
  paymentType?: string;
  flow: string;
  description: string;
  paymentMethod: number;
  amount: number;
  createdAt: Date;
}