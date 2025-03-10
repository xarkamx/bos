import { type FastifyPluginAsync } from 'fastify'
import { ProductsService } from '../../services/products/ProductService'

const paymentTypes:FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.route({
    method: 'GET',
    url: '/',
    async handler () {
      const productService = new ProductsService()
      const products = await productService.getAllProducts()
      return products
    }
  })
}

export default paymentTypes