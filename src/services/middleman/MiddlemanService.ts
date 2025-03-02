import { HttpError } from '../../errors/HttpError'
import { MiddlemanModel, type MiddlemanType } from '../../models/MiddlemanModel'
import { type IPayment } from '../../models/PaymentsModel'
import { ClientService } from '../clients/ClientService'
import { PaymentsServices } from '../payments/PaymentsServices'

export class MiddlemanService {
  async addMiddleman (middleman: MiddlemanType) {
    const middlemanModel = new MiddlemanModel()
    return middlemanModel.addMiddleman(middleman)
  }


  async getAllMiddleman () {
    const middlemanModel = new MiddlemanModel()
    const resp = await middlemanModel.getAllMiddleman()

    return resp.map((middleman:any) => ({
      middlemanId: middleman.bas_id,
      name: middleman.name,
      email: middleman.email,
      address: middleman.address,
      phone: middleman.phone,
      rfc: middleman.rfc,
      bankName: middleman.bank_name,
      clabe: middleman.clabe
    }))
  }

  async getAllMiddlemanWithDebt () {
    const middlemanModel = new MiddlemanModel()
    const resp = await middlemanModel.getAllMiddlemanWithDebt()
    return resp.map((middleman:any) => ({
      middlemanId: middleman.middlemanId,
      name: middleman.middlemanName,
      earnings: middleman.earnings,
      paidEarnings: middleman.paid,
      numberOfClients: middleman.numberOfClients
    }))
  }

  async getMiddlemanById (id: number) {
    const middlemanModel = new MiddlemanModel()
    const resp = await  middlemanModel.getMiddlemanById(id)
    if (!resp) throw new HttpError('Middleman not found', 404)
    return {
      middlemanId: resp.bas_id,
      name: resp.name,
      email: resp.email,
      address: resp.address,
      phone: resp.phone,
      rfc: resp.rfc,
      bankName: resp.bank_name,
      clabe: resp.clabe
    }
  }

  async getMiddlemanByName (name: string) {
    const middlemanModel = new MiddlemanModel()
    return middlemanModel.getMiddlemanByName(name)
  }

  async updateMiddleman (id: number, middleman: Partial<MiddlemanType>) {
    const middlemanModel = new MiddlemanModel()
    return middlemanModel.updateMiddleman(id, middleman)
  }

  async deleteMiddleman (id: number) {
    const middlemanModel = new MiddlemanModel()
    return middlemanModel.deleteMiddleman(id)
  }

  async getAllMiddlemanClients (id: number) {
    const middlemanModel = new MiddlemanModel()
    return middlemanModel.getAllMiddlemanClients(id)
  }

  async addClientToMiddleman (middlemanId: number, clientId: any) {
    const middlemanModel = new MiddlemanModel()
    const clientService = new ClientService()
       
    const client = await clientService.getClient(clientId)
    if (!client) throw new HttpError('Client not found',404)
    const clients = await middlemanModel.getAllMiddlemanClients(middlemanId)

    const found = clients.find((c:any) => c.client_id === clientId)
    if (found) throw new HttpError('Client already linked to middleman', 400)
    return middlemanModel.addClientToMiddleman(middlemanId, clientId)
  }

  async getOrdersByMiddlemanId (id: number) {
    const middlemanModel = new MiddlemanModel()
    const resp = await  middlemanModel.getOrdersByMiddlemanId(id)
    return resp.map((order:any) => ({
      orderId: order.orderId,
      total: order.total,
      status: order.status,
      createdAt: order.created_at,
      partialPayment: order.partial_payment,
      clientName: order.client_name,
      clientId: order.client_id,
      rfc: order.rfc
    }))
  }


  async getMiddlemanPayments (id: number) {
    const middlemanModel = new MiddlemanModel()
    const paymentsService = new PaymentsServices()
    const middleman = await middlemanModel.getMiddlemanById(id)
    if (!middleman) throw new HttpError('Middleman not found', 404)
    const payments = await paymentsService.getPaymentsPerReference({
      externalId: id,
      flow: 'outflow',
      paymentType: 'middleman'
    })
    return payments.map((payment:any) => ({
      paymentId: payment.id,
      amount: payment.amount,
      createdAt: payment.created_at
    }))
  }

  async sendPaymentToMiddleman (id: number, amount: number) {
    const middlemanModel = new MiddlemanModel()
    const middlemanFee = 0.05
    const middleman = await middlemanModel.getMiddlemanById(id)
    if (!middleman) throw new HttpError('Middleman not found', 404)

    const paymentService = new PaymentsServices()
    const payments = await paymentService.getPaymentsPerReference({
      externalId: id,
      flow: 'outflow',
      paymentType: 'middleman'
    })
    const paid = payments.reduce((acc:number, payment:IPayment) => acc + payment.amount, 0)
       
    // Calculate debt
    const [{ debt }] = await middlemanModel.getMiddleOrdersTotal(id)
    const toBePaid = (debt * middlemanFee) - paid
    if (toBePaid < amount) throw new HttpError(`Amount exceeds debt (${toBePaid})`, 400)

    // ToDo send payment using MercadoPago
    // validate payment
    // Create localPayment

    await paymentService.addPayment({
      externalId: id,
      paymentMethod: 3,
      clientId: 0,
      paymentType: 'middleman',
      flow: 'outflow',
      description: 'Middleman payment',
      amount
    })
    return {
      toBePaid,
      middlemanFee
    }
  }

}