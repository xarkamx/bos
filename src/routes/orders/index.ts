import type { FastifyPluginAsync } from "fastify";
import { OrderService } from '../../services/orders/OrdersService';

const orders: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.route({
    method: "GET",
    url: "/",
    schema: {
      querystring: {
        type: "object",
        properties: {
          rfc: { type: "string" },  // RFC of the customer
          status: { type: "string" },  // Status of the order
          total: { type: "number" },
          id: {type: "number"},
          discount: { type: "number" },  // Discount amount of the order
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
    async handler (_request:any, reply) {
      const orderService = new OrderService();
      const order = await orderService.getOrderById(_request.params.id);
      return order;
    }
  })
  fastify.route({
    method: "PUT",
    url: "/:id/payment",
    schema: {
      body: {
        type: "object",
        properties: {
          payment: { type: "number" },  // Partial payment amount of the order
        },
      },
    },
    async handler (_request:any, reply) {
      // Update partial payment of the order
      const orderService = new OrderService();
      return orderService.pay(_request.params.id, _request.body.payment)
    }
  })
  fastify.route({
    method: "POST",
    url: "/",
    schema: {
      body: {
        type: "object",
        properties: {
          rfc: { type: "string", default:'XAXX010101000'},  // RFC of the customer
          discount: { type: "number" },  // Discount amount of the order
          partialPayment: { type: "number" },  // Partial payment amount of the order
          paymentType: { type: "number", default: 1},
          items: { type: "array" },  // Items of the order
        },
      },
    },
    async handler (_request, reply) {
      const orderService = new OrderService();
      const purchase:any = _request.body;
      const order = await orderService.addOrder(purchase);
      return order;
    }
  })
  fastify.route({
    method: "DELETE",
    url: "/:id",
    async handler (_request, reply) {
      // Delete one order
    }
  })
};

export default orders;
