import { ProviderService } from '../../services/providers/providerService'
const authJson = {
  roles: ['admin', 'cashier','storer']
}
export default async function Providers (fastify:any) {
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      body: {
        type: 'object',
        required: ['name', 'email', 'phone', 'address', 'RFC'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          address: { type: 'string' },
          RFC: { type: 'string' }
        }
      }
    },
    config: {
      auth: authJson
    },
    async handler (_request: any, reply: any) {
      const providerService = new ProviderService()
      reply.code(201)
      return providerService.createProvider(_request.body)
    }
  })
  fastify.route({
    method: 'GET',
    url: '/',
    config: {
      auth: authJson
    },
    async handler () {
      const providerService = new ProviderService()
      return providerService.getProviders()
    }
  })
  fastify.route({
    method: 'GET',
    url: '/:id',
    config: {
      auth: authJson
    },
    async handler (_request: any) {
      const providerService = new ProviderService()
      return providerService.getProviderById(_request.params.id)
    }
  })
}