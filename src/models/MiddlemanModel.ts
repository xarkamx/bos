import { db } from '../config/db';
import { snakeCaseReplacer } from '../utils/objectFormat';

export class MiddlemanModel {
  public tableName = 'middleman';
  public db: any;
  constructor(){
    this.db = db;
  }

  async addMiddleman(middleman: MiddlemanType) {
    middleman = snakeCaseReplacer(middleman);
    return this.db(this.tableName).insert(middleman);
  }

  async getAllMiddleman() {
    return this.db(this.tableName).select('*');
  }

  async getMiddlemanById(id: number) {
    return this.db(this.tableName).where('bas_id', id).first();
  }

  async getMiddlemanByName(name: string) {
    return this.db(this.tableName).where('name', name).first();
  }

  updateMiddleman(id: number, middleman: Partial<MiddlemanType>) {
    middleman = snakeCaseReplacer(middleman);
    return this.db(this.tableName).where('bas_id', id).update(middleman);
  
  }

  deleteMiddleman(id: number) {
    return this.db(this.tableName).where('bas_id', id).delete();
  }

  getAllMiddlemanClients(id: number) {
    return this.db('link')
    .leftJoin('clients', 'link.client_id', 'clients.client_id')
    .leftJoin('middleman', 'link.middleman_id', 'middleman.bas_id')
    .where('middleman.bas_id', id)
    .select('clients.*');
  }

  async addClientToMiddleman(middlemanId: number, clientId: any) {
    return this.db('link').insert({middleman_id: middlemanId, client_id: clientId});
  }

  async getOrdersByMiddlemanId(id: number) {
    return this.db('link')
    .join(
      'orders',
      'link.client_id',
      'orders.client_id'
    )
    .leftJoin(
      'clients',
      'link.client_id',
      'clients.client_id'
    )
    .where('link.middleman_id', id)
    .select('link.client_id','orders.total','orders.id as orderId','clients.name as client_name','orders.status','orders.created_at','orders.partial_payment','clients.rfc');
  }

}

export type MiddlemanType = {
  basId: number;
  name: string;
  email: string;
  address: string;
  phone: string;
  rfc: string;
  bankName: string;
  clabe: string;
}