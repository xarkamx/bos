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