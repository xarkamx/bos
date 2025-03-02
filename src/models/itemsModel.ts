import { db } from '../config/db'


export class ItemsModel {
  tableName: string
  db: any
  constructor () {
    this.tableName = 'items'
    this.db = db
  }

  addItems (items: any[]) {
    return this.db.transaction(async (trx: any) => {
      const res = await trx.insert(items).into(this.tableName)
      return res
    })
  }

  getAllItems () {
    return this.db
      .select(
        'product_id as productId',
        'quantity',
        'items.price as total',
        'products.price as unitPrice',
        'name',
        'items.created_at as createdAt'
      )
      .leftJoin('products', 'items.product_id', 'products.id')
      .from(this.tableName)
  }

  getItemsByOrderId (id: number) {
    return this.db
      .select(
        'product_id as productId',
        'name',
        'quantity',
        'items.price as total',
        this.db.raw('(items.price/quantity) as unitPrice')
      )
      .from(this.tableName)
      .leftJoin('products', 'items.product_id', 'products.id')
      .where({ order_id: id })
  }

  deleteItemsByOrderId (id: number) {
    return this.db(this.tableName).where({ order_id: id }).del()
  }
} 

export type tItem = {
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
};

