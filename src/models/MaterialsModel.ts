import { db } from '../config/db';

export class MaterialModel {
  tableName: string;
  db: any;
  listTableName: string;
  constructor() {
    this.tableName = 'materials';
    this.listTableName = 'materials_price_list';
    this.db = db;
  }

  async createMaterial(material: Partial<tMaterial>) {
    return this.db(this.tableName).insert(material);
  }
  
  async addPrice(materialId:number,providerId:number,price:number) {
    return this.db(this.listTableName).insert({material_id:materialId,price,provider_id:providerId});
  }

  getAll() {
    return this.db(this.tableName);
  }
}

export type tMaterial = {
  name: string;
  description: string;
  unit: string;
  provider_id: number;
  price: number;
}


