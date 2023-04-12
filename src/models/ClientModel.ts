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

  async getClients(): Promise<any> {
    return this.db(this.tableName).select('client_id as id', 'rfc', 'name', 'email', 'phones', 'legal');
  }
  
  async countClients(): Promise<any> {
    return this.db(this.tableName).count('client_id as count');
  }

}
export type iClient = {
  rfc: string;
  name: string;
  email: string;
  phones: string[];
  legal: boolean;
};