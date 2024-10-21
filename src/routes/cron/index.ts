import { CronService } from '../../services/crons';
import { loadCronService } from '../../services/crons/SettledCronService';

export default async function (fastify:any) {
  fastify.route({
    method: 'GET',
    url: '/',
    config: {
      auth:{
        roles:['admin','cashier']
      } 
    },
    handler: async (request:any, reply:any) => {
      const service = new CronService();
      return service.getCronJobs();
    }
  })

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
        required: ['name', 'schedule', 'status', 'type', 'command'],
        properties: {
          name: { type: 'string' },
          schedule: { type: 'string' },
          status: { type: 'string' },
          type: { type: 'string' },
          command: { type: 'string' },
        }
      }
    },
    handler: async (request:any, reply:any) => {
      const service =  loadCronService();
      return service.addCronJob(request.body);
    }
  })

  fastify.route({
    method:'GET',
    url:'/executable',
    config: {
      auth:{
        roles:['admin','cashier']
      } 
    },
    handler: async (request:any, reply:any) => {
      const service = loadCronService();
      return service.getExecutableCronJobs();
    }
  });

  fastify.route({
    method:'POST',
    url:'/executable',
    config: {
      auth:{
        roles:['admin','cashier']
      } 
    },
    handler: async (request:any, reply:any) => {
      const service = loadCronService();
      return service.executeCronJobs();
    }
  });
}