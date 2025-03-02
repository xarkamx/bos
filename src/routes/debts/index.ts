import { DebtService } from '../../services/debts/debtService'

export default async function (fastify:any) {
  fastify.route({
    method: 'GET',
    url: '/owned',
    config: {
      auth: {
        roles: ['admin', 'cashier', 'storer']
      }
    },
    async handler () {
      const debtService = new DebtService()
      return debtService.getOwnedDebt()
    }
  })

  fastify.route({
    method: 'POST',
    url: '/',
    config: {
      auth: {
        roles: ['admin', 'cashier', 'storer']
      }
    },
    schema: {
      body: {
        type: 'object',
        required: ['type', 'amount', 'entity_id'],
        properties: {
          type: { type: 'string', enum: ['client', 'provider'] },
          amount: { type: 'number' },
          status: { type: 'string', enum: ['pending', 'paid', 'canceled'] },
          bill_id: { type: 'string' },
          entity_id: { type: 'number' }
        }
      } },
    async handler (request: any) {
      const debtService = new DebtService()
      return debtService.addDebt(
        request.body
      )
    }
  })
}