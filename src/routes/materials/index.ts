import { MaterialService } from '../../services/Materials';

export async function materials(fastify: any) {
  fastify.route({
    method: 'POST',
    url: '/',
    config: {
      auth: {
        roles: ['admin']
      }
    },
    schema: {
      body: {
        type: 'object',
        required: ['name', 'description', 'price', 'unit'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          unit: { type: 'string' }
        }
      }
    },
    async handler(request: any, reply: any) {
      const service = new MaterialService();
      return service.addMaterial(request.body);
    }
  });

  fastify.route({
    method: 'GET',
    url: '/:id',
    async handler(request: any, reply: any) {
      const service = new MaterialService();
      return service.getMaterialById(request.params.id);
    }
  });
}