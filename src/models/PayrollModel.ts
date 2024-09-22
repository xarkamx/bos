import { db } from '../config/db';
import { snakeCaseReplacer } from '../utils/objectFormat';

export class PayrollModel{
  public tableName = 'payroll';
  public db: any;
  constructor(){
    this.db = db;
  }

     getAllPayrolls(){
        return this.db(this.tableName).select(
            'id',
            'name',
            'salary_per_day as salaryPerDay',
            'status',
            'account_number as accountNumber',
            'bank_name as bankName',
            'employee_id as employeeId'
        );
    }

    async add(payroll: PayrollType){
        payroll = snakeCaseReplacer(payroll);
        return this.db(this.tableName).insert(payroll);
    }

    async update(id: number, payroll: Partial<PayrollType>){
        payroll = snakeCaseReplacer(payroll);
        return this.db(this.tableName).where('id', id).update(payroll);
    }

    
}

export type PayrollType = {
    employeeId: number; 
    name: string;
    salaryPerDay: number;
    status: string;
    accountNumber: string;
    bankName: string;
}