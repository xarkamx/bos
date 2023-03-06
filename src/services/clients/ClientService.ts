import { ClientModel, type iClient } from '../../models/ClientModel';

export class ClientService {
  async createClient(client: iClient): Promise<any> {
    const clientModel = new ClientModel();
    return clientModel.addClient(client);
  }

  async getClients(): Promise<any> {
    const clientModel = new ClientModel();
    const resp = await clientModel.getClients();
   
    return  resp.map((client:any) => {
      client.phones = JSON.parse(client.phones)
      return client;
    });
  }
}