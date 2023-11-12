import {type FastifyPluginAsync } from 'fastify';
import { StatsService } from '../../services/stats/StatsService';
import { Siapa } from '../../services/billing/Siapa';

const info:FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
    fastify.route({
        method:'GET',
        url:'/',
        config:{
          auth:{
            roles:['admin']
          }
        },
        async handler(_request,reply){
          const stats = new StatsService();
          const clients = await stats.getAbsoluteNumberOfClients();
          const products = await stats.getAbsoluteNumberOfProducts();
          const orders = await stats.getAbsoluteNumberOfOrders();
          const earnings = await stats.getGlobalEarnings();
          return {
            clients:clients[0].count,
            products:products[0].count,
            orders:orders[0].count,
            earnings
          }
        }
    })

    fastify.route({
      method:'GET',
      url:'/debtors',
      config:{
        auth:{
          roles:['admin','cashier']
        }
      },
      async handler(_request,reply){
        const stats = new StatsService();
        const debtors = await stats.getDebtors();
        return debtors;
      },
    });

    fastify.route({
      method:'GET',
      url:'/products',
      config:{
        auth:{
          roles:['admin','cashier']
        }
      },
      async handler(_request,reply){
        const stats = new StatsService();
        const debtors = await stats.getSalesPerProduct();
        return debtors;
      },
    });

    fastify.route({
      method:'GET',
      url:'/siapa/:code',
      config:{
        auth:{
          roles:['admin','cashier']
        }
      },
      async handler(request:any,reply){
        const {code} = request.params;
        const siapa =  new Siapa();
        return siapa.get(code);
      },
    })


    
    fastify.route({
      method:'GET',
      url:'/siapa',
      config:{
        auth:{
          roles:['admin','cashier']
        }
      },
      async handler(request:any,reply){
        const siapa =  new Siapa();
        return siapa.getAll();
      },
    })

    fastify.route({
      method:'POST',
      url:'/siapa/:code',
      config:{
        auth:{
          roles:['admin','cashier']
        }
      },
      async handler(request:any,reply){
        const {code} = request.params;
        const siapa =  new Siapa();
        await siapa.add(code);
        return siapa.get(code);
      },
    })


}

export default info;