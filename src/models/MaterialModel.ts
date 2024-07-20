import { db } from '../config/db';


export class MaterialModel {
  tableName: string;
  db: any;
  constructor() {
    this.tableName = 'materials';
    this.db = db;
  }

  addMaterial(material: tMaterial) {
    return this.db.transaction(async (trx: any) => {
      const res = await trx.insert(material).into(this.tableName);
      return res;
    });
  }

  getMaterialById(id: number): Promise<tMaterial> {
    return this.db(this.tableName).where({ id }).first();
  }
} 

export type tMaterial = {
  name: string;
  description: string;
  price: number;
  unit: string;
}

