import { MaterialServiceV2 } from '../../services/materials/materialsServiceV2'

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
      const service = new MaterialServiceV2()
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
      const service = new MaterialServiceV2()
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
      const service = new MaterialServiceV2()
      return service.getMaterials()
    }
  })

  fastify.route({
    method: 'POST',
    url: '/:id/products',
    config: {
      auth: {
        roles: ['admin', 'cashier', 'storer'],
      },
    },
    schema:{
      body:{
        type: 'array',
        items:{
          type: 'object',
          required: ['productId','quantity'],
          properties:{
            productId: { type: 'number' },
            quantity: { type: 'number' },
          }
        }
      }
    },
    async handler(_request: any, reply: any) {
      const service = new MaterialServiceV2()
      return service.addProductsToMaterial(_request.params.id, _request.body)
    }
  })

  fastify.route({
    method: 'GET',
    url: '/:id/products',
    config: {
      auth: {
        roles: ['admin', 'cashier', 'storer'],
      },
    },
    async handler(_request: any, reply: any) {
      const service = new MaterialServiceV2()
      return service.getProductsByMaterialId(_request.params.id)
    }
  })

  fastify.route({
    method: 'GET',
    url: '/:id',
    config: {
      auth: {
        roles: ['admin', 'cashier', 'storer'],
      },
    },
    async handler(_request: any, reply: any) {
      const service = new MaterialServiceV2()
      return service.getMaterialById(_request.params.id)
    }
  })
  fastify.route({
    method: 'DELETE',
    url: '/:id/products/:productId',
    config: {
      auth: {
        roles: ['admin', 'cashier', 'storer'],
      },
    },
    async handler(_request: any, reply: any) {
      const service = new MaterialServiceV2()
      return service.deleteProductsFromMaterial(_request.params.id, _request.params.productId)
    },
  })
  fastify.route({
    method: 'DELETE',
    url: '/:id',
    config: {
      auth: {
        roles: ['admin', 'cashier', 'storer'],
      },
    },
    async handler(_request: any, reply: any) {
      const service = new MaterialServiceV2()
      return "ToDo"
  }})
  fastify.route({
    method: 'PUT',
    url: '/:id',
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          unit: { type: 'string' },
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

      const service = new MaterialServiceV2()
      reply.code(201)
      return service.updateMaterial(_request.params.id, _request.body)
  }
})
}