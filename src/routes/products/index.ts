import { type FastifyPluginAsync } from 'fastify';
import { ProductsService } from '../../services/products/ProductService';

const products:FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.route({
    method: 'GET',
    url: '/',
   config:{
      auth:{
        roles:['cashier','storer']
      }
    },
    async handler (_request, reply) {
      const productService = new ProductsService();
      const products = await productService.getAllProducts();
      return products;
    },
  });
  fastify.route({
    method: 'GET',
    url: '/inventory',
    config:{
      auth:{
        roles:['cashier','storer','middleman','customer']
      }
    },
    async handler (_request:any, reply) {
      const productService = new ProductsService();
      const products = await productService.getInventory();
      return products[0];
    }
  });
  fastify.route({
    method: 'POST',
    url: '/',
   config:{
      auth:{
        roles:['cashier','storer']
      }
    },
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
   config:{
      auth:{
        roles:['admin']
      }
    },
    async handler (_request:any, reply) {
      const productService = new ProductsService();
      const products = await productService.deleteProduct(_request.params.id);
      return products;
    }
  });
  fastify.route({
    method: 'PUT',
    url: '/:id',
    config:{
      auth:{
        roles:['cashier','storer']
      }
    },
    schema:{
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          price: { type: 'number' }
        }
      },
    },
    async handler (_request:any, reply) {
      const productService = new ProductsService();
      const products = await productService.updateProduct(_request.params.id, _request.body);
      return products;
    }
  })
  fastify.route({
    method: 'GET',
    url: '/:id/info',
    config:{
      auth:{
        roles:['storer','cashier']
      }
    },
    async handler (_request:any, reply) {
      const productService = new ProductsService();
      return productService.getDetailsPerProduct(_request.params.id);
    }
  });
};

export default products;