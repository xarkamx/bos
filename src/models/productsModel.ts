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
    return this.db.select('name','price','id','category','description','short_description','image').from(this.tableName);
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

  updateProduct(id: number, product: optionalProduct) {
    return this.db(this.tableName).where('id', id).update(product);
  }

  updateAllPricesIn(increment: number,type='percent') {
    let operation = '+';
    if(type === 'percent') { 
      operation = `* ${increment/100 + 1}`;
    }

    return this.db(this.tableName)
      .update('price', this.db.raw(`price ${operation} ${increment}`));
  }
  getProductById(id: number) {
    return this.db(this.tableName)
    .select('name','price','id','category','description','short_description','image')
    .where('id', id).first();
  }
  getHowManySalesPerProduct(productId:number) {
    return this.db('items')
      .sum('quantity as totalSold')
      .sum('price as totalIncome')
      .select('product_id')
      .where('product_id', productId)
      .groupBy('product_id')
      .first();
  }

  getProductByMaterialId(materialId: number) {
    return this.db('recipes')
      .leftJoin('products', 'recipes.product_id', 'products.id')
      .leftJoin('materials', 'recipes.material_id', 'materials.id')
      .where('material_id', materialId)
      .select('products.name as productName','products.price','products.id','recipes.quantity as requiredQuantity','materials.name','materials.unit')
      .groupBy('products.id');
  }

  getMaterialsPerProduct(productId:number) {
    return this.db('recipes')
      .leftJoin('materials', 'recipes.material_id', 'materials.id')
      .where('product_id', productId)
      .select('recipes.id','materials.name','materials.unit','materials.id as materialId')
      .sum('quantity as requiredQuantity')
      .groupBy('materials.id')
      ;
  }

  getCustomersPerProduct(productId:number) {
    return this.getItemsDetailsPerProduct(productId)
    .groupBy('clients.client_id')
    .select('clients.client_id as clientId','clients.name as clientName','clients.rfc')
    .sum('quantity as totalSold')
    .sum('price as totalIncome')
    .orderBy('totalIncome','desc');
    ;
  }
  getOrdersPerProduct(productId:number) {
    return this.getItemsDetailsPerProduct(productId)
    .select('order_id as orderId','orders.created_at as createdAt','orders.status as status')
    .groupBy('order_id')
    .sum('quantity as totalSold')
    .sum('price as totalIncome')
    .orderBy('orders.created_at','desc');
  }
  getItemsDetailsPerProduct(productId:number) {
    return this.db('items')
      .leftJoin('orders', 'items.order_id', 'orders.id')
      .leftJoin('clients', 'orders.client_id', 'clients.client_id')
      .where('product_id', productId);
  
  }
}
export type iProduct = {
  id: number
} & IAddProduct;

export type IAddProduct = {
  name: string;
  price: number;
};

export type optionalProduct = {
  name?: string;
  price?: number;
}