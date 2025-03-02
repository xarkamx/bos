import { PayrollService } from '../../services/payroll/PayrollService'


export default async function Payroll (fastify: any) {
  fastify.route({
    method: 'GET',
    url: '/',
    config: {
      auth: {
        roles: ['admin','cashier']
      }
    },
    async handler () {
      const payrollService = new PayrollService()
      const payrolls = await payrollService.getAllPayrolls()
      return payrolls
    }
  })
  fastify.route({
    method: 'POST',
    url: '/',
    config: {
      auth: {
        roles: ['admin','cashier']
      } 
    },
    schema: {
      body: {
        type: 'object',
        required: ['name', 'salaryPerDay', 'status'],
        properties: {
          name: { type: 'string' },
          salaryPerDay: { type: 'number' },
          status: { type: 'string' },
          accountNumber: { type: 'string' },
          bankName: { type: 'string' },
          workWeek: { type: 'number' }
        }
      }
    },
    async handler (request: any) {
      const payrollService = new PayrollService()
      const payroll = await payrollService.addPayroll(request.body)
      return payroll
    }
  })

  fastify.route({
    method: 'POST',
    url: '/pay',
    config: {
      auth: {
        roles: ['admin','cashier']
      } 
    },
    schema: {
      body: {
        type: 'object',
        required: ['payrollEmployees'],
        properties: {
          payrollEmployees: { 
            type: 'array',
            items: { 
              type: 'object',
              properties: {
                payrollId: { type: 'number' },
                workedDays: { type: 'number', default: 6 }
              }
            }
            
          }
        }
      }
    },
    async handler (request: any) {
      const payrollService = new PayrollService()
      const payroll = await payrollService.pay(request.body.payrollEmployees)
      return payroll
    }
  })
  
  fastify.route({
    method: 'PUT',
    url: '/:id',
    config: {
      auth: {
        roles: ['admin']
      }
    },
    async handler (request: any) {
      const payrollService = new PayrollService()
      const payroll = await payrollService.updatePayroll(request.params.id,request.body)
      return payroll
    }
  })
}