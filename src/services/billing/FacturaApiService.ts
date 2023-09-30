import Facturapi from 'facturapi';
import type {  BillingCustomer, BillingInvoice, BillingProduct } from './BillingService';
import type { iClient } from '../../models/ClientModel';

export class FacturaApiService {
  api: any;
  constructor(apiKey='') {
    this.api = new Facturapi(apiKey || process.env.FACTURAPI_KEY);
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

  downloadInvoice(id:string){
    return this.api.invoices.downloadZip(id);
  }

  sendInvoice(id:string){
    return this.api.invoices.sendByEmail(id);
  }

  createClient(client:Partial<iClient>){
    return this.api.customers.create({
      legal_name: client.name,
      tax_id: client.rfc,
      tax_system: client.tax_system ?? '601',
      email: client.email,
      address: {
        zip: client.postal_code,
      },
    });
  }

  validateClient(legal:string){
    // Endpoint not working
    return this.api.customers.valid(legal);
  }

  updateClient(id:string,client:BillingCustomer){
    return this.api.customers.update(id,client);
  }

  async searchProducts(query:string){
    return this.api.catalogs.searchProducts({
      q: query
    });
  }

}

export type QueryType={
  q:string,
  limit:number,
  page:number,
}

export const facturapiGlossary = {
  RegimenFiscalReceptor: 'Regimen Fiscal',
};