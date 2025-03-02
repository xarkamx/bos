import { BasService } from '../../services/users/basService'

export default async function notifications (fastify: any) {
  fastify.get('/',{
    config: {
      auth: {
        roles: ['notificators']
      }
    }
  }, async ( ) => [])
  fastify.post('/', {
    config: {
      auth: {
        roles: ['notificators']
      }
    },
    schema: {
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          body: { type: 'string' },
          token: { type: 'string' },
          icon: { type: 'string' }
        }
      }
    }
  }, async (request: any) => {
    const service = new BasService()
    return service.sendNotification(request.headers.authorization, request.body)
  })
  fastify.post('/register',{
    config: {
      auth: {
        roles: ['notificators']
      }
    },
    schmea: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string' },
          token: { type: 'string' },
          os: { type: 'string' },
          osVersion: { type: 'string' },
          browser: { type: 'string' },
          brand: { type: 'string' }
        }
      }
    }
  }, async (request: any) => {
    const service = new BasService()
    return service.addDevice(request.headers.authorization, request.body)
  })
}