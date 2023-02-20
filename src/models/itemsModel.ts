import { db } from '../config/db';


export class ItemsModel {
  tableName: string;
  db: any;
  constructor() {
    this.tableName = 'items';
    this.db = db;
  }

  addItems(items: any[]) {
    return this.db.transaction(async (trx: any) => {
      const res = await trx.insert(items).into(this.tableName);
      return res;
    });
  }
} 

export type tItem = {
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
};

