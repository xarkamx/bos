import { db } from '../config/db';
import { sendNotificationError } from '../utils/mailSender';

export class ErrorModel {
  tableName: string;
  db: any;
  constructor() {
    this.tableName = 'audit';
    this.db = db; 
  }

  async addError(request:any,reply:any,error:any): Promise<any> {
    try{
      await this.db(this.tableName).insert({
        url: request.raw.url,
        method: request.raw.method,
        body: {body:request.body, query:request.query, params:request.params, headers:request.headers,error},
        status: 500,
        ip: request.ip
      });

      sendNotificationError({
        errorCode: error.code,
        message: error.message,
        errorDateTime: new Date().toLocaleString()
      })
    }catch(e){
      return e;
    }
    
  }

}

