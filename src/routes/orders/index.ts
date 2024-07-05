import type { FastifyPluginAsync } from "fastify";
import { OrderService } from '../../services/orders/OrdersService';
import { sendNewOrderRequested } from '../../utils/mailSender';

const orders: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.route({
    method: "GET",
    url: "/",
    config:{
      auth:{
        roles:['cashier']
      }
    },
    schema: {
      querystring: {
        type: "object",
        properties: {
          clientId: { type: "string" },  
          status: { type: "string" },  
          total: { type: "number" },
          id: {type: "number"},
          discount: { type: "number" },  
          partialPayment: { type: "number" },
          page: { type: "number" },
          limit: { type: "number" },
        },
      },
    },
    async handler (_request:any, reply) {
      const orderService = new OrderService();
      const {page,limit} = _request.query;
      const orders = await orderService.getAllOrders(_request.query,page,limit);
      return orders;
    }
  })
  fastify.route({
    method: "GET",
    url: "/:id",
    config:{
      auth:{
        roles:['cashier']
      }
    },
    async handler (_request:any, reply) {
      const orderService = new OrderService();
      const order = await orderService.getOrderById(_request.params.id);
      return order;
    }
  })
  fastify.route({
    method: "PUT",
    url: "/:id/payment",
    config:{
      auth:{
        roles:['cashier']
      }
    },
    schema: {
      body: {
        type: "object",
        required: ["payment"],
        properties: {
          payment: { type: "number" },  // Partial payment amount of the order
          paymentMethod: { type: "number", default: 1},
          clientId: { type: "number"},  // Id of the customer
        },
      },
    },
    async handler (_request:any, reply) {
      // Update partial payment of the order
      const {payment,paymentMethod,clientId} = _request.body;
      const orderService = new OrderService();
      return orderService.pay(_request.params.id,clientId, payment, paymentMethod);
    }
  })
  fastify.route({
    method: "POST",
    url: "/",
    config:{
      auth:{
        roles:['cashier']
      }
    },
    schema: {
      body: {
        type: "object",
        properties: {
          clientId: { type: "number"},  // Id of the customer
          discount: { type: "number" },  // Discount amount of the order
          partialPayment: { type: "number" },  // Partial payment amount of the order
          paymentType: { type: "number", default: 1},
          status: { type: "string" },  // Status of the order
          items: { type: "array" },  // Items of the order
        },
      },
    },
    async handler (_request:any, reply) {
      const orderService = new OrderService();
      const purchase:any = _request.body;
      const order = await orderService.addOrder(purchase);
      const orderDetails = await orderService.getOrderById(order?.data?.orderId);
      const {user} = _request.user;
      sendNewOrderRequested(user,_request.headers.authorization,orderDetails);
      return order;
    }
  })
  
  fastify.route({
    method: "POST",
    url: "/request",
    schema: {
      body: {
        type: "object",
        properties: {
          items: { type: "array" },  // Items of the order
          clientId: { type: "number"},  // Id of the customer
        },
      },
    },
    async handler (_request:any, reply) {
      const orderService = new OrderService();
      const purchase:any = _request.body;
      purchase.paymentType = 99;
      purchase.status = 'requested';
      purchase.discount = 0;

      const order = await orderService.addOrder(purchase);
      
      const orderDetails = await orderService.getOrderById(order?.data?.orderId);
      const {user} = _request.user;
      sendNewOrderRequested(user,_request.headers.authorization,orderDetails);
      return order;
    }
  })

  fastify.route({
    method: "DELETE",
    url: "/:id",
    config:{
      auth:{
        roles:['cashier']
      }
    },
    async handler (_request:any, reply) {
      const orderService = new OrderService();
      return orderService.cancelOrder(_request.params.id);
    }
  })
  fastify.route({
    method: "PUT",
    url: "/:id",
    config:{
      auth:{
        roles:['cashier']
      }
    },
    schema: {
      body: {
        type: "object",
        properties: {
          clientId: { type: "number"},
          status: { type: "string" },
          createdAt: { type: "string" },
        },
      },
    },
    async handler (_request:any, reply) {
      const orderService = new OrderService();
      return orderService.updateOrder(_request.params.id,_request.body);
    }
  });  
};

export default orders;
