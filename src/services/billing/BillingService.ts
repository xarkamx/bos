import { HttpError } from '../../errors/HttpError';
import { ClientService } from '../clients/ClientService';
import { OrderService } from '../orders/OrdersService';

export class BillingService{
  private readonly billing: any;
  
  constructor(billing:any) {
    this.billing = billing;
  }

  async addInvoice(orderIds:number[], taxType:string) {
    
    const {orders, customer} = await loadOrders(orderIds);
   
    const items = formatInvoice(orders);
   
    const invoice = {
      customer: {
        legal_name: customer.name,
        tax_id: customer.rfc,
        tax_system: customer.tax_system || '601', // Hardcoded for now
        email: customer.email,
        address: {
          zip: customer.postal_code,
        },
      },
      folio_number: orders[0].order.id,
      items,
      payment_form: orders[0].order, // Hardcoded for now
      payment_method: orders.every((order:any) => order.order.status === 'paid') ? 'PUE' : 'PPD',
    };

    const resp = await this.billing.addInvoice(invoice)
    if(resp.error) throw new HttpError(resp.error, 400);
    await storeBillId(orderIds, resp.id);
    return resp;
  }

  async cancelInvoice(billingId:string,motive:string){
    const service = new OrderService();
    let billing = {};
    try{
       billing = await this.billing.cancelInvoice(billingId,motive);
    }catch(e:any){
      throw new HttpError(e.message, 400);
    }

    service.updateByBillId(billingId, {billed: null, billed_at: null});
    return billing;
  }

  async getAllInvoices(query:any){
    return this.billing.list(query);
  }
} 

async function loadOrders(orderIds:number[]){
  const service = new OrderService();
  const customerService = new ClientService();
  const orders:any = await Promise.all(orderIds.map((id) => service.getOrderById(id)));
  const customerId = orders[0].order.clientId;
  const sameUser = orders.every((order:any) => order.order.clientId === customerId && order.order.billed === null);
  if(!sameUser) throw new HttpError('Orders are not valid', 400);
  const customer = await customerService.getClient(orders[0].order.clientId)
  if(!orders.length) throw new HttpError('No orders found', 404);
  if(!customer) throw new HttpError('No customer found', 404);
  const validate = [
    customer.rfc,
    customer.name,
    customer.email,
    customer.postal_code
  ].every((value) => value);

  if(!validate) throw new HttpError('Customer is missing some data', 400);

  return {orders, customer};
}

function formatInvoice(orders:any[]){
   return orders.map((order:any) => {
    const discountPerProduct = order.order.discount / order.items.length;
    return order.items.map((item:any) => ({...item, discount: discountPerProduct}))
   }).flat().map((item:any) =>({
        quantity: item.quantity,
        discount: item.discount,
        product: {
          description: item.name,
          product_key: '40141700', // Hardcoded for now
          price: item.unitPrice,
        },
      }));
}


function storeBillId(orderIds:number[], billId:string){
  const service = new OrderService();
  const orders = orderIds.map((id) => service.updateOrder(id, {billed: billId,billedAt: new Date()}));
  return Promise.all(orders);
}



export type BillingCustomer = {
  legal_name: string;
  tax_id: string;
  tax_system: string;
  email: string;
  address: {
    zip: string;
  };
}

export type BillingProduct = {
  description: string;
  product_key: string;
  price: number;
  sku: string;
  tax_include: boolean;
  taxes: {
    rate: number;
    type: string;
  };
};

export type BillingInvoice = {
  customer: BillingCustomer;
  items: BillingProduct[];
  payment_form: string;
  use: string
  folio_number: string;
};