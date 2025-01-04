import { HttpError } from '../../errors/HttpError';
import { ApiKeyModel } from '../../models/ApiKeyModel';
import { BillingService } from '../../services/billing/BillingService'
import { FacturaApiService } from '../../services/billing/FacturaApiService';
import { EmailTemplate } from '../../services/mail/senders/EmailTemplate';
import { OrderService } from '../../services/orders/OrdersService';
import { BasService } from '../../services/users/basService';
import { sendBillingNotification } from '../../utils/mailSender';

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
         },
        },
      },
    },
    config: {
      auth: {
        roles: ['admin','cashier','storer'],
      },
    },
    async handler(request:any, reply:any) {
      const { orderIds,taxType,paymentType,paymentMethod} = request.body;
      const service = new BillingService(new FacturaApiService());
      const invoice =await service.addInvoice(orderIds,taxType,paymentType,paymentMethod);
      service.sendInvoice(invoice.id,'');
      const {user} = request.user;
      sendBillingNotification(user,request.headers.authorization,{
        orderIds,
        folio_number:invoice.folio_number,
        date:invoice.date,
        clientName:invoice.customer.legal_name,
        total:invoice.total,
        payment_method:invoice.payment_method,
      });
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
    method: 'GET',
    url: '/expired',
    config: {
      auth: {
        roles: ['admin','cashier'],
      }
    },
    async handler(request:any, reply:any) {
      const service = new OrderService();
      return service.getOrdersWithExpiredBilling();
    }
  });

  fastify.route({
    method: 'POST',
    url: '/expired',
    config: {
      auth: {
        roles: ['admin','cashier'],
      }
    },
    async handler(request:any, reply:any) {
      const service = new BillingService(new FacturaApiService());
      return service.autoCancelExpiredInvoices();
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
          paymentForm:{
            type:'string',
          },
          amount:{
            type:'number',
          },
          paymentDate:{
            type:'string'
          }
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
      const {billId,paymentForm,amount,paymentDate} = request.body;
      const service = new BillingService(new FacturaApiService());
      const {uuid,total,payment_form} = await service.getBillById(billId);

      if (payment_form !== '99') {
        throw new HttpError('La factura no es de pagos parciales',400);
      }

      const ordersService = new OrderService();
      const resp = await ordersService.getPPDOrdersByBillId(billId);
      return  service.paymentComplement(resp[0].client_id,amount,{
          type:"pago",
         
          data:[{
            payment_form:paymentForm,
            date:paymentDate,
            related_documents:[{
              uuid,
              amount,
              last_balance:total,
              installment:1,
              taxes:[{
                base:amount/0.16,
                type:'IVA',
                rate:0.16,
              }],
            }],
         
        }],
      });
    }
  });
  fastify.route({
    method:'POST',
    url:'/request',
    config: {
      auth: {
       public:true,
      }
    },
    schema:{
      body:{
        type:'object',
        properties:{
          requestId:{
            type:'string',
          },
          status:{
            type:'string',
            default:'pending',
          }
        },
      },
    },
    async handler(request:any, reply:any) {
      const {requestId,status} = request.body;
      const service = new BillingService(new FacturaApiService());
      return service.addRequestId(requestId,status);
    }
  });
  fastify.route({
    method:'GET',
    url:'/request',
    config: {
      auth: {
       public:true,
      }
    },
    async handler(request:any, reply:any) {
      const service = new BillingService(new FacturaApiService());
      return service.getAcceptedRequests();
    }
  });
}