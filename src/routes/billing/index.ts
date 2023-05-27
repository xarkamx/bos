import { BillingService } from '../../services/billing/BillingService'
import { FacturaApiService } from '../../services/billing/FacturaApiService';

export default async function Billing(fastify:any){
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      body: {
        type: 'object',
        properties: {
          orderIds: {
            type: 'array',
            items: {
              type: 'number',
            },
          },
          taxType:{
            type: 'string',
            default: '601',
          },
        },
      },
    },
    config: {
      auth: {
        roles: ['admin','cashier'],
      },
    },
    async handler(request:any, reply:any) {
      const { orderIds,taxType} = request.body;
      const service = new BillingService(new FacturaApiService());
      return service.addInvoice(orderIds,taxType);
    }
  })

  fastify.route({
    method: 'DELETE',
    url: '/:facturaApiId',
    config: {
      auth: {
        roles: ['admin','cashier'],
      },
    },
    schema: {
      body:{
        type: 'object',
        properties:{
          motive:{
            type: 'string',
            default:'03'
          },
        },
      },
    },
    async handler(request:any, reply:any) {
      const { facturaApiId } = request.params;
      const { motive } = request.body;
      const service = new BillingService(new FacturaApiService());
      return service.cancelInvoice(facturaApiId,motive );
    }
  });
  fastify.route({
    method: 'GET',
    url: '/',
    config: {
      auth: {
        roles: ['admin','cashier'],
      },
    },
    async handler(request:any, reply:any) {
      const {query} = request;
      const service = new BillingService(new FacturaApiService());
      return service.getAllInvoices(query);
    }
  });
}