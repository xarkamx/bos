import { type FastifyPluginAsync } from 'fastify';
import { ClientService } from '../../services/clients/ClientService';

const clients:FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      body: {
        type: 'object',
        required: ['name', 'phones'],
        properties: {
          rfc: { type: 'string',default: 'XAXX010101000' },
          name: { type: 'string' },
          email: { type: 'string' },
          phones: { type: 'array', items: { type: 'string' } },
          legal: { type: 'boolean', default: false },
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
    async handler (_request:any, reply) {
      const clientService = new ClientService();
      return  clientService.getClients();
    }
  });
};

export default clients;