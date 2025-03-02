import { type FastifyPluginAsync } from 'fastify'
import { InventoryService } from '../../services/inventory'
import { MaterialService } from '../../services/Materials'
import { HttpError } from '../../errors/HttpError'



const inventory:FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.route({
    method: 'POST',
    url: '/',
    config: {
      auth: {
        roles: ['cashier','storer']
      }
    },
    schema: {
      body: {
        type: 'object',
        required: ['quantity'],
        properties: {
          quantity: { type: 'number' },
          external_id: { type: 'number' },
          type: { type: 'string' }
        }
      }
    },
    async handler (_request:any) {
      const inventoryService = new InventoryService()
      const { external_id,type,quantity } = _request.body
      const inv = await inventoryService.addItemToInventory(external_id,type,quantity)
      if (type === 'product') {
        const materialService = new MaterialService()
        await materialService.consumeMaterial(external_id,quantity)
      }
      return inv
     
    }
  })

  fastify.route({
    method: 'GET',
    url: '/materials',
    async handler () {
      const inventoryService = new InventoryService()
      return inventoryService.getMaterials()
    }
  })

  fastify.route({
    method: 'POST',
    url: '/products',
    config: {
      auth: {
        roles: ['cashier','storer']
      }
    },
    schema: {
      body: {
        type: 'object',
        required: ['quantity'],
        properties: {
          quantity: { type: 'number' },
          product_id: { type: 'number' }
        }
      }
    },
    async handler (_request:any) {
      const inventoryService = new InventoryService()
      const { product_id,quantity } = _request.body
      const inv = await inventoryService.addItemToInventory(product_id,'product',quantity)
      return inv
    }
  })

  fastify.route({
    method: 'POST',
    url: '/materials',
    config: {
      auth: {
        roles: ['cashier','storer']
      }
    },
    schema: {
      body: {
        type: 'object',
        required: ['quantity'],
        properties: {
          quantity: { type: 'number' },
          materialId: { type: 'number' }
        }
      }
    },
    async handler (_request:any) {
      const inventoryService = new InventoryService()
      const materialService = new MaterialService()
      const { materialId,quantity } = _request.body
      const materialExists = await materialService.getMaterialById(materialId)
      if (!materialExists) {
        throw new HttpError('Material does not exist',404)
      }
      return inventoryService.addItemToInventory(materialId,'materials',quantity)
    }
  })


  fastify.route({
    method: 'GET',
    url: '/',
    async handler (_request:any) {
      const inventoryService = new InventoryService()
      return inventoryService.getAllItems(_request.query.type)
    }
  })

  fastify.route({
    method: 'GET',
    url: '/items',
    config: {
      auth: { 
        roles: ['cashier','admin','storer']
      }
    },
    async handler () {
      const inventoryService = new InventoryService()
      return inventoryService.getAllSoldItems()
    }
  })

  fastify.route({
    method: 'GET',
    url: '/items/:product_id',
    config: {
      auth: { 
        roles: ['cashier','admin','storer']
      }
    },
    async handler (_request:any) {
      const inventoryService = new InventoryService()
      return inventoryService.getItemsByProductId(_request.params.product_id)
    }
  })

  fastify.route({
    method: 'GET',
    url: '/history/:product_id',
    config: {
      auth: { 
        roles: ['cashier','admin','storer']
      }
    },
    async handler (_request:any) {
      const inventoryService = new InventoryService()
      return inventoryService.getInventoryItemsByProductId(_request.params.product_id)
    }
  })

}

export default inventory