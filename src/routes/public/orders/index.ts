import type { FastifyPluginAsync } from 'fastify'
import { PublicOrderInvoiceService } from '../../../services/billing/PublicOrderInvoiceService'

const publicOrderInvoices: FastifyPluginAsync = async (fastify) => {
  fastify.route<{ Params: { uuid: string } }, { auth: { public: boolean } }>({
    method: 'GET',
    url: '/:uuid/invoices.zip',
    // A HEAD probe must never create an invoice.
    exposeHeadRoute: false,
    config: { auth: { public: true } },
    schema: {
      params: {
        type: 'object',
        required: ['uuid'],
        properties: {
          uuid: { type: 'string', pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$' }
        }
      }
    },
    async onRequest (_request, reply) {
      reply.header('Cache-Control', 'private, no-store')
      reply.header('Referrer-Policy', 'no-referrer')
      reply.header('X-Robots-Tag', 'noindex, nofollow, noarchive')
    },
    async handler (request, reply) {
      const uuid = request.params.uuid.toLowerCase()
      const zip = await new PublicOrderInvoiceService().download(uuid)
      return reply
        .type('application/zip')
        .header('Content-Disposition', `attachment; filename="facturas-${uuid}.zip"`)
        .send(zip)
    }
  })
}

export default publicOrderInvoices
