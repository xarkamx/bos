import { db } from '../config/db';
import { snakeCaseReplacer } from '../utils/objectFormat';

export class BillableServicesModel {
  public tableName = 'billableServices';
  public db: any;
  constructor(){
    this.db = db;
  }

  async add(data:BillableServiceType){
    const [id] = await this.db(this.tableName).insert(data);
    return id;
  }

  getByName(name:string){
    return this.db(this.tableName).where({name});
  }

  getById(id:number){
    return this.db(this.tableName).where({id}).first();
  }

  getAll(){
    return this.db(this.tableName);
  }
}

export type BillableServiceType = {
  name:string;
  code:string;
}