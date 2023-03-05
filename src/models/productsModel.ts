import { db } from '../config/db';

export class ProductsModel {
  tableName: string;
  db: any;
  constructor() {
    this.tableName = 'products';
    this.db = db;
  }

  getProductsByIds(ids: number[]) {
    return this.getAllProducts().whereIn('id', ids);
  }

  getAllProducts() {
    return this.db.select('name','price','id').from(this.tableName);
  }
}
export type iProduct = {
  id: number;
  name: string;
  price: number;
}