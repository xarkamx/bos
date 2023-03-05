import { type FastifyPluginAsync } from 'fastify';
import { PaymentsServices } from '../../services/payments/paymentsServices';
import { ProductsService } from '../../services/products/ProductService';

const payments:FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.route({
    method: 'GET',
    url: '/',
    async handler (_request:any, reply) {
      const paymentService = new PaymentsServices();
      const products = await paymentService.getAllPayments(
        _request.query,
        _request.query.page,
        _request.query.limit,
      );
      return products;
    },
  });
};

export default payments;