import { type FastifyPluginAsync } from 'fastify';
import { ClientService } from '../../services/clients/ClientService';

const clients:FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.route({
    method: 'POST',
    url: '/',
    config:{
      auth:{
        roles:['cashier']
      }
    },
    schema: {
      body: {
        type: 'object',
        required: ['name', 'phones', 'postal_code','tax_system'],
        properties: {
          rfc: { type: 'string',default: 'XAXX010101000' },
          name: { type: 'string' },
          email: { type: 'string' },
          phones: { type: 'array', items: { type: 'string' } },
          legal: { type: 'boolean', default: false },
          postal_code: { type: 'string' },
          tax_system: { type: 'string', default: '601' },
        }
      }
    },
    async handler (_request:any, reply) {
      const clientService = new ClientService();
      return  clientService.createClient(_request.body);
    },
  });
  fastify.route({
    method: 'GET',
    url: '/',
    config:{
      auth:{
        roles:['cashier']
      }
    },
    async handler (_request:any, reply) {
      const clientService = new ClientService();
      return  clientService.getClients();
    }
  });
  fastify.route({
    method: 'GET',
    url: '/:id',
    config:{
      auth:{
        roles:['cashier']
      }
    },
    async handler (_request:any, reply) {
      const clientService = new ClientService();
      return  clientService.getClient(_request.params.id);
    }
  });
  fastify.route({
    method: 'PUT',
    url: '/:id',
    config:{
      auth:{
        roles:['cashier']
      }
    },
    schema: {
      body: {
        type: 'object',
        properties: {
          rfc: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          phones: { type: 'array', items: { type: 'string' } },
          legal: { type: 'boolean' },
          postal_code: { type: 'string' },
        },
      },
    },
    async handler (_request:any, reply) {
      const clientService = new ClientService();
      return  clientService.updateClient(_request.params.id, _request.body);
    }
  });
};

export default clients;