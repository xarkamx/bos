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
           {
            id: 'id',
            employeeId: 'employee_id',
            name: 'name',
            salaryPerDay: 'salary_per_day',
            status: 'status',
            accountNumber: 'account_number',
            bankName: 'bank_name',
            workWeek: 'work_week'
           }
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
    workWeek: number;
}