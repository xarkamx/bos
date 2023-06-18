import { ClientService } from '../../../services/clients/ClientService';
import { HttpError } from '../../../errors/HttpError';
import { BillingService } from '../../../services/billing/BillingService';
import { FacturaApiService } from '../../../services/billing/FacturaApiService';

export default async function validate(fastify:any){
  fastify.route({
    method:'GET',
    url:'/validate',
    config:{
      auth:{
        roles:['cashier','admin']
      }
    },
    async handler(_request:any){
      const {clientId} = _request.params;
      const clientService = new ClientService();
      const client = await clientService.getClient(clientId);
      if(!client) throw new HttpError('Client not found', 404);
      const validate = [
        client.rfc,
        client.name,
        client.email,
        client.postal_code
      ].every((value) => value);
      if(!validate) throw new HttpError('Client is not valid', 400);
      const billingService = new BillingService(new FacturaApiService());
      
      if(client.legal && client.legal !== '0') {
        await billingService.validateClient(client.legal);
        return {
          valid: true,
          legal: client.legal
        }
      }

      try{
        const billingClient = await billingService.createClient(client);
        const legal:string = billingClient.id;
        await clientService.updateClient(clientId, {legal});
        return {
          valid: true,
          legal:billingClient.id
        }
      }catch(e:any){
        throw new HttpError(e.message, 400);
      }
     
    }
  })
}


