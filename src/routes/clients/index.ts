import { type FastifyPluginAsync } from 'fastify'
import { ClientService } from '../../services/clients/ClientService'
import { HttpError } from '../../errors/HttpError'
import { FacturaApiService } from '../../services/billing/FacturaApiService'
import { BillingService } from '../../services/billing/BillingService'
import { sendNewClientMailToOwner, sendWelcomeMessageToClient, sendWelcomeMessageToClientAsUser } from '../../utils/mailSender'
import { updateClientSchema } from './schemas/clientSchemas'

const clients:FastifyPluginAsync = async (fastify:any): Promise<void> => {
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
        required: ['name', 'phones', 'postal_code','tax_system'],
        properties: {
          rfc: { type: 'string',default: 'XAXX010101000' },
          name: { type: 'string' },
          email: { type: 'string' },
          phones: { type: 'array', items: { type: 'string' } },
          legal: { type: 'boolean', default: false },
          postal_code: { type: 'string' },
          tax_system: { type: 'string', default: '601' }
        }
      }
    },
    async handler (_request:any) {
      const clientService = new ClientService()
      const clientId = await  clientService.createClient(_request.body)
      const { user } = _request.user
      const client = await clientService.getClient(clientId[0])
      sendNewClientMailToOwner(client, user)
      sendWelcomeMessageToClient(client, user)
      return clientId
    }
  })
  fastify.route({
    method: 'GET',
    url: '/',
    config: {
      auth: {
        roles: ['cashier','storer']
      }
    },
    async handler () {
      const clientService = new ClientService()
      return  clientService.getClients()
    }
  })
  fastify.route({
    method: 'GET',
    url: '/:id',
    config: {
      auth: {
        roles: ['cashier','storer']
      }
    },
    async handler (_request:any) {
      const clientService = new ClientService()
      return  clientService.getClient(_request.params.id)
    }
  })
  fastify.route({
    method: 'PUT',
    url: '/:id',
    config: {
      auth: {
        roles: ['cashier']
      }
    },
    schema: updateClientSchema,
    async handler (_request:any) {
      const clientService = new ClientService()
      
      await clientService.updateClient(_request.params.id, _request.body)
      const client = await clientService.getClient(_request.params.id)
      if (!client) throw new HttpError('Client not found', 404)
      return client 
    }
  })

  fastify.route({
    method: 'POST',
    url: '/credentials',
    config: {
      auth: {
        public: true
      }
    },
    schema: {
      body: {
        type: 'object',
        required: ['email','password'],
        properties: {
          email: { type: 'string' },
          password: { type: 'string' }
        }
      }
    },
    async handler (_request:any) {
      const clientService = new ClientService()
      const client  = await clientService.addCredentials(
        _request.body.email,
        _request.body.password
      )
      
      sendWelcomeMessageToClientAsUser(
        client
      )
      return { message: 'Credentials added', client }
    }
  })
}

export default clients

