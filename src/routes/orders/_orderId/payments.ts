

import {type FastifyPluginAsync } from 'fastify';
import { PaymentsServices } from '../../../services/payments/PaymentsServices';
import { OrderService } from '../../../services/orders/OrdersService';


const orderPayments:FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
    fastify.route({
        method:'GET',
        url:'/payments',
        config:{
          auth:{
            roles:['cashier','customer']
          }
        },
        async handler(_request:any,reply){
          const paymentService = new PaymentsServices();
          return paymentService.getPaymentsByOrderId(_request.params.orderId);
        }
    })

    fastify.route({
        method:'DELETE',
        url:'/payments',
        config:{
          auth:{
            roles:['cashier','admin']
          }
        },
        async handler(_request:any,reply){
          const paymentService = new PaymentsServices();
          const ordersService = new OrderService();
          await ordersService.updateOrder(_request.params.orderId,{status:'pending',partialPayment:0});
          return paymentService.cancelPaymentByOrderId(_request.params.orderId);
        }
    });
}

export default orderPayments;