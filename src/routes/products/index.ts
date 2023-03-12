import { type FastifyPluginAsync } from 'fastify';
import { ProductsService } from '../../services/products/ProductService';

const products:FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.route({
    method: 'GET',
    url: '/',
    async handler (_request, reply) {
      const productService = new ProductsService();
      const products = await productService.getAllProducts();
      return products;
    },
  });

  fastify.route({
    method: 'POST',
    url: '/',
    schema:{
      body: {
        type: 'object',
        required: ['name', 'price'],
        properties: {
          name: { type: 'string' },
          price: { type: 'number' }
        }
      }
    },
    async handler (_request:any, reply) {
      const productService = new ProductsService();
      const products = await productService.addProduct(_request.body);
      return products;
    },
  });

  fastify.route({
    method: 'DELETE',
    url: '/:id',
    async handler (_request:any, reply) {
      const productService = new ProductsService();
      const products = await productService.deleteProduct(_request.params.id);
      return products;
    }
  });

};

export default products;