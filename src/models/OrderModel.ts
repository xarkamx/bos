
import { db } from '../config/db';
import { snakeCaseReplacer } from '../utils/objectFormat';


export class OrderModel {
  tableName: string;
  db: any;
  constructor() {
    this.tableName = 'orders';
    this.db = db;
  }

  async addOrder(order: IOrder) {
    order = snakeCaseReplacer(order);
    const status = order.total === order.partialPayment ? 'paid' : 'pending';
    const res = await this.db
      .transaction(async (trx: any) => 
      trx.insert({...order,status}).into(this.tableName)
      );
    return res;
  }

  async getAllOrders(searchObject:any,page: number, limit=10):Promise<IOrderResponse[]> {
    searchObject = snakeCaseReplacer(searchObject);
    delete searchObject.page;
    delete searchObject.limit;
    console.log(searchObject)
    const res =  this.db
      .select(
        'id',
        'rfc',
        'total',
        'discount',
        'subtotal',
        'partial_payment as partialPayment',
        'status',
        'created_at as createdAt',
        'updated_at as updatedAt'
      )
      .from(this.tableName)
      .limit(limit)
      .offset((page - 1) * limit);
    if (searchObject) {
      res.where(searchObject);
    }

    return res;
  }
}

export type IOrder ={
  rfc: string;
  total: number;
  discount: number;
  subtotal: number;
  partialPayment: number;
};

export type IOrderResponse = IOrder & {
  id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};