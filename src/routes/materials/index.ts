import { MaterialService } from '../../services/materials/materialsService'

export default async function Materials(fastify: any) {
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      body: {
        type: 'object',
        required: ['name', 'description', 'price', 'unit'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          unit: { type: 'string' },
          provider_id: { type: 'number' },
          price: { type: 'number' },
        },
      },
    },
    config: {
      auth: {
        roles: ['admin', 'cashier', 'storer'],
      },
    },
    async handler(_request: any, reply: any) {
      const { name, description, unit, provider_id, price } = _request.body
      const service = new MaterialService()
      reply.code(201)
      return service.createMaterial({ name, description, unit, provider_id, price })
    },
  })
  fastify.route({
    method: 'POST',
    url: '/:id/price',
    schema: {
      body: {
        type: 'object',
        required: ['price'],
        properties: {
          price: { type: 'number' },
          provider_id: { type: 'number' },
        },
      },
    },
    config: {
      auth: {
        roles: ['admin', 'cashier', 'storer'],
      },
    },
    async handler(_request: any, reply: any) {
      const { price, provider_id } = _request.body
      const service = new MaterialService()
      reply.code(201)
      return service.addPrice(_request.params.id, provider_id, price)
    }
  })
  fastify.route({
    method: 'GET',
    url: '/',
    config: {
      auth: {
        roles: ['admin', 'cashier', 'storer'],
      },
    },
    async handler(_request: any, reply: any) {
      const service = new MaterialService()
      return service.getMaterials()
    }
  })
}