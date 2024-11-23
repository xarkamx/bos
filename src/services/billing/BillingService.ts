import { HttpError } from '../../errors/HttpError';
import { BillingModel } from '../../models/BillingModel';
import type { iClient } from '../../models/ClientModel';
import { numberPadStart } from '../../utils/helpers';
import { sendInvoiceSubstitutionNotification } from '../../utils/mailSender';
import { ClientService } from '../clients/ClientService';
import { OrderService } from '../orders/OrdersService';

export class BillingService{
  private readonly billing: any;
  
  constructor(billing:any) {
    this.billing = billing;
  }

  async addInvoice(orderIds:number[], taxType:string, paymentType:string, paymentMethod ='') {
    if(paymentMethod === 'PPD') {
      paymentType = '99';
    }

    const {orders, customer} = await loadOrders(orderIds);
    const type:number=parseInt(paymentType||orders[0].order.paymentType,10)
    const items = formatInvoice(orders);
    
    if(type === 99){
      paymentMethod = 'PPD'
    }

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
      items,
      payment_form: numberPadStart(2,type),
      payment_method:  paymentMethod || 'PUE',
      use: 'G01', // Hardcoded for now
    };
    try{
      const resp = await this.billing.addInvoice(invoice)
      await storeBillId(orderIds, resp.id);
      return resp;
    }catch(e:any){
      throw new HttpError(e.message, 400);
    }
  }

  async getBillById(billingId:string){
    return this.billing.getBilling(billingId);
  }

  async cancelInvoice(billingId:string,motive:string){
    const service = new OrderService();
    let billing = {};
    try{
       billing = await this.billing.cancelInvoice(billingId,motive);
    }catch(e:any){
      throw new HttpError(e.message, 400);
    }

    await service.updateByBillId(billingId, {billed: null, billed_at: null});
    return billing;
  }

  async autoCancelExpiredInvoices() {
    const om = new OrderService();
    const orders = await om.getOrdersWithExpiredBilling();
    const promisedSubstitutions = orders.map((order:any) => this.invoiceSubstitution(order));
    await Promise.allSettled(promisedSubstitutions);
  }

  async invoiceSubstitution(order:any){
    const bill =await  this.getBillById(order.billed);
    if(bill.payment_method === 'PPD') {
      throw new HttpError('PPD invoices cannot be substituted', 400);
    }
    console.log(`Folio ${bill.series}-${bill.folio_number} is going to be canceled`);
    await this.cancelInvoice(order.billed, '03');
    console.log(`Folio ${bill.series}-${bill.folio_number} was canceled`);
    const newBill = await this.addInvoice([order.id], order.tax_system, order.payment_type, 'PUE');
    console.log(`Folio ${newBill.series}-${newBill.folio_number} was created`);
    
    sendInvoiceSubstitutionNotification(bill, newBill, order);
  }

  async getAllInvoices(query:any){
    return this.billing.list(query);
  }

  async downloadInvoice(billingId:string){
    return this.billing.downloadInvoice(billingId);
  }

  async downloadXml(billingId:string){
    return this.billing.downloadXml(billingId);
  }

  async customInvoice(customerId:string,products:any[],paymentDetails:any){
    const service = new ClientService();
    const customer = await service.getClient(customerId);

    if(!customer) throw new HttpError('Customer not found', 404);

    const invoice = {
      customer: {
        legal_name: customer.name,
        tax_id: customer.rfc,
        tax_system: customer.tax_system, // Hardcoded for now
        email: customer.email,
        address: {
          zip: customer.postal_code,
        },
      },
      items: products,
      payment_form: paymentDetails.paymentForm?numberPadStart(2,paymentDetails.paymentForm):undefined,
      payment_method: paymentDetails.paymentMethod || 'PUE',
      use: paymentDetails.use, // Hardcoded for now
    };
    return this.billing.addInvoice(invoice);
  }

  async paymentComplement(customerId:string,amount:number, complement:any){
    const service = new ClientService();
    const customer = await service.getClient(customerId);

    if(!customer) throw new HttpError('Customer not found', 404);

    const invoice = {
      customer: {
        legal_name: customer.name,
        tax_id: customer.rfc,
        tax_system: customer.tax_system, // Hardcoded for now
        email: customer.email,
        address: {
          zip: customer.postal_code,
        },
      },
      complements: [complement],
      type: 'P',
    };
    return this.billing.addInvoice(invoice);
  }

  async sendInvoice(billingId:string, email:string){
    if(email === '') return this.billing.sendInvoice(billingId);
    return this.billing.sendInvoice(billingId,{email});
  }

  async addRequestId(requestId:string,status:string){
    const model = new BillingModel();
    const exists = await model.getBillings({externalId:requestId});
    if(exists.length) {
      await model.updateBilling(exists[0].id, {
        status,
      });
      }else {
        await  model.addBilling({externalId: requestId, status: 'Accepted', orderId: 0, ownerId: 0});
      } 

    
    return model.getBillings({});
  }

  async getAcceptedRequests(){
    const model = new BillingModel();
    return model.getBillings({status: 'Accepted'});
  }

  validateClient(legal:string){
    return this.billing.validateClient(legal);
  }
  
  createClient(client:any){
    return this.billing.createClient(client);
  }

  updateClient(id:string,client:iClient){
    return this.billing.updateClient(id,{
      legal_name: client.name,
      tax_id: client.rfc,
      tax_system: client.tax_system ?? '601',
      email: client.email,
      address: {
        zip: client.postal_code,
      },
    });
  }

  getExternalProducts(query:string){
    return this.billing.searchProducts(query);
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