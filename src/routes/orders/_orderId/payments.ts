

import {type FastifyPluginAsync } from 'fastify';
import { PaymentsServices } from '../../../services/payments/PaymentsServices';


const orderPayments:FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
    fastify.route({
        method:'GET',
        url:'/payments',
        async handler(_request:any,reply){
          const paymentService = new PaymentsServices();
          return paymentService.getPaymentsByOrderId(_request.params.orderId);
        }
    })
}

export default orderPayments;