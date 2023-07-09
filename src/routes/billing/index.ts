import { HttpError } from '../../errors/HttpError';
import { BillingService } from '../../services/billing/BillingService'
import { FacturaApiService } from '../../services/billing/FacturaApiService';
import { ClientService } from '../../services/clients/ClientService';
import { OrderService } from '../../services/orders/OrdersService';

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
          },
         paymentMethod:{
            type: 'string',
            default: 'PUE',
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
      const { orderIds,taxType,paymentType,paymentMethod} = request.body;
      const service = new BillingService(new FacturaApiService());
      const invoice =await service.addInvoice(orderIds,taxType,paymentType,paymentMethod);
      service.sendInvoice(invoice.id,'');
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
    url: '/:billingId/send',
    config: {
      auth: {
        roles: ['admin','cashier'],
      }
    },
    async handler(request:any, reply:any) {
      const { billingId } = request.params;
      const orderService = new OrderService();
      const order = await orderService.getAllOrders({billed:billingId},1,1);
      const service = new BillingService(new FacturaApiService());
      if(!order[0]) {
        throw new HttpError('No se encontro la factura',404);
      }

      return service.sendInvoice(order[0].billed,order[0].email);
    }
  });
}