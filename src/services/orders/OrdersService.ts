import { HttpError } from '../../errors/HttpError'
import { InventoryModel } from '../../models/InventoryModel'
import { ItemsModel, type tItem } from '../../models/itemsModel'
import { type IOrder, OrderModel } from '../../models/OrderModel'
import { PaymentsModel } from '../../models/PaymentsModel'
import { type iProduct, ProductsModel } from '../../models/productsModel'
import { numberPadStart } from '../../utils/helpers'
import { BillingService } from '../billing/BillingService'
import { FacturaApiService } from '../billing/FacturaApiService'


export class OrderService {
  async addOrder (purchase: purchaseOrder) {
    const om = new OrderModel()
    const itemsModel = new ItemsModel()
    const paymentModel = new PaymentsModel()
    const inventoryModel = new InventoryModel()
    try {
      
      const items = await this.getItemsPrices(purchase.items)
      const subtotal = this.getSubtotal(items)
      const pendingPayment = (subtotal - purchase.discount) - purchase.partialPayment
      
      if (pendingPayment < 1) {
        purchase.status = 'paid'
      }

      const order = {
        clientId: purchase.clientId,
        total: subtotal - purchase.discount,
        discount: purchase.discount,
        subtotal,
        partialPayment: purchase.partialPayment,
        paymentType: purchase.paymentType,
        status: purchase.status ?? 'pending'
      }
      const [orderId] = await om.addOrder(order)
      const orderItems = items.map((item) => (
        { 
          product_id: item.id,
          order_id: orderId,
          quantity: item.quantity,
          price: item.total 
        }))
      const products = await itemsModel.addItems(orderItems)
      paymentModel.addPayment(
        { externalId: orderId,
          paymentType: 'order',
          paymentMethod: purchase.paymentType,
          amount: purchase.partialPayment,
          clientId: purchase.clientId
        })
      // Move this to products service
      const inventoryItems = items.map((item) => ({ external_id: item.id,  quantity: item.quantity * -1, type: 'product',description: 'purchase' }))
      await inventoryModel.addInBulkToInventory(inventoryItems)

      return { message: 'Order created', data: { orderId, items: products } }
    } catch (e:any) {
      return { message: e.message }
    }
  }

  async getAllOrders (searchObject:any,page: number, limit: number) {
    const orderModel = new OrderModel()
    return orderModel.getAllOrders(searchObject,page, limit)
      .leftJoin('clients', 'orders.client_id', 'clients.client_id')
      .select('clients.name as clientName', 'rfc', 'clients.client_id as clientId','clients.email','clients.postal_code as postalCode')
      .orderBy('orders.id', 'desc')
    
  }

  getOrdersByClientId (clientId: number) {
    const orderModel = new OrderModel()
    return orderModel.getOrders().where({ client_id: clientId })
      .select('id', 'total', 'discount', 'subtotal', 'partial_payment as partialPayment', 'status', 'billed', 'created_at as createdAt', 'updated_at as updatedAt')
      .orderBy('id', 'desc')
  }

  getOrdersByBillId (billId: string) {
    return this.getAll()
      .where({ billed: billId })
      .andWhere('payment_type', '!=', 99)
  }

  async getPPDOrdersByBillId (billId: string) {
    return  this.getAll().where({ billed: billId })
      .andWhere('payment_type', 99)
  }

  getAll () {
    const orderModel = new OrderModel()
    return orderModel.getOrders()
      .select('id', 'total', 'discount', 'subtotal', 'partial_payment as partialPayment', 'status', 'billed', 'created_at as createdAt', 'updated_at as updatedAt','client_id')
      .orderBy('id', 'desc')
  }
  

  async getOrderById (id: number) {
    const orderModel = new OrderModel()
    const itemModel = new ItemsModel()
    const order =  orderModel.getOrderById(id)
      .leftJoin('clients', 'orders.client_id', 'clients.client_id')
      .select('clients.name as clientName', 'rfc', 'clients.client_id as clientId','clients.phones','clients.email')
    
    const items =  itemModel.getItemsByOrderId(id)

    const [orderData, itemsData] = await Promise.all([order, items])
    orderData[0].phones = JSON.parse(orderData[0].phones)
    return { order: orderData[0], items: itemsData }
  }

