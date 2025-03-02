import { InventoryService } from '../../services/inventory'
import { MaterialServiceV2 } from '../../services/Materials/materialsServiceV2'

export default async function Materials (fastify: any) {
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
          price: { type: 'number' }
        }
      }
    },
    config: {
      auth: {
        roles: ['admin', 'cashier', 'storer']
      }
    },
    async handler (_request: any, reply: any) {
      const { name, description, unit, provider_id, price } = _request.body
      const service = new MaterialServiceV2()
      reply.code(201)
      return service.createMaterial({ name, description, unit, provider_id, price })
    }
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
          provider_id: { type: 'number' }
        }
      }
    },
    config: {
      auth: {
        roles: ['admin', 'cashier', 'storer']
      }
    },
    async handler (_request: any, reply: any) {
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
        roles: ['admin', 'cashier', 'storer']
      }
    },
    async handler () {
      const service = new MaterialServiceV2()
      return service.getMaterials()
    }
  })

  fastify.route({
    method: 'POST',
    url: '/:id/products',
    config: {
      auth: {
        roles: ['admin', 'cashier', 'storer']
      }
    },
    schema: {
      body: {
        type: 'array',
        items: {
          type: 'object',
          required: ['productId','quantity'],
          properties: {
            productId: { type: 'number' },
            quantity: { type: 'number' }
          }
        }
      }
    },
    async handler (_request: any) {
      const service = new MaterialServiceV2()
      return service.addProductsToMaterial(_request.params.id, _request.body)
    }
  })

  fastify.route({
    method: 'GET',
    url: '/:id/products',
    config: {
      auth: {
        roles: ['admin', 'cashier', 'storer']
      }
    },
    async handler (_request: any) {
      const service = new MaterialServiceV2()
      return service.getProductsByMaterialId(_request.params.id)
    }
  })

  fastify.route({
    method: 'GET',
    url: '/:id/history',
    config: {
      auth: {
        roles: ['admin', 'cashier', 'storer']
      }
    },
    async handler (_request: any) {
      const service = new MaterialServiceV2()
      return service.getMaterialPriceHistory(_request.params.id)
    }
  })

  fastify.route({
    method: 'GET',
    url: '/:id',
    config: {
      auth: {
        roles: ['admin', 'cashier', 'storer']
      }
    },
    async handler (_request: any) {
      const service = new MaterialServiceV2()
      const inventoryService = new InventoryService()
      const materials = await service.getMaterialById(_request.params.id)
      const inventory = await inventoryService.getMaterialInventory(_request.params.id)
      return { ...materials, inventory }
    }
  })
  fastify.route({
    method: 'DELETE',
    url: '/:id/products/:productId',
    config: {
      auth: {
        roles: ['admin', 'cashier', 'storer']
      }
    },
    async handler (_request: any) {
      const service = new MaterialServiceV2()
      return service.deleteProductsFromMaterial(_request.params.id, _request.params.productId)
    }
  })
  fastify.route({
    method: 'DELETE',
    url: '/:id',
    config: {
      auth: {
        roles: ['admin', 'cashier', 'storer']
      }
    },
    async handler () {
      return 'ToDo'
    } })
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
          price: { type: 'number' }
        }
      }
    },
    config: {
      auth: {
        roles: ['admin', 'cashier', 'storer']
      }
    },
    async handler (_request: any, reply: any) {

      const service = new MaterialServiceV2()
      reply.code(201)
      const updated = await service.updateMaterial(_request.params.id, _request.body)
      await service.updateProductsPriceByMaterialId(_request.params.id)

      return updated
    }
  })
}