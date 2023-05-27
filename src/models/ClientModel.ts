import { db } from '../config/db';

export class ClientModel {
  tableName: string;
  db: any;
  constructor() {
    this.tableName = 'clients';
    this.db = db; 
  }

  async addClient(client: iClient): Promise<any> {
    client.name = client.name.toUpperCase();
    client.rfc = client.rfc.toUpperCase();
    return this.db(this.tableName).insert(client);
  }

  getClients() {
    return this.db(this.tableName).select('client_id as id', 'rfc', 'name', 'email', 'phones', 'legal', 'postal_code','tax_system');
  }
  
  async countClients(): Promise<any> {
    return this.db(this.tableName).count('client_id as count');
  }

  async updateClient(id: number, client: any): Promise<any> {
    if(client.name)
      client.name = client.name.toUpperCase();
    if(client.rfc)
      client.rfc = client.rfc.toUpperCase();
    if(client.phones)
      client.phones = JSON.stringify(client.phones);
    return this.db(this.tableName).where('client_id', id).update(client);
  }

}


export type iClient = {
  rfc: string;
  name: string;
  email: string;
  phones: string[];
  legal: boolean;
  postal_code: string;
  tax_system: string;
};