  async pay (id: number,clientId:number, payment: number, paymentMethod = 1) {
    const orderModel = new OrderModel()
    const paymentModel = new PaymentsModel()
    const order = await orderModel.getOrderById(id)
      .leftJoin('clients', 'orders.client_id', 'clients.client_id')
      .select({
        client_id: 'clients.client_id',
        total: 'orders.total',
        partialPayment: 'orders.partial_payment',
        status: 'orders.status',
        uuid: 'orders.billed',
        paymentMethod: 'orders.payment_type'
      })
      .first()
    
    if (!order) {
      throw new HttpError('Order not found', 404)
    }

    if (order.status === 'paid') {
      return { message: 'Order already paid' }
    }

    
    const addedPayment = order.partialPayment + payment
    const total = order.total - addedPayment
    if (total < 0) {
      throw new HttpError(`Client is over paying debt is ${order.total - order.partialPayment} 
      and is paying ${payment}`, 400)
    }
    const invoice = await this.sendInvoice( id, order, addedPayment, paymentMethod, payment)
    const status = total < 1  ? 'paid' : 'pending'
    const response = await orderModel.updateOrder(id, { partialPayment: addedPayment, status })
    await paymentModel.addPayment({ externalId: id, paymentMethod, amount: payment, clientId, paymentType: 'order',billingId: invoice?.id })
   
    return { message: 'Payment added', data: { ...response, status, total,paid: addedPayment,payment  } }
  }

  private async sendInvoice ( id: number, order: any, addedPayment: any, paymentMethod: number, payment: number) {
    const paymentModel = new PaymentsModel()
    const billingService = new BillingService(new FacturaApiService())

    const payments = await paymentModel.getPaymentsByOrderId(id)
    if (order.uuid && order.paymentMethod === 99) {
      const { uuid } = await billingService.getBillById(order.uuid)
      return await billingService.paymentComplement(order.client_id, addedPayment, {
        type: 'pago',
        data: [{
          payment_form: numberPadStart(2, paymentMethod),
          related_documents: [{
            uuid,
            installment: payments.length + 1,
            last_balance: order.total - order.partialPayment,
            amount: payment,
            taxes: [{
              base: payment / 0.16,
              type: 'IVA',
              rate: 0.16
            }]
          }]
        }]
      })
    }
  }

  async cancelOrder (id: number) {
    
    const om = new OrderModel()
    const itemsModel = new ItemsModel()
    const paymentModel = new PaymentsModel()
    const inventoryModel = new InventoryModel()
    const order = await om.getOrderById(id)
    if (order.length === 0) {
      throw new HttpError('Order not found', 404)
    }

    const items = await itemsModel.getItemsByOrderId(id)
    await inventoryModel.addInBulkToInventory(items.map((item:any) => 
      ({ external_id: item.productId,  quantity: (item.quantity), type: 'product',description: 'cancel' })))
    await itemsModel.deleteItemsByOrderId(id)
    await paymentModel.deletePaymentsByExternalId(id)
    return  om.deleteOrder(id)
    
    
  }


  async updateOrder (id: number, order: Partial<IOrder>) {
    const om = new OrderModel()
    return om.updateOrder(id, order)
  }

  async removeItemsFromOrder (orderId: number) {
    const itemsModel = new ItemsModel()
    return itemsModel.deleteItemsByOrderId(orderId)
  }

  async addItemsToOrder (orderId:number,items: tItem[]) {
    const itemsWithPrice = await this.getItemsPrices(items)
    const itemsModel = new ItemsModel()
    const orderItems = itemsWithPrice.map((item) => (
      { 
        product_id: item.id,
        order_id: orderId,
        quantity: item.quantity,
        price: item.total 
      }))
    return itemsModel.addItems(orderItems)
  }

  addItemsToInventory (items: tItem[]) {
    const inventoryModel = new InventoryModel()
    const inventoryItems = items.map((item) => ({ external_id: item.productId,  quantity: item.quantity, type: 'product',descrption: 'order update' }))
    return inventoryModel.addInBulkToInventory(inventoryItems)
  }

  async updateByBillId (billId: string, order: any) {
    const om = new OrderModel()
    return om.db('orders').where({ billed: billId }).update(order)
  }

  async getOrdersWithExpiredBilling () {
    const om = new OrderModel()
    return om.getOrdersWithExpiredBilling()
  }

  private async getItemsPrices (items: any[]): Promise<any[]> {
    const ids = items.map((item) => item.productId)
    const productModel = new ProductsModel()
    const products = await productModel.getProductsByIds(ids)
    return products.map((product:iProduct) => {
      const item = items.find((item) => item.productId === product.id)
      return { ...product, quantity: item.quantity, total: item.quantity * product.price }
    })
  }

  private getSubtotal (items: IProductWithTotal[]): number {
    return items.reduce((acc: number, item) => acc + item.total, 0)
  }

}

type IProductWithTotal = iProduct & {total: number };

type purchaseOrder = IOrder & { items: tItem[], paymentType: number };