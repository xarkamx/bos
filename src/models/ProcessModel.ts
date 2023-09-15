import { db } from '../config/db';
import { snakeCaseReplacer } from '../utils/objectFormat';

export class ProcessModel{
  public tableName = 'process';
  public db: any;
  constructor(){
    this.db = db;
  }

  addProcess(process: ProcessType){
    process = snakeCaseReplacer(process);
    return this.db(this.tableName).insert(process);
  }

  getAllProcess(){
    return this.db(this.tableName).select('product_id as productId','name','quantity','unit','status','flow')
      .leftJoin('products','products.id','process.product_id');
  }

  getGroupedProcess(){
    return this.getAllProcess().select(
      'name',
      'unit',
      this.db.raw('SUM(quantity) as quantity'),
      'status',
    ).groupBy('product_id','flow','unit');
  }
}

export type ProcessType = {
  productId: number;
  quantity: number;
  unit: string;
  status: string;
  flow: string;
}