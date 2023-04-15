import { db } from '../config/db';

export class ErrorModel {
  tableName: string;
  db: any;
  constructor() {
    this.tableName = 'audit';
    this.db = db; 
  }

  async addError(request:any,reply:any,error:any): Promise<any> {
    try{
      return this.db(this.tableName).insert({
        url: request.raw.url,
        method: request.raw.method,
        body: {body:request.body, query:request.query, params:request.params, headers:request.headers,error},
        status: 500,
        ip: request.ip
      });
    }catch(e){
      return e;
    }
    
  }

}

