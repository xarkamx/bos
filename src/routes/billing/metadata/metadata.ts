import { MetadataBillingService } from '../../../services/billing/MetadataBillingService'


export default async function MetadataBilling (fastify:any) {

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
        type: 'array',
        items: {
          type: 'object',
          properties: {
            uuid: {
              type: 'string'
            },
            issuerRfc: {
              type: 'string'
            },
            issuerName: {
              type: 'string'
            },
            receiverRfc: {
              type: 'string'
            },
            receiverName: {
              type: 'string'
            },
            pacRfc: {
              type: 'string'
            },
            issueDate: {
              type: 'string'
            },
            satCertificationDate: {
              type: 'string'
            },
            amount: {
              type: 'number'
            },
            voucherEffect: {
              type: 'string'
            },
            status: {
              type: 'string'
            },
            cancellationDate: {
              type: 'string'
            },
            paymentStatus: {
              type: 'string'
            }
          },
          required: ['uuid','issuerRfc', 'issuerName']
        }
        
      }
    },
    async handler (request:any) {
      const metadataBilling = request.body
      const service = new MetadataBillingService()
      const result = await service.add(metadataBilling)
      return result
    }
  })

  fastify.route({
    method: 'GET',
    url: '/',
    config: {
      auth: {
        public: true
      }
    },
    async handler () {
      const service = new MetadataBillingService()
      const result = await service.getAll()
      return result
    }
  })
}