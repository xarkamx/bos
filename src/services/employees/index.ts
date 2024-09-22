import { HttpError } from '../../errors/HttpError';
import { EmployeeModel } from '../../models/EmployeeModel';
import { PaymentsModel } from '../../models/PaymentsModel';
import { PayrollModel } from '../../models/PayrollModel';
import { PTOModel, PtoStatus } from '../../models/PTOModel';
import { BasService } from '../users/basService';

export class EmployeesService {
  jwt: string = '';
  setBasJwt(jwt: string) {
    this.jwt = jwt;
    return this;
  }
  async createEmployee(employee: Employee) {
    const employeeModel = new EmployeeModel();
    const payroll = new PayrollModel();
    
    const existingEmployee = await employeeModel.getEmployeeByEmail(employee.email);
    if(existingEmployee) {
      throw new HttpError('Employee with this email already exists', 400);
    }
   
    const user=await this.addBasUser(employee);
    const [addedEmployee] = await employeeModel.add({
      basId: user.id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      ptoDays: employee.ptoDays,
      rfc: employee.rfc,
    });

     await payroll.add({
      name: employee.name,
      employeeId: addedEmployee,
      salaryPerDay: employee.salaryPerDay,
      status: employee.status,
      accountNumber: employee.accountNumber,
      bankName: employee.bankName,
    });

    return addedEmployee;
  
  }

  async getEmployeeById(employeeId: number) {
    const employeeModel = new EmployeeModel();
    return employeeModel.getEmployees()
    .join('payroll', 'employees.id', 'payroll.employee_id')
    .select(
      'employees.id',
      'employees.name',
      'employees.email',
      'employees.phone',
      'employees.pto_days as ptoDays',
      'employees.rfc',
      'payroll.salary_per_day as salaryPerDay',
      'payroll.status',
      'payroll.account_number as accountNumber',
      'payroll.bank_name as bankName')
    .where('employees.id', employeeId).first();
  }

  async getEmployees() {
    const employeeModel = new EmployeeModel();
    return employeeModel.getEmployees();
  }

  private async addBasUser (employee: Employee) {
    const bas = new BasService();
    const users = await bas.getUsers(this.jwt);
    let user = users.find((u: any) => u.email === employee.email);
    try {
      if (!user) {
        user=await bas.addUser(this.jwt, {
          name: employee.name,
          email: employee.email,
          password: 'password',
        });
        await bas.addRole(this.jwt, user.userId, 'user');
        user.id=user.userId;
      }
      return user;
    }catch(err:any){
      throw new HttpError('Unable to create a new User',400)
    }
   
  }

  public async requestPto(employeeId: number, pto: PtoType) {
    const employeeModel = new EmployeeModel();
    const employee = await employeeModel.getEmployeeById(employeeId);
    const ptoModel = new PTOModel();
    if(!employee) {
      throw new HttpError('Employee not found', 404);
    }

    const limitDays = employee.ptoDays;
    const range = new Date(pto.endDate).getTime() - new Date(pto.startDate).getTime();
    const days = range / (1000 * 3600 * 24);
    const usedPtoDays = await ptoModel.getUsedPtoDays(employeeId) ?? 0;
    if(days < 1) {
      throw new HttpError('Invalid date range', 400);
    }

    if (days > limitDays - usedPtoDays) {
      throw new HttpError('Not enough PTO days', 400);
    }
    
    ptoModel.add({
      employeeId: employeeId,
      ptoType: pto.ptoType,
      startDate: pto.startDate,
      endDate: pto.endDate,
      status: 'pending',
    });

    return pto
  }

  public async getPTODetails(employeeId: number) {
    const ptoModel = new PTOModel();
    return ptoModel.getPTOByEmployeeId(employeeId);
  }

  public async getUsedPtoDays(employeeId: number) {
    const ptoModel = new PTOModel();
    return ptoModel.getUsedPtoDays(employeeId);
  }

  async getPTODays(employeeId: number) {
    const employeeModel = new EmployeeModel();
    const employee = await employeeModel.getEmployeeById(employeeId);
    if (!employee) {
      throw new HttpError('Employee not found', 404);
    }
    const days = employee.ptoDays;
    return {
      days,
      usedDays: await this.getUsedPtoDays(employeeId),
      remainingDays: days - await this.getUsedPtoDays(employeeId),
    };
  
  }

  async setPTOStatus(ptoId: number, status: PtoStatus) {
    const ptoModel = new PTOModel();
    if(status==='approved'){
      const pto = await ptoModel.getPTOById(ptoId);
      if (!pto) {
        throw new HttpError('PTO not found', 404);
      }
      const getDetails = await this.getPTODays(pto.employee_Id);
      const days = new Date(pto.end_date).getTime() - new Date(pto.start_date).getTime();
      const ptoDays = days / (1000 * 3600 * 24);
      if (ptoDays > getDetails.remainingDays) {
        throw new HttpError('Not enough PTO days', 400);
      }
    }
    await ptoModel.setPTOStatus(ptoId, status);
    const PTO = await ptoModel.getPTOById(ptoId);
    if (!PTO) {
      throw new HttpError('PTO not found', 404);
    }
    return PTO;
  }

  async updateEmployee(employeeId: number, employee: Partial<Employee>) {
    const employeeModel = new EmployeeModel();
    const employeeDetails =  employeeModel.update(employeeId, {
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      ptoDays: employee.ptoDays,
      rfc: employee.rfc
    });
    const payroll = new PayrollModel();
    const payrollDetails = payroll.update(employeeId, {
      name: employee.name,
      salaryPerDay: employee.salaryPerDay,
      status: employee.status,
      accountNumber: employee.accountNumber,
      bankName: employee.bankName,
    });

    return Promise.all([employeeDetails, payrollDetails]);
  }

  async getPayrollTotalPerEmployeeId(employeeId: number) {
    const payroll = new PayrollModel();
    const paymentsModel = new PaymentsModel();
    const {id} = await payroll.getAllPayrolls().where('employee_id', employeeId).first();
    return paymentsModel.getTotal('payroll').where('external_id', id).first();
  }
  
  async getPaymentsPerEmployeeId(employeeId: number) {
    const payroll = new PayrollModel();
    const paymentsModel = new PaymentsModel()
    // this should be a single query
    const {id} = await payroll.getAllPayrolls().where('employee_id', employeeId).first()
    return paymentsModel.getAll().where('external_id', id).where('payment_type', 'payroll').orderBy('id', 'desc')
  }
}

type Employee = {
  name: string;
  email: string;
  phone: string;
  ptoDays: number;
  rfc: string;
  salaryPerDay: number;
  status: string;
  bankName: string;
  accountNumber: string;
}

type PtoType = {
  ptoType: string;
  startDate: string;
  endDate: string;
}