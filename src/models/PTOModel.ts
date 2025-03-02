import { db } from '../config/db'
import { snakeCaseReplacer } from '../utils/objectFormat'

export class PTOModel {
  public tableName = 'pto'
  public db: any
  constructor () {
    this.db = db
  }

  async add (pto: PTO) {
    pto = snakeCaseReplacer(pto)
    return this.db(this.tableName).insert(pto)
  }

  async update (id: number, pto: Partial<PTO>) {
    pto = snakeCaseReplacer(pto)
    return this.db(this.tableName).where('id', id).update(pto)
  }

  async getPTOById (id: number) {
    return this.db(this.tableName).where('id', id).first()
  }

  async getPTOByEmployeeId (employeeId: number) {
    return this.db(this.tableName)
      .where('employee_id', employeeId)
      .where('end_date', '>=', this.db.raw('DATE(CONCAT(YEAR(NOW()), "-01-01"))'))
      .select('id','pto_type as ptoType','start_date as startDate','end_date as endDate','status')
      .orderBy('start_date', 'asc')
        
  }

  async deletePTO (id: number) {
    return this.db(this.tableName).where('id', id).delete()
  }

  async getUsedPtoDays (employeeId: number) {
    const usedPtoDays = await this.db('pto')
      .where('employee_id', employeeId)
      .where('status', 'approved')
      .where('end_date', '>=', this.db.raw('DATE(CONCAT(YEAR(NOW()), "-01-01"))'))
      .select(this.db.raw('SUM(DATEDIFF(end_date, start_date)) as days'))
      .first()
    
    return usedPtoDays.days || 0
  }

  async setPTOStatus (id: number, status: PtoStatus) {
    return this.db(this.tableName).where('id', id).update({ status })
  }
}

type PTO = {
    employeeId: number;
    ptoType: string;
    startDate: string;
    endDate: string;
    status: string;
}

export enum PtoStatus {
    APPROVED = 'approved',
    PENDING = 'pending',
    REJECTED = 'rejected'
}