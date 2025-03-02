import { BasService } from '../../services/users/basService'

import type { FastifyPluginAsync } from 'fastify'

const auth: FastifyPluginAsync = async (fastify): Promise<void> => {

  fastify.route({
    method: 'POST',
    url: '/',
    config: {
      auth: {
        public: true
      }
    },
    schema: {
      body: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          password: { type: 'string' }
        }
      }
    },
    async handler (request:any) {
      const { email, password } = request.body
      const bas = new BasService()
      return bas.auth({ email,password })
    }
  })
}

export default auth