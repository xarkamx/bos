import { HttpError } from '../../errors/HttpError';
import { InventoryModel } from '../../models/InventoryModel';
import { ItemsModel, type tItem } from '../../models/itemsModel';
import { type IOrderResponse, type IOrder, OrderModel } from '../../models/OrderModel';
import { PaymentsModel } from '../../models/PaymentsModel';
import { type iProduct, ProductsModel } from '../../models/productsModel';


export class OrderService {
  async addOrder(purchase: purchaseOrder) {
    const om = new OrderModel();
    const itemsModel = new ItemsModel();
    const paymentModel = new PaymentsModel();
    const inventoryModel = new InventoryModel();
    try{
      const items = await this.getItemsPrices(purchase.items);
      const subtotal = this.getSubtotal(items);
      const order = {
        clientId: purchase.clientId,
        total: subtotal - purchase.discount,
        discount: purchase.discount,
        subtotal,
        partialPayment: purchase.partialPayment
      }
      const [orderId] = await om.addOrder(order);
      const orderItems = items.map((item) => (
        { 
          product_id: item.id,
           order_id:orderId,
            quantity: item.quantity,
             price: item.total 
            }))
      const products = await itemsModel.addItems(orderItems);
      paymentModel.addPayment(
          { externalId: orderId,
            paymentType: 'order',
            paymentMethod: purchase.paymentType,
            amount: purchase.partialPayment,
            clientId:purchase.clientId
           });
      // Move this to products service
      const inventoryItems = items.map((item) => ({ external_id: item.id,  quantity: item.quantity* -1, type:'product' }))
      await inventoryModel.addInBulkToInventory(inventoryItems);
      return {message: 'Order created', data: {orderId, items:products}}
    }catch(e:any){
      return {message: e.message}
    }
  }

  async getAllOrders(searchObject:any,page: number, limit: number) {
    const orderModel = new OrderModel();
    return orderModel.getAllOrders(searchObject,page, limit)
      .leftJoin('clients', 'orders.client_id', 'clients.client_id')
      .select('clients.name as clientName', 'rfc', 'clients.client_id as clientId')
    ;
  }

  async getOrderById(id: number) {
    const orderModel = new OrderModel();
    const itemModel = new ItemsModel();
    const order =  orderModel.getOrderById(id)
      .leftJoin('clients', 'orders.client_id', 'clients.client_id')
      .select('clients.name as clientName', 'rfc', 'clients.client_id as clientId','clients.phones','clients.email')
    ;
    const items =  itemModel.getItemsByOrderId(id);

    const [orderData, itemsData] = await Promise.all([order, items]);
    orderData[0].phones = JSON.parse(orderData[0].phones);
    return {order: orderData[0], items: itemsData};
  }

  async pay(id: number,clientId:number, payment: number, paymentMethod=1) {
    const orderModel = new OrderModel();
    const paymentModel = new PaymentsModel();
    const order:IOrderResponse = (await orderModel.getOrderById(id))[0];
    if (order.status === 'paid') {
      return { message: 'Order already paid' };
    }

    
    const addedPayment = order.partialPayment + payment;
    const total = order.total - addedPayment;
    if (total < 0) {
      throw new HttpError(`Client is over paying debt is ${order.total-order.partialPayment} 
      and is paying ${payment}`, 400);
    }

    const status = total === 0 ? 'paid' : 'pending';
    
    const response =await orderModel.updateOrder(id, { partialPayment:addedPayment, status });
    await paymentModel.addPayment({ externalId: id, paymentMethod, amount: payment, clientId });
    return { message: 'Payment added', data: { ...response, status, total,paid:addedPayment,payment  }};
  }

  private async getItemsPrices(items: any[]): Promise<any[]> {
    const ids = items.map((item) => item.productId);
    const productModel = new ProductsModel();
    const products = await productModel.getProductsByIds(ids);
    return products.map((product:iProduct) => {
      const item = items.find((item) => item.productId === product.id);
      return { ...product, quantity: item.quantity, total: item.quantity * product.price };
    });
  }

  private getSubtotal(items: IProductWithTotal[]): number {
    return items.reduce((acc: number, item) => acc + item.total, 0);
  }

}

type IProductWithTotal = iProduct & {total: number };

type purchaseOrder = IOrder & { items: tItem[], paymentType: number };