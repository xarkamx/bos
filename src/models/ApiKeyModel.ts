import { db } from '../config/db';
import { snakeCaseReplacer } from '../utils/objectFormat';

export class ApiKeyModel {
  public tableName = 'apiKeys';
  public db: any;
  constructor(){
    this.db = db;
  }

  async addApiKey(apiKey: ApiKeyType) {
    apiKey = snakeCaseReplacer(apiKey);
    return this.db(this.tableName).insert(apiKey);
  }

  async getApiKeyById(id: number) {
    return this.db(this.tableName).where('id', id).first();
  }

 async getApiKeyByName(name: string) {
  return this.db(this.tableName).where('name', name).first();
 }

}

export type ApiKeyType = {
  name: string;
  key: string;
}