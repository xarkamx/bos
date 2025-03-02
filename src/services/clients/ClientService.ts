import { HttpError } from '../../errors/HttpError'
import { ClientModel, type iClient } from '../../models/ClientModel'
import { OrderModel } from '../../models/OrderModel'
import { PaymentsModel } from '../../models/PaymentsModel'
import { OrderService } from '../orders/OrdersService'
import { BasService } from '../users/basService'

export class ClientService {
  async createClient (client: iClient): Promise<any> {
    const clientModel = new ClientModel()
    return clientModel.addClient(client)
  }

  async getClients (): Promise<any> {
    const clientModel = new ClientModel()
    const resp = await clientModel.getClients().orderBy('id', 'desc')
   
    return  resp.map((client:any) => {
      client.phones = JSON.parse(client.phones)
      return client
    })
  }

  async getClient (clientId: string): Promise<any> {
    const clientModel = new ClientModel()
    const resp = await clientModel.getClients().where('client_id', clientId).first()
    try {
      resp.phones = JSON.parse(resp?.phones || [])
    } catch (error:any) {
      throw new HttpError('Error parsing phones', 500,error)
    }
   
    return resp
  }

  async getClientByEmail (email: string): Promise<any> {
    const clientModel = new ClientModel()
    return clientModel.getClientByEmail(email)
  }

  async getResume (clientId: string): Promise<any> {
    const ordersModel = new OrderModel()
    const orders = await ordersModel.request
      .rightJoin('clients', 'clients.client_id', 'orders.client_id')
      .where('orders.client_id', clientId)
      .andWhere('status', '!=', 'canceled')
      .select('partial_payment as partialPayment', 'total', 'status', 'created_at','clients.name as clientName','clients.rfc')
      .orderBy('created_at', 'desc')
      

    if (!orders.length) return { orders: 0, pending: 0, totalPaid: 0, totalDebt: 0, latestPurchase: null }
    const totalPaid = orders.reduce((acc: number, order: any) => {
      const payments:number = order.partialPayment
      return acc + payments
    }, 0)
    let totalDebt = orders.filter((order: any) => order.status === 'pending')
    totalDebt = totalDebt.reduce((acc: number, order: any) => {
      const debt:number = order.total - order.partialPayment
      return acc + debt
    }, 0)

    const latestOrder = orders[0]
    return {
      orders: orders.length,
      pending: orders.filter((order: any) => order.status === 'pending').length,
      totalPaid,
      totalDebt,
      latestPurchase: latestOrder.created_at,
      clientName: latestOrder.clientName,
      rfc: latestOrder.rfc
    }
  }

  async getClientPayments (clientId: string) {
    const payments = new PaymentsModel()
    return payments.getAll()
      .select('orders.id as orderId', 'payments.id as paymentId', 'payments.amount', 'payments.created_at as createdAt', 'payments.payment_method as paymentMethod', 'payments.payment_type as paymentType', 'payments.flow')
      .leftJoin('orders', 'orders.id', 'payments.external_id')
      .where('orders.client_id', clientId)
      .andWhere('payments.payment_type', 'order')
      
  }

  async getDebt (clientId: string) {
    const ordersModel = new OrderModel()
    const orders = await ordersModel.request
      .where('client_id', clientId)
      .andWhere('status', 'pending')
      .select('id', 'total', 'partial_payment as partialPayment', 'created_at')
      .orderBy('created_at', 'desc')
    
    const debt = orders.reduce((acc: number, order: any) => 
      (acc + (order.total - order.partialPayment))
    , 0)
    return { orders, debt }
  }

  async payDebt (clientId:any, amount: number, paymentMethod = 1) {
    const debt = await this.getDebt(clientId)
    const amountPayed = amount
    if (debt.debt < amount) throw new HttpError('The amount is greater than the debt', 400)
    const orderService = new OrderService()
    const paymentPromise = debt.orders.map((order: any) => {
      const debt = order.total - order.partialPayment
      const payment = amount > debt ? debt : amount
      
      if (payment <= 0) return false
      amount -= payment
      return orderService.pay(order.id, clientId, payment,paymentMethod)
    })
    await Promise.all(paymentPromise)
    const currentDebt = await this.getDebt(clientId)
    return { message: 'Debt paid', currentDebt,amount: amountPayed,date: new Date() }

  }

  async updateClient (clientId: number, client: Partial<iClient>): Promise<any> {
    const clientModel = new ClientModel()
    return clientModel.updateClient(clientId, client)
  }

  async addCredentials (email: string, password: string): Promise<any> {
    const clientModel = new ClientModel()
    const client = await clientModel.getClientByEmail(email)
    if (!client) throw new HttpError('Client not found', 404)
    if (client.bas_id) throw new HttpError('Client already has credentials', 400)

    const bas = new BasService()
    bas.asSuperAdmin()
    const credentials = await bas.addUser(bas.jwt,{
      name: client.name,
      email,
      password
    })
    await bas.addRole(bas.jwt, credentials.userId, 'customer')

    await clientModel.updateClient(client.id, { bas_id: credentials.userId })
    return client
  }
}