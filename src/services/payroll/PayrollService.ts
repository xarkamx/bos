import { PaymentsModel } from '../../models/PaymentsModel';
import { PayrollModel, type PayrollType } from '../../models/PayrollModel';

export class PayrollService{
    async getAllPayrolls(){
        const payrollModel = new PayrollModel();
        return payrollModel.getAllPayrolls();
    }

    async addPayroll(payroll: PayrollType){
        const payrollModel = new PayrollModel();
        return payrollModel.add(payroll);
    }

    async pay(payrollEmployees: any){
        const payrollModel = new PayrollModel();
        const paymentModel = new PaymentsModel();
        const validPayroll = await payrollModel
          .getAllPayrolls()
            .whereIn('id',payrollEmployees.map((payrollEmployee: any) => payrollEmployee.payrollId))

        if(validPayroll.length === 0){
            throw new Error('Payroll not found');
        }

        const payrollWorked = validPayroll.map((payroll: any) => {
            const payrollEmployee = payrollEmployees.find((payrollEmployee: any) => payrollEmployee.payrollId === payroll.id);
            return {
                ...payroll,
                days: payrollEmployee?.workedDays || 6,
            }
        });
        const payments = payrollWorked.map((payrollEmployee: any) => paymentModel.addPayment({
                externalId: payrollEmployee.id,
                paymentMethod: payrollEmployee.paymentMethod || 1,
                flow: 'outflow',
                description: 'Payroll',
                amount: Math.ceil(payrollEmployee.salaryPerDay * payrollEmployee.days),
                clientId:0
            }))

        return Promise.all(payments);

        
    }

    async updatePayroll(id: number, payroll: Partial<PayrollType>){
        const payrollModel = new PayrollModel();
        return payrollModel.update(id,payroll);
    }
}

