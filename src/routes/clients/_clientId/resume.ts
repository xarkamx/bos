

import { type FastifyPluginAsync } from 'fastify'
import { ClientService } from '../../../services/clients/ClientService'


const clientResume:FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.route({
    method: 'GET',
    url: '/resume',
    config: {
      auth: {
        roles: ['cashier','admin']
      }
    },
    async handler (_request:any) {
      const clientService = new ClientService()
      return clientService.getResume(_request.params.clientId)
    }
  })

  fastify.route({
    method: 'GET',
    url: '/resume/payments',
    config: {
      auth: {
        roles: ['cashier','admin','storer']
      }
    },
    async handler (_request:any) {
      const clientService = new ClientService()
      return clientService.getClientPayments(_request.params.clientId)
    }
  })
}

export default clientResume