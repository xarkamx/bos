import { HttpError } from '../../errors/HttpError';
import { ApiKeyModel } from '../../models/ApiKeyModel';
import { BillingService } from '../../services/billing/BillingService'
import { FacturaApiService } from '../../services/billing/FacturaApiService';
import { OrderService } from '../../services/orders/OrdersService';
import { paymentComplementToXml } from './utils';

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

  fastify.route({
    method:'POST',
    url:'/custom',
    config: {
      auth: {
        roles: ['admin','cashier'],
      }
    },
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
         email:{
           type:'string',
         },
        },
      },
    },
    async handler(request:any, reply:any) {

      const { customerId, products, paymentForm,paymentMethod} = request.body;
      const type = request.body.orgTaxSystem || '601';
      let key = '';

      if(type === '606') {
        const apiModel = new ApiKeyModel();
        const api = await apiModel.getApiKeyByName('lease');
        key = api.key;
      }

      const service = new BillingService(new FacturaApiService(key));
      const invoice =await service.customInvoice(customerId,products,{
        paymentForm,
        paymentMethod

      });
      return invoice;

    }
  });

  fastify.route({
    method: 'GET',
    url: '/external/products',
    config: {
      auth: {
        roles: ['admin','cashier'],
      }
    },
    schema: {
      
    },
    async handler(request:any, reply:any) {
      const service = new BillingService(new FacturaApiService());
      return service.getExternalProducts(
        request.query
      );
    }
  });

  fastify.route({
    method:'POST',
    url:'/complement',
    schema:{
      body:{
        type:'object',
        properties:{
          billId:{
            type:'string',
          },
        },
      },
    },
    config: {
      auth: {
        roles: ['admin','cashier'],
      }
    },
    async handler(request:any, reply:any) { 

      // Es necesario que se lleve un registro de pagos parciales facturados
      // para poder calcular cuantos pagos parciales se han hecho
      reply.code(201);
      const {billId,paymentForm,amount} = request.body;
      const service = new BillingService(new FacturaApiService());
      const ordersService = new OrderService();
      const resp = await ordersService.getOrdersByBillId(billId);
      service.customInvoice(resp[0].client_id,[
        {
          quantity:1,
          product:{
            price:amount,
            description:'Pago',
            product_key:'84111506',
          }
        },
      ],{
        paymentForm,
        type:"P",
        complement:[{
          type:"pago",
          data:{
            payment_form:paymentForm,
            related_documentsl:[billId],
          },
        }],
      });
    }
  });
}