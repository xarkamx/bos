import { db } from '../config/db'
import { snakeCaseReplacer } from '../utils/objectFormat'

export class MiddlemanModel {
  public tableName = 'middleman'
  public db: any
  constructor () {
    this.db = db
  }

  async addMiddleman (middleman: MiddlemanType) {
    middleman = snakeCaseReplacer(middleman)
    return this.db(this.tableName).insert(middleman)
  }

  async getAllMiddleman () {
    return this.db(this.tableName).select('*')
  }

  async getAllMiddlemanWithDebt () {

    const amounts = this.db('orders')
      .select('client_id')
      .sum('partial_payment as amount')
      .count('client_id as numberOfOrders')
      .where('status', 'paid')
      .groupBy('client_id')

    const middlemanPayments = this.db('payments')
      .select('external_id')
      .sum('amount as amount')
      .where('payment_type', 'middleman')
      .groupBy('external_id', 'payment_type')

    return this.db.with('amounts', amounts)
      .with('middlemanPayments', middlemanPayments)
      .select(
        this.db.raw('sum(amounts.amount) * middleman.comission as earnings'),
        'middlemanPayments.amount as paid',
        'middleman.name as middlemanName',
        'middleman.bas_id as middlemanId',
        this.db.raw('count(link.client_id) as numberOfClients')
      )
      .from('link')
      .leftJoin('amounts', 'link.client_id', 'amounts.client_id')
      .rightJoin('middleman', 'link.middleman_id', 'middleman.bas_id')
      .leftJoin('middlemanPayments', 'link.middleman_id', 'middlemanPayments.external_id')
      .groupBy('link.middleman_id')
  }

  async getMiddlemanById (id: number) {
    return this.db(this.tableName).where('bas_id', id).first()
  }

  async getMiddlemanByName (name: string) {
    return this.db(this.tableName).where('name', name).first()
  }

  getMiddleOrdersTotal (id: number) {
    return this.db('orders')
      .sum('partial_payment as debt')
      .leftJoin('link', 'link.client_id', 'orders.client_id')
      .where('link.middleman_id', id)
      .andWhere('status', 'paid')
  }

  updateMiddleman (id: number, middleman: Partial<MiddlemanType>) {
    middleman = snakeCaseReplacer(middleman)
    return this.db(this.tableName).where('bas_id', id).update(middleman)
  
  }

  deleteMiddleman (id: number) {
    const delLink = this.db('link').where('middleman_id', id).delete()
    const delMiddleman = this.db(this.tableName).where('bas_id', id).delete()

    return Promise.all([delLink, delMiddleman])
  }

  getAllMiddlemanClients (id: number) {
    return this.db.with(
      'amounts',
      this.db('orders')
        .select('client_id')
        .sum('partial_payment as amount')
        .count('client_id as numberOfOrders')
        .where('status', 'paid')
        .groupBy('client_id')
    ).select('clients.client_id as id','rfc','name','email','phones','postal_code','amount','numberOfOrders')
      .from('link')
      .leftJoin('clients', 'link.client_id', 'clients.client_id')
      .leftJoin('amounts', 'amounts.client_id', 'link.client_id')
      .where('middleman_id', id)
      .orderBy('id', 'desc')
    

  }

  async addClientToMiddleman (middlemanId: number, clientId: any) {
    return this.db('link').insert({ middleman_id: middlemanId, client_id: clientId })
  }

  async getOrdersByMiddlemanId (id: number) {
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
      .select('link.client_id','orders.total','orders.id as orderId','clients.name as client_name','orders.status','orders.created_at','orders.partial_payment','clients.rfc')
      .orderBy('orders.created_at', 'desc')
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