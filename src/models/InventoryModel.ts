import { db } from '../config/db'

export class InventoryModel {
  tableName: string
  db: any
  constructor () {
    this.tableName = 'inventory'
    this.db = db 
  }

  async addToInventory (id: number,type:string, quantity: number,description = 'inventory'): Promise<any> {
    return this.db(this.tableName).insert({ external_id: id,type, quantity,description })
  }

  async addInBulkToInventory (items:InventoryItem[]): Promise<any> {
    return this.db(this.tableName).insert(items)
  }

  getsByIds (ids: number[]): Promise<any> {
    return this.db(this.tableName).select('id', 'quantity').whereIn('external_id', ids)
  }

  async getTotalQty (externalId:number): Promise<number> {
    const result = await this.db(this.tableName).select('quantity').where('external_id', externalId).sum('quantity as quantity').first()
    return result.quantity
  }

  async updateQuantity (id: number, quantity: number): Promise<any> {
    return this.db(this.tableName).where('id', id).update({ quantity })
  }

  async deleteFromInventory (id: number): Promise<any> {
    return this.db(this.tableName).where('id', id).del()
  }

  async deleteAllsFromInventory (): Promise<any> {
    return this.db(this.tableName).del()
  }

  async getAllItemsByType (type:string) {
    return this.db.raw(`
    SELECT 
    p.image, 
    p.id, 
    p.name, 
    p.price as unitPrice, 
    p.description,
    p.short_description as shortDescription,
    inv.qty as inStock, 
    sold.qty as soldUnits, 
    sold.amount as soldAmount,
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'materialId', m.id, 
                'name', m.name, 
                'unit', m.unit,
                'quantity', r.quantity,
                'price', m.price
            )
        )
        FROM recipes r
        JOIN materials m ON m.id = r.material_id
        WHERE r.product_id = p.id
    ) as materials
FROM 
    products p
LEFT JOIN 
    (
        SELECT 
            sum(quantity) as qty, 
            external_id as product_id, 
            inventory.type 
        FROM 
            inventory 
        WHERE 
            inventory.type = '${type}' 
        GROUP BY 
            external_id
    ) as inv ON inv.product_id = p.id
LEFT JOIN 
    (
        SELECT 
            product_id,
            sum(quantity) as qty, 
            sum(price) as amount 
        FROM 
            items 
        GROUP BY 
            product_id
    ) as sold ON sold.product_id = p.id;
    `)
  }

  getAllByType (type:string) {
    return this.db(this.tableName).where('type', type)
  }

}

type InventoryItem ={
  external_id: number;
  quantity: number;
  type: string;
}

