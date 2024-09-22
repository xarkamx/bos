import { db } from '../config/db';
import { snakeCaseReplacer } from '../utils/objectFormat';

export class EmployeeModel{
  public tableName = 'employees';
  public db: any;
  constructor(){
    this.db = db;
  }

    async add(employee: Employee){
        employee = snakeCaseReplacer(employee);
        return this.db(this.tableName).insert(employee);
    }

    async update(id: number, employee: Partial<Employee>){
        employee = snakeCaseReplacer(employee);
        return this.db(this.tableName).where('id', id).update(employee);
    }

    async getEmployeeByEmail(email: string){
        return this.db(this.tableName).where('email', email).first();
    }

    async getEmployeeById(id: number){
        return this.db(this.tableName)
        .where('id', id)
        .select('id','name','email','phone','pto_days as ptoDays','rfc')
        .first();
    }

    getEmployees(){
        return this.db(this.tableName);
    }

    async deleteEmployee(id: number){
        return this.db(this.tableName).where('id', id).delete();
    }
}

type Employee = {
  basId: number;
  name: string;
  email: string;
  phone: string;
  ptoDays: number;
  rfc: string;
}
