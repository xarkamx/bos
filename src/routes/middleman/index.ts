import { config } from 'process';
import { MiddlemanService } from '../../services/middleman/MiddlemanService';
import { BasService } from '../../services/users/basService';

export default async function middleman(fastify: any) {
  fastify.route({
    method: 'POST',
    url: '/',
    config:{
      auth:{
        roles:['admin']
      }
    },
    schema:{
      body:{
        type: 'object',
        required: ['name', 'email', 'password', 'address', 'phone', 'rfc', 'bankName', 'clabe'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string' },
          address: { type: 'string' },
          phone: { type: 'string' },
          rfc: { type: 'string' },
          bankName: { type: 'string' },
          clabe: { type: 'string' }
        }
      }
    },
    async handler(request: any, reply: any) {
      const service = new BasService();
      const middlemanUser = await service.addUser(request.headers.authorization, {
        name: request.body.name,
        email: request.body.email,
        password: request.body.password,
        role: 'middleman'
      });
      

      if(!middlemanUser.userId) {
        throw new Error('Unable to create middleman');
      }

      const middlemanService = new MiddlemanService();
  
      await middlemanService.addMiddleman({
        basId: middlemanUser.userId,
        name: request.body.name,
        email: request.body.email,
        address: request.body.address,
        phone: request.body.phone,
        rfc: request.body.rfc,
        bankName: request.body.bankName,
        clabe: request.body.clabe
      });

      return middlemanService.getMiddlemanById(middlemanUser.userId);
}})

fastify.route({
  method: 'POST',
  url: '/:id/clients/:clientId',
  headers:{
    'Content-Type':'application/x-www-form-urlencoded'
  },
  config:{
    auth:{
      roles:['admin']
    }
  },
  schema:{
    params:{
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number' },
        clientId: { type: 'number' }
      }
    },
  },
  async handler(_request: any, reply: any) {
    const middlemanService = new MiddlemanService();
    return middlemanService.addClientToMiddleman(
      _request.params.id,
      _request.params.clientId
    );
  }
});

fastify.route({
  method: 'GET',
  url: '/:id/orders',
  config:{
    auth:{
      roles:['admin','middleman']
    }
  },
  schema:{
    params:{
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number' }
      }
    },
  },
  async handler(_request: any, reply: any) {
    const middlemanService = new MiddlemanService();
    return middlemanService.getOrdersByMiddlemanId(_request.params.id);
  }
});

fastify.route({
  method: 'GET',
  url: '/',
  config:{
    auth:{
      roles:['admin']
    }
  },
  async handler(_request: any, reply: any) {
    const middlemanService = new MiddlemanService();
    return middlemanService.getAllMiddlemanWithDebt();
  }
});

fastify.route({
  method: 'POST',
  url: '/:id/paid',
  config:{
    auth:{
      roles:['admin']
    }
  },
  schema:{
    body:{
      type: 'object',
      required: ['amount'],
      properties: {
        amount: { type: 'number' }
      }
    },
    params:{
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number' }
      }
    },
  },
  async handler(_request: any, reply: any) {
    const middlemanService = new MiddlemanService();
    return middlemanService.sendPaymentToMiddleman(_request.params.id, _request.body.amount);
  }
});

fastify.route({
  method: 'GET',
  url: '/:id/payments',
  config:{
    auth:{
      roles:['admin']
    }
  },
  schema:{
    params:{
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number' }
      }
    },
  },
  async handler(_request: any, reply: any) {
    const middlemanService = new MiddlemanService();
    return middlemanService.getMiddlemanPayments(_request.params.id);
  }
});

fastify.route({
  method: 'GET',
  url: '/:id/clients',
  config:{
    auth:{
      roles:['admin','middleman']
    }
  },
  schema:{
    params:{
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number' }
      }
    },
  },
  async handler(_request: any, reply: any) {
    const middlemanService = new MiddlemanService();
    return middlemanService.getAllMiddlemanClients(_request.params.id);
  }
});

fastify.route({
  method:'DELETE',
  url:'/:id',
  config:{
    auth:{
      roles:['admin']
    }
  },
  schema:{
    params:{
      type:'object',
      required:['id'],
      properties:{
        id:{type:'number'}
      }
    }
  },
  async handler(_request:any,reply:any){
    const middlemanService = new MiddlemanService();
    const basService = new BasService();
    await basService.removeUserFromCompany(_request.headers.authorization,_request.params.id);
    await  middlemanService.deleteMiddleman(_request.params.id);
    return {success:true}
  }
})
}