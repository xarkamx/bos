import { type FastifyPluginAsync } from 'fastify'
import { PaymentsServices } from '../../services/payments/PaymentsServices'

const payments:FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.route({
    method: 'GET',
    url: '/',
    config: {
      auth: {
        roles: ['cashier']
      }
    },
    async handler (_request:any) {
      const paymentService = new PaymentsServices()
      const products = await paymentService.getAllPayments(
        _request.query,
        _request.query.page,
        _request.query.limit
      )
      return products
    }
  })
  fastify.route({
    method: 'POST',
    url: '/',
    config: {
      auth: {
        roles: ['cashier']
      }
    },
    schema: {
      body: {
        type: 'object',
        required: ['amount', 'paymentType','flow'],
        properties: {
          clientId: { type: 'number' ,default: 0 },
          externalId: { type: 'number' },
          flow: { type: 'string', enum: ['inflow', 'outflow'] },
          paymentType: { type: 'string', enum: ['sale','tax', 'service','refund','rent','order'], default: 'order' },
          description: { type: 'string' },
          paymentMethod: { type: 'number' },
          amount: { type: 'number' }
        }
      }
    },
    async handler (_request:any) {
      const paymentService = new PaymentsServices()
      const products = await paymentService.addPayment(_request.body)
      return products
    }
  })
  fastify.route({
    method: 'DELETE',
    url: '/:id',
    config: {
      auth: {
        roles: ['admin']
      }
    },
    async handler (_request:any) {
      const paymentService = new PaymentsServices()
      return paymentService.deletePayment(_request.params.id)
    }
  })
}

export default payments