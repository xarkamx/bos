import { HttpError } from '../../errors/HttpError'
import { OrderService } from '../../services/orders/OrdersService'


export default async  function (fastify:any) {
  // Create a new requested Order
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      body: {
        type: 'object',
        properties: {
          clientId: { type: 'number' },  // Client ID
          discount: { type: 'number' },  // Discount amount of the order
          items: { type: 'array' }  // Items of the order
        }
      }
    },
    async handler (request:any) {
      const orderService = new OrderService()
      const purchase:any = request.body
      purchase.paymentType = 99
      purchase.status = 'requested'
      
      const order = await orderService.addOrder(purchase)
      return order
    }
  })
  // Get all requested orders
  fastify.route({
    method: 'GET',
    url: '/',
    async handler (request:any) {
      const orderService = new OrderService()
      return orderService.getAllOrders({ status: 'requested' }, request.query.page, request.query.limit)
    }
  })
  // Update requested orders
  fastify.route({
    method: 'PUT',
    url: '/:id',
    schema: {
      body: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            productId: { type: 'number' },
            quantity: { type: 'number' }
          }
        }
      }
    },
    async handler (request:any) {
      const orderService = new OrderService()
      const { order } = await orderService.getOrderById(request.params.id)
      if (!order) {
        throw new HttpError('Order not found', 404)
      }

      if (order.status !== 'requested') {
        throw new HttpError('Invalid requested order')
      }

      await orderService.removeItemsFromOrder(request.params.id)
      return orderService.addItemsToOrder(request.params.id,request.body)
    }
  })
  // Transfer requested orders to pending

  fastify.route({
    method: 'PUT',
    url: '/:id/transfer',
    async handler (request:any) {
      const orderService = new OrderService()
      const { order,items } = await orderService.getOrderById(request.params.id)
      if (!order) {
        throw new HttpError('Order not found', 404)
      }

      if (order.status !== 'requested') {
        throw new HttpError('Invalid requested order',400 )
      }
      
      await orderService.addItemsToInventory(items)
      return orderService.updateOrder(request.params.id, { status: 'pending' })
    }
  })
}