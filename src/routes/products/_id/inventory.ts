import { type FastifyPluginAsync } from 'fastify'
import { ProductsService } from '../../../services/products/ProductService'



const inventory:FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.route({
    method: 'POST',
    url: '/inventory',
    config: {
      auth: {
        roles: ['storer','cashier']
      }
    },
    schema: {
      body: {
        type: 'object',
        required: ['quantity'],
        properties: {
          quantity: { type: 'number' }
        }
      }
    },
    async handler (_request:any) {
      const productService = new ProductsService()
      const products = await productService.addProductToInventory(_request.params.id, _request.body.quantity)
      return products
    }
  })
}

export default inventory