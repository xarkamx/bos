import { ProductsService } from '../../services/products/ProductService';

export default async function (fastify:any){
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      body: {
        type: 'object',
        required: ['productId','quantity','unit','flow'],
        properties: {
          productId: { type: 'number' },
          quantity: { type: 'number' },
          unit: { type: 'string', enum: ['kg','units'] },
          status: { type: 'string',default: 'onProcess' },
          flow: { type: 'string', enum: ['inflow','outflow'] },
        },
      },
    },
    async handler(request:any, reply:any) {
      const service = new ProductsService();
      const resp = await service.addProcess(request.body);
      return resp
    }
  });
  fastify.route({
    method: 'GET',
    url: '/',
    async handler(request:any, reply:any) {
      const service = new ProductsService();
      const resp = await service.getGroupedProcess();
      return resp
    }
  });
}