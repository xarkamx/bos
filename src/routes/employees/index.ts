import { EmployeesService } from '../../services/employees';


export default async function Employees (fastify: any, opts: any) {
  fastify.route({
    method: 'GET',
    url: '/',
    config: {
      auth:{
        roles:['admin','cashier']
      }
    },
    async handler (request: any, reply: any) {
      const service = new EmployeesService();
      return service.getEmployees();
    }
  });
  fastify.route({
    method: 'POST',
    url: '/',
    config: {
      auth:{
        roles:['admin','cashier']
      } 
    },
    schema: {
      body: {
        type: 'object',
        required: ['name', 'email', 'phone', 'ptoDays', 'rfc', 'salaryPerDay', 'status'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          ptoDays: { type: 'number' },
          rfc: { type: 'string' },
          salaryPerDay: { type: 'number' },
          status: { type: 'string'},
          bankName: { type: 'string'},
          accountNumber: { type: 'string'
        },
      }
    }},
    async handler (request: any, reply: any) {
      const service = new EmployeesService();
      service.setBasJwt(request.headers.authorization);
      return service.createEmployee(request.body);
    }
  })

  fastify.route({
    method: 'POST',
    url: '/:id/pto',
    config: {
      auth:{
        roles:['admin']
      } 
    },
    schema: {
      body: {
        type: 'object',
        properties: {
          ptoType: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
        }
      }
    },
    async handler (request: any, reply: any) {
      const service = new EmployeesService();
      return service.requestPto(request.params.id, {
        ptoType: request.body.ptoType,
        startDate: request.body.startDate,
        endDate: request.body.endDate,
      });
    }
  })

  fastify.route({
    method: 'GET',
    url: '/:id/pto',
    config: {
      auth:{
        roles:['admin']
      } 
    },
    async handler (request: any, reply: any) {
      const service = new EmployeesService();
      return {
        pto: await service.getPTODetails(request.params.id),
        details: await service.getPTODays(request.params.id)
      }
    }
  })

  fastify.route({
    method: 'PUT',
    url: '/pto/:ptoId',
    config: {
      auth:{
        roles:['admin','cashier']
      } 
    },

    schema: {
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['approved', 'rejected'] }
        }
      }
    },
    async handler (request: any, reply: any) {
      const service = new EmployeesService();
      return service.setPTOStatus(request.params.ptoId, request.body.status);
    }
  })

  fastify.route({
    method: 'GET',
    url: '/:id',
    config: {
      auth:{
        roles:['admin','cashier']
      } 
    },
    async handler (request: any, reply: any) {
      const service = new EmployeesService();
      return service.getEmployeeById(request.params.id);
    }
  })

  fastify.route({
    method: 'PUT',
    url: '/:id',
    config: {
      auth:{
        roles:['admin','cashier']
      } 
    },
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          ptoDays: { type: 'number' },
          rfc: { type: 'string' },
          salaryPerDay: { type: 'number' },
          status: { type: 'string'},
          bankName: { type: 'string'},
          accountNumber: { type: 'string'
        },
      }
    }},
    async handler (request: any, reply: any) {
      const service = new EmployeesService();
      return service.updateEmployee(request.params.id, request.body);
    }
  })

  fastify.route({
    method: 'GET',
    url: '/:id/info',
    config: {
      auth:{
        roles:['admin','cashier']
      } 
    },
    async handler (request: any, reply: any) {
      const service = new EmployeesService();
      const employee = await service.getEmployeeById(request.params.id);
      const pto = await service.getPTODays(request.params.id);
      const {total} = await service.getPayrollTotalPerEmployeeId(request.params.id);
      return {
        weeklySalary: employee.salaryPerDay * 6,
        ptoLimit: employee.ptoDays,
        usedPtoDays: pto.usedDays,
        totalIncome: total,
        payments: await service.getPaymentsPerEmployeeId(request.params.id)
      }
    }
  })

}