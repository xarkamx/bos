import { ClientModel, type iClient } from '../../models/ClientModel';
import { OrderModel } from '../../models/OrderModel';

export class ClientService {
  async createClient(client: iClient): Promise<any> {
    const clientModel = new ClientModel();
    return clientModel.addClient(client);
  }

  async getClients(): Promise<any> {
    const clientModel = new ClientModel();
    const resp = await clientModel.getClients().orderBy('id', 'desc');
   
    return  resp.map((client:any) => {
      client.phones = JSON.parse(client.phones)
      return client;
    });
  }

  async getClient(clientId: string): Promise<any> {
    const clientModel = new ClientModel();
    const resp = await clientModel.getClients().where('client_id', clientId).first();
    resp.phones = JSON.parse(resp.phones)
    return resp;
  }

  async getResume(clientId: string): Promise<any> {
    const ordersModel = new OrderModel();
    const orders = await ordersModel.request
      .rightJoin('clients', 'clients.client_id', 'orders.client_id')
      .where('orders.client_id', clientId)
      .andWhere('status', '!=', 'canceled')
      .select('partial_payment as partialPayment', 'total', 'status', 'created_at','clients.name as clientName','clients.rfc')
      .orderBy('created_at', 'desc')
      ;

    if(!orders.length) return {orders: 0, pending: 0, totalPaid: 0, totalDebt: 0, latestPurchase: null}
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
      latestPurchase: latestOrder.created_at,
      clientName: latestOrder.clientName,
      rfc: latestOrder.rfc
    };
  }

  async updateClient(clientId: number, client: iClient): Promise<any> {
    const clientModel = new ClientModel();
    return clientModel.updateClient(clientId, client);
  }
}