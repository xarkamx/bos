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

  getItemsByOrderId(id: number) {
    return this.db
      .select(
        'product_id as productId',
        'name',
        'quantity',
        'items.price as total',
        'products.price as unitPrice'
      )
      .from(this.tableName)
      .leftJoin('products', 'items.product_id', 'products.id')
      .where({ order_id: id });
  }
} 

export type tItem = {
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
};

