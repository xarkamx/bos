import type { FastifyPluginAsync } from "fastify";
import { OrderService } from '../../services/orders/OrdersService';

const example: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
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
      const page = _request.query.page || 1;
      const limit = _request.query.limit || 10;
      const orders = await orderService.getAllOrders(_request.query,page,limit);
      return orders;
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

export default example;
