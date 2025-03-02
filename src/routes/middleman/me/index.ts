import { ClientService } from '../../../services/clients/ClientService'
import { MiddlemanService } from '../../../services/middleman/MiddlemanService'

export default async function (fastify:any) {
  fastify.route({
    method: 'GET',
    url: '/clients',
    config: {
      auth: {
        roles: ['middleman']
      }
    },
    async handler (request:any) {
      const me = request.user
      const middlemanService = new MiddlemanService()
      return middlemanService.getAllMiddlemanClients(Number(me.user.id))
    }
  })

  fastify.route({
    method: 'GET',
    url: '/payments',
    config: {
      auth: {
        roles: ['middleman']
      }
    },
    async handler (request:any) {
      const me = request.user
      const middlemanService = new MiddlemanService()
      return middlemanService.getMiddlemanPayments(Number(me.user.id))
    }
  })

  fastify.route({
    method: 'POST',
    url: '/clients',
    config: {
      auth: {
        roles: ['middleman']
      }
    },
    schema: {
      body: {
        type: 'object',
        required: ['name','rfc'],
        properties: {
          name: { type: 'string' },
          rfc: { type: 'string' },
          email: { type: 'string' },
          phones: { type: 'array' },
          legal: { type: 'string' },
          postal_code: { type: 'string' },
          tax_system: { type: 'string' }
        }
      }
      
    },
    async handler (request:any) {
      const me = request.user
      const middlemanService = new MiddlemanService()
      const clientsService = new ClientService()
      const [id] = await clientsService.createClient(request.body)
      return middlemanService.addClientToMiddleman(Number(me.user.id),id)
    }
  })
}