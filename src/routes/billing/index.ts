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
          paymentType:{
            type: 'string',
          }
        },
      },
    },
    config: {
      auth: {
        roles: ['admin','cashier'],
      },
    },
    async handler(request:any, reply:any) {
      const { orderIds,taxType,paymentType} = request.body;
      const service = new BillingService(new FacturaApiService());
      const invoice =await service.addInvoice(orderIds,taxType,paymentType);
      service.sendInvoice(invoice.id);
      return invoice;
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

  fastify.route({
    method: 'GET',
    url: '/:facturaApiId/download',
    config: {
      auth: {
        roles: ['admin','cashier'],
      }
    },
    async handler(request:any, reply:any) {
      const { facturaApiId } = request.params;
      const service = new BillingService(new FacturaApiService());
      const file= service.downloadInvoice(facturaApiId);
      reply.header('Content-Disposition', `attachment; filename=${facturaApiId}.zip`);
      reply.header('Content-Type', 'application/zip');
      return file;
    }
  });

  fastify.route({
    method: 'GET',
    url: '/:facturaApiId/send',
    config: {
      auth: {
        roles: ['admin','cashier'],
      }
    },
    async handler(request:any, reply:any) {
      const { facturaApiId } = request.params;
      const service = new BillingService(new FacturaApiService());
      return service.sendInvoice(facturaApiId);
    }
  });
}