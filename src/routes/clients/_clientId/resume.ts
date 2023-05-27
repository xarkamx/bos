

import {type FastifyPluginAsync } from 'fastify';
import { ClientService } from '../../../services/clients/ClientService';


const clientResume:FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
    fastify.route({
        method:'GET',
        url:'/resume',
        config:{
          auth:{
            roles:['cashier']
          }
        },
        async handler(_request:any,reply){
          const clientService = new ClientService();
          return clientService.getResume(_request.params.clientId);
        }
    })
}

export default clientResume;