
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

  async getAllOrders(searchObject:any,page: number, limit:number):Promise<IOrderResponse[]> {
    searchObject = snakeCaseReplacer(searchObject);
    delete searchObject.page;
    delete searchObject.limit;
    const res =  this.db
      .select(
        'id',
        'client_id as clientId',
        'total',
        'discount',
        'subtotal',
        'partial_payment as partialPayment',
        'payment_type as paymentType',
        'status',
        'created_at as createdAt',
        'updated_at as updatedAt'
      )
      .from(this.tableName)
    if (searchObject) {
      res.where(searchObject);
    }
    
    if (page && limit) {
      res.limit(limit).offset((page - 1) * limit);
    }

    return res;
  }

  async getOrderById(id: number): Promise<IOrderResponse> {
    const res = await this.db
      .select(
        'id',
        'client_id as clientId',
        'total',
        'discount',
        'subtotal',
        'partial_payment as partialPayment',
        'status',
        'created_at as createdAt',
        'updated_at as updatedAt'
      )
      .from(this.tableName)
      .where({ id });
    return res[0];
  }

  async updateOrder(id: number, order: any) {
    order = snakeCaseReplacer(order);
    const res = await this.db(this.tableName).where({ id }).update(order);
    return res;
  }

  async deleteOrder(id: number) {
    // ToDo: Delete order and all related data
  }

  async countOrders() {
    return this.db(this.tableName).count('id as count');
  }
}

export type IOrder ={
  clientId: number;
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