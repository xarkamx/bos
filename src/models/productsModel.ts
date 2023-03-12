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

  countProducts() {
    return this.db(this.tableName).count('id as count');
  }

  addProduct(product: IAddProduct) {
    return this.db(this.tableName).insert(product);
  }

  deleteProduct(id: number) {
    return this.db(this.tableName).where('id', id).del();
  }
}
export type iProduct = {
  id: number
} & IAddProduct;

export type IAddProduct = {
  name: string;
  price: number;
};