import { HttpError } from '../../../errors/HttpError';
import { ClientService } from '../../../services/clients/ClientService';
import { OrderService } from '../../../services/orders/OrdersService';
import { PaymentsServices } from '../../../services/payments/PaymentsServices';
import { updateClientSchema } from '../schemas/clientSchemas';

export default async function client (fastify: any) {
  fastify.route({
    method: 'GET',
    url: '/orders',
    config:{
      auth:{
        roles:['customer']
      }
    },
    async handler(request: any, reply: any) {
      const {user} = request.user
      const clientService = new ClientService();
      const client = await clientService.getClientByEmail(user.email);
      const orderService = new OrderService();
      return orderService.getOrdersByClientId(client.id);
  }})

  fastify.route({
    method: 'GET',
    url: '/orders/:orderId',
    config:{
      auth:{
        roles:['customer']
      }
    },
    async handler(request: any, reply: any) {
      const {user} = request.user
      const clientService = new ClientService();
      const client = await clientService.getClientByEmail(user.email);
      const orderService = new OrderService();
      const {order,items} = await orderService.getOrderById(request.params.orderId);
      if(order.clientId !== client.id) throw new HttpError('Order not found', 404);
      return {order,items};
  }})

  


  
  


  fastify.route({
    method: 'GET',
    url: '/payments',
    config:{
      auth:{
        roles:['customer']
      }
    },
    async handler(request: any, reply: any) {
      const {user} = request.user
      const paymentsService = new PaymentsServices();
      return paymentsService.getPaymentsByClientId(user.id);
  }})

  fastify.route({
    method: 'GET',
    url: '/',
    config:{
      auth:{
        roles:['customer']
      }
    },
    async handler(request: any, reply: any) {
      const {user} = request.user
      const clientService = new ClientService();
      return clientService.getClientByEmail(user.email);
  }})
  fastify.route({
    method: 'GET',
    url: '/resume',
    config:{
      auth:{
        roles:['customer']
      }
    },
    async handler(request: any, reply: any) {
      const {user} = request.user
      const clientService = new ClientService();
      const client = await  clientService.getClientByEmail(user.email);
      if(!client) throw new HttpError('Client not found', 404);
      return  clientService.getResume(client.id);
      
  }})
  fastify.route({
    method: 'PUT',
    url: '/',
    config:{
      auth:{
        roles:['customer']
      }
    },
    schema:updateClientSchema,
    async handler(request: any, reply: any) {
      const {user} = request.user
      const clientService = new ClientService();
      const client = await  clientService.getClientByEmail(user.email);
      if(!client) return reply.code(404).send({message: 'Client not found'})
      if(request.body.email) {
      throw new HttpError('Your email cannot be updated', 400);
    }
      return clientService.updateClient(client.id, request.body);
  }})
}