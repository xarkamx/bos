import { db } from '../config/db';

export class InventoryModel {
  tableName: string;
  db: any;
  constructor() {
    this.tableName = 'inventory';
    this.db = db; 
  }

  async addToInventory(id: number,type:string, quantity: number): Promise<any> {
    return this.db(this.tableName).insert({external_id:id,type, quantity});
  }

  async addInBulkToInventory(items:InventoryItem[]): Promise<any> {
    return this.db(this.tableName).insert(items);
  }

  async getsByIds(ids: number[]): Promise<any> {
    return this.db(this.tableName).select('id', 'quantity').whereIn('external_id', ids);
  }

  async getTotalQty(externalId:number): Promise<number> {
    const result = await this.db(this.tableName).select('quantity').where('external_id', externalId).sum('quantity as quantity').first();
    return result.quantity;
  }

  async updateQuantity(id: number, quantity: number): Promise<any> {
    return this.db(this.tableName).where('id', id).update({quantity});
  }

  async deleteFromInventory(id: number): Promise<any> {
    return this.db(this.tableName).where('id', id).del();
  }

  async deleteAllsFromInventory(): Promise<any> {
    return this.db(this.tableName).del();
  }

  async getAllItemsByType(type:string) {
    const resp = await this.db.raw(`
    with inv as (
      SELECT sum(quantity) as qty ,external_id as product_id, inventory.type FROM inventory where inventory.type ='${type}' group by external_id  
    ), sold as (
      SELECT product_id,sum(quantity) as qty, sum(price) as amount FROM items group by product_id
    )
    SELECT image,id,name, price as unitPrice, inv.qty as inStock, sold.qty as soldUnits, sold.amount as soldAmount from products
    left join inv on inv.product_id = products.id
    left join sold on sold.product_id = products.id;
    `)
    return resp;
  }

}

type InventoryItem ={
  external_id: number;
  quantity: number;
  type: string;
}

