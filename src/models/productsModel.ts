import { db } from '../config/db';

export class ProductsModel {
  tableName: string;
  db: any;
  constructor() {
    this.tableName = 'products';
    this.db = db;
  }

  getProductsByIds(ids: number[]) {
    return this.db.select('name','price','id').from(this.tableName).whereIn('id', ids);
  }
}
export type iProduct = {
  id: number;
  name: string;
  price: number;
}