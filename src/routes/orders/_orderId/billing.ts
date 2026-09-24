import { BillingService } from '../../../services/billing/BillingService'
import { FacturaApiService } from '../../../services/billing/FacturaApiService'

const orderBilling = async function (fastify:any) {
  fastify.route({
    method: 'GET',
    url: '/billing',
    config: {
      auth: {
        roles: ['cashier','customer','storer']
      }
    },
    async handler (_request:any) {
      const billingService = new BillingService(new FacturaApiService())
      return billingService.getBillByOrderId(_request.params.orderId)
    }
  })
}

export default orderBilling