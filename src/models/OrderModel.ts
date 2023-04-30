
import { db } from '../config/db';
import { snakeCaseReplacer } from '../utils/objectFormat';


export class OrderModel {
  tableName: string;
  db: any;
  constructor() {
    this.tableName = 'orders';
    this.db = db;
  }

  get request() {
    return this.db.from(this.tableName);
  }

  async addOrder(order: any) {
    order = snakeCaseReplacer(order);
    const status = order.total - order.partial_payment < .1? 'paid' : 'pending';
    const res = await this.db
      .transaction(async (trx: any) => 
      trx.insert({...order,status}).into(this.tableName)
      );
    return res;
  }

  getAllOrders(searchObject:any,page: number, limit:number) {
    searchObject = snakeCaseReplacer(searchObject);
    delete searchObject.page;
    delete searchObject.limit;
    const obj:any = {}
    Object.keys(searchObject).forEach((key) => {
      const okey = `${this.tableName}.${key}`
      obj[okey] = searchObject[key]
    });

    const res =  this.db
      .select(
        'id',
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
      res.where(obj);
    }
    
    if (page && limit) {
      res.limit(limit).offset((page - 1) * limit);
    }

    return res;
  }

   getOrderById(id: number) {
    const res =  this.db
      .select(
        'id',
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
    return res;
  }

  async updateOrder(id: number, order: Partial<IOrder>) {
    order = snakeCaseReplacer(order);
    const res = await this.db(this.tableName).where({ id }).update(order);
    return res;
  }

  

  async countOrders() {
    return this.db(this.tableName).count('id as count');
  }

  async deleteOrder(id: number) {
    return this.db(this.tableName).where({ id }).del();
  }
}

export type IOrder ={
  clientId: number;
  total: number;
  discount: number;
  subtotal: number;
  partialPayment: number;
  status?: string;
};

export type IOrderResponse = IOrder & {
  id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};