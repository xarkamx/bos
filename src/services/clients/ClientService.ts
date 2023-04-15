import { ClientModel, type iClient } from '../../models/ClientModel';
import { OrderModel } from '../../models/OrderModel';

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

  async getResume(clientId: string): Promise<any> {
    const ordersModel = new OrderModel();
    const orders = await ordersModel.request
      .where('client_id', clientId)
      .andWhere('status', '!=', 'canceled')
      .select('partial_payment as partialPayment', 'total', 'status', 'created_at')
      .orderBy('created_at', 'desc')
      ;

    
    const totalPaid = orders.reduce((acc: number, order: any) => {
      const payments:number = order.partialPayment
      return acc + payments
    }, 0);
    let totalDebt = orders.filter((order: any) => order.status === 'pending');
    totalDebt = totalDebt.reduce((acc: number, order: any) => {
      const debt:number = order.total - order.partialPayment
      return acc + debt
    }, 0);

    const latestOrder = orders[0];

    return {
      orders: orders.length,
      pending: orders.filter((order: any) => order.status === 'pending').length,
      totalPaid,
      totalDebt,
      latestPurchase: latestOrder[0]?.created_at,
    };
  }

  async updateClient(clientId: number, client: iClient): Promise<any> {
    const clientModel = new ClientModel();
    return clientModel.updateClient(clientId, client);
  }
}