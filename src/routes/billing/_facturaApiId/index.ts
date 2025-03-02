import { BillingService } from '../../../services/billing/BillingService'
import { FacturaApiService } from '../../../services/billing/FacturaApiService'

export default async function  (fastify:any) {
  fastify.route({
    method: 'DELETE',
    url: '/',
    config: {
      auth: {
        roles: ['admin','cashier']
      }
    },
    schema: {
      body: {
        type: 'object',
        properties: {
          motive: {
            type: 'string',
            default: '03'
          }
        }
      }
    },
    async handler (request:any) {
      const { facturaApiId } = request.params
      const { motive } = request.body
      const service = new BillingService(new FacturaApiService())
      return service.cancelInvoice(facturaApiId,motive )
    }
  })

  
  fastify.route({
    method: 'GET',
    url: '/download',
    config: {
      auth: {
        roles: ['admin','cashier']
      }
    },
    async handler (request:any, reply:any) {
      const { facturaApiId } = request.params
      const service = new BillingService(new FacturaApiService())
      const file = service.downloadInvoice(facturaApiId)
      reply.header('Content-Disposition', `attachment; filename=${facturaApiId}.zip`)
      reply.header('Content-Type', 'application/zip')
      return file
    }
  })
}