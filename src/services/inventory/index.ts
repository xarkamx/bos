import { InventoryModel } from '../../models/InventoryModel';

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
    return inventoryModel.getAllItemsByType(type);
  }
}