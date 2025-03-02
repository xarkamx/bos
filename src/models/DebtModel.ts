import { db } from '../config/db'

export class DebtModel {

  tableName: string
  db: any
  constructor () {
    this.tableName = 'debts'
    this.db = db 
  }
  
  async addDebt (debt: Partial<iDebt>): Promise<any> {

    return this.db(this.tableName).insert(debt)
  }

  async getDebts () {
    return this.db(this.tableName).select('*')
  }

  async getDebtById (id: number) {
    return this.db(this.tableName).select('*').where('id', id).first()
  }

  async getDebtsByEntity (entityId: number) {
    return this.db(this.tableName).select('*').where('entity_id', entityId) 
  }

  async updateDebt (id: number, debt: Partial<iDebt>): Promise<any> {
    return this.db(this.tableName).where({ id }).update(debt)
  }

  async deleteDebt (id: number): Promise<any> {
    return this.db(this.tableName).where({ id }).del()
  }

  async getOwnedDebt (): Promise<number> {
    return this.db(this.tableName).where('type','provider').first()
  }

  async getTotalClientDebt (): Promise<number> {
    return this.db(this.tableName).where('type','client')
  }


}

export type iDebt = {
  type: string;
  amount: number;
  status?: string; 
  bill_id?: string;
  entity_id: number;
}
