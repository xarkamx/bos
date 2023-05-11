import { HttpError } from '../../errors/HttpError';
import { ClientService } from '../clients/ClientService';
import { OrderService } from '../orders/OrdersService';

export class BillingService{
  private readonly billing: any;
  constructor(billing:any) {
    this.billing = billing;
  }

  async addInvoice(orderIds:number[]) {
    const service = new OrderService();
    const customerService = new ClientService();
    
    let orders:any = await Promise.all(orderIds.map((id) => service.getOrderById(id)));
    const customer = await customerService.getClient(orders[0].order.clientId)
    if(!orders.length) throw new HttpError('No orders found', 404);
    if(!customer) throw new HttpError('No customer found', 404);
    const items = orders.map((order:any) => (
      order.items.map((item:any) => ({
        quantity: item.quantity,
        product: {
          description: item.name,
          product_key: '40141700', // Hardcoded for now
          price: item.unitPrice,
        },
      })))).flat();
    const invoice = {
      customer: {
        legal_name: customer.name,
        tax_id: customer.rfc,
        tax_system: '601', // Hardcoded for now
        email: customer.email,
        address: {
          zip: customer.postal_code,
        },
      },
      items,
      payment_form: '01', // Hardcoded for now
      payment_method: orders.every((order:any) => order.order.status === 'paid') ? 'PUE' : 'PPD',
    };
    return invoice;
    // return this.billing.addInvoice(invoice);
  }
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