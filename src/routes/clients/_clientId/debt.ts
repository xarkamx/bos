

import {type FastifyPluginAsync } from 'fastify';
import { ClientService } from '../../../services/clients/ClientService';


const clientDebt:FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
    fastify.route({
        method:'GET',
        url:'/debt',
        config:{
          auth:{
            roles:['cashier','admin','storer']
          }
        },
        async handler(_request:any,reply){
          const clientService = new ClientService();
          return clientService.getDebt(_request.params.clientId);
        }
    })

    fastify.route({
      method:'POST',
      url:'/debt',
      config:{
        auth:{
          roles:['cashier','admin','storer']
        }
      },
      schema:{
        body:{
          type:'object',
          properties:{
            amount:{type:'number'},
            paymentMethod:{type:'number'}
          },
          required:['amount','paymentMethod']
        }
      
      },
      async handler(_request:any,reply){
        const clientService = new ClientService();
        return clientService.payDebt(_request.params.clientId, _request.body.amount, _request.body.paymentMethod);
      }
    });
}

export default clientDebt;