import { InventoryModel } from '../../models/InventoryModel';
import { ItemsModel } from '../../models/itemsModel';

export class InventoryService {
  async addItemToInventory (id: number, type: string, quantity: number): Promise<any> {
    const inventoryModel = new InventoryModel();
    return inventoryModel.addToInventory(id, type, quantity);
  }

  async getItemsById(id: number): Promise<any> {
    const inventoryModel = new InventoryModel();
    return inventoryModel.getTotalQty(id);
  }

  async getAllItems(type:string): Promise<any> {
    const inventoryModel = new InventoryModel();
    return inventoryModel.getAllItemsByType(type || 'product');
  }

  async getMaterials(): Promise<any> {
    const inventoryModel = new InventoryModel();
    return inventoryModel.getAllByType('materials')
    .groupBy('external_id')
    .sum('quantity as quantity')
    .select('external_id as id', 'materials.description','name','unit','price')
    .join('materials', 'materials.id', 'inventory.external_id');
  }

  async getMaterialInventory(id: number): Promise<any> {
    const inventoryModel = new InventoryModel();
    return inventoryModel.getAllByType('materials')
    .where({ external_id: id })
    .join('materials', 'materials.id', 'inventory.external_id')
    .select(
        'inventory.id',
       'inventory.quantity',
       'inventory.description',
       'inventory.created_at as createdAt',
      )
      .orderBy('inventory.created_at', 'desc')
    ;
  }

  async getAllSoldItems(): Promise<any> {
    const itemsModel = new ItemsModel();
    return itemsModel.getAllItems();
  }

  async getInventoryItemsByProductId(id: number): Promise<any> {
    const inventoryModel = new InventoryModel();
    return inventoryModel.getAllByType('product')
    .where({ external_id: id })
    .join('products', 'products.id', 'inventory.external_id')
    .select(
        'inventory.id',
       'inventory.quantity',
       'inventory.description',
       'inventory.created_at as createdAt',
      )
      .orderBy('inventory.created_at', 'desc')
    ;
  }

  async getItemsByProductId(id: number): Promise<any> {
    const itemsModel = new ItemsModel();
    return itemsModel.getAllItems().where({ "products.id": id });
  }
}