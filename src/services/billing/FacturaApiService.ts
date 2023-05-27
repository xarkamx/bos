import Facturapi from 'facturapi';
import type {  BillingCustomer, BillingInvoice, BillingProduct } from './BillingService';

export class FacturaApiService {
  private readonly  api: Facturapi;
  constructor() {
    this.api = new Facturapi(process.env.FACTURAPI_KEY);
  }

  addCustomer(customer: BillingCustomer) {
    return this.api.customers.create(customer);
  }

  addProduct(product: BillingProduct) {
    return this.api.products.create(product);
  }

  addInvoice(invoice: BillingInvoice) {
    return this.api.invoices.create(invoice);
  }

  cancelInvoice(id:string,motive:string){
    return this.api.invoices.cancel(id,{motive});
  }

  list(query:QueryType){
    return this.api.invoices.list(query);
  }
}

export type QueryType={
  q:string,
  limit:number,
  page:number,
}