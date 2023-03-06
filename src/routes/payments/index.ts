import { type FastifyPluginAsync } from 'fastify';
import { PaymentsServices } from '../../services/payments/PaymentsServices';

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
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      body: {
        type: 'object',
        required: ['amount', 'paymentType','flow'],
        properties: {
          clientId: { type: 'number' ,default: 0},
          externalId: { type: 'number' },
          flow: { type: 'string', enum: ['inflow', 'outflow'] },
          paymentType: { type: 'string', enum: ['sale','tax', 'service','refund','rent'] },
          description: { type: 'string' },
          paymentMethod: { type: 'number' },
          amount: { type: 'number' },
        },
      },
    },
    async handler (_request:any, reply) {
      const paymentService = new PaymentsServices();
      const products = await paymentService.addPayment(_request.body);
      return products;
    }
  });
};

export default payments;