import { HttpError } from '../../errors/HttpError';
import { ItemsModel, type tItem } from '../../models/itemsModel';
import { type IOrder, OrderModel } from '../../models/OrderModel';
import { type iProduct, ProductsModel } from '../../models/productsModel';


export class OrderService {
  async addOrder(purchase: purchaseOrder) {
    const om = new OrderModel();
    const itemsModel = new ItemsModel();
    try{
      const items = await this.getItemsPrices(purchase.items);
      const subtotal = this.getSubtotal(items);
      const order = {
        rfc: purchase.rfc,
        total: subtotal - purchase.discount,
        discount: purchase.discount,
        subtotal,
        partialPayment: purchase.partialPayment,
        paymentType: purchase.paymentType,
      }
      const [orderId] = await om.addOrder(order);
      const products = await itemsModel.addItems(items.map((item) => ({ product_id: item.id, order_id:orderId, quantity: item.quantity, price: item.total })));
      return {message: 'Order created', data: {orderId, items:products}}
    }catch(e:any){
      return {message: e.message}
    }
  }

  async getAllOrders(searchObject:any,page: number, limit: number) {
    const orderModel = new OrderModel();
    return orderModel.getAllOrders(searchObject,page, limit);
  }

  async getOrderById(id: number) {
    const orderModel = new OrderModel();
    const itemModel = new ItemsModel();
    const order =  orderModel.getOrderById(id);
    const items =  itemModel.getItemsByOrderId(id);
    const [orderData, itemsData] = await Promise.all([order, items]);
    return {order: orderData, items: itemsData};
  }

  async pay(id: number, payment: number) {
    const orderModel = new OrderModel();
    const order = await orderModel.getOrderById(id);
    if (order.status === 'paid') {
      return { message: 'Order already paid' };
    }

    const total = order.total - payment;
    if (total < 0) {
      throw new HttpError(`Payment is greater than total: ${order.total}`, 400);
    }

    const status = total === 0 ? 'paid' : 'pending';
    await orderModel.updateOrder(id, { partialPayment:payment, status });
    return orderModel.getOrderById(id)
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

type purchaseOrder = IOrder & { items: tItem[] };