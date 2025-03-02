import axios from 'axios';
import { HttpError } from '../../errors/HttpError';

export class WsService{
   fbUrl: string;
   token: string;
   from: string;
  constructor(){
     this.fbUrl = 'https://graph.facebook.com/v22.0/'
     this.token = process.env.WS_TOKEN ?? '';
     this.from = process.env.WS_FROM ?? '';
  }
  async sendNotification(message:string, recipient:string){

    if(!recipient) {
      throw new HttpError('Missing recipient', 400);
    }

    const resp = await axios.post(`${this.fbUrl}${this.from}/messages`,{
      recipient_type:'individual',
      text:{
        body:message
      },
      to:recipient,
      messaging_product: 'whatsapp',
      type:"text",
    },{
      headers:{
        'Content-Type':'application/json',
        'Authorization':`Bearer ${this.token}`
      }
    });

    console.log(resp.data);
    return resp.data;
  }

  async sendTemplate(templateId:string, from:string, to:string, data:Record<string, string>){
    
    console.log(this.token,'token');
    const resp = await axios.post(`${this.fbUrl}${from}/messages`,{
      
      template:{
        name:templateId
      },
      to,
      messaging_product: 'whatsapp',
      type:"template",
      components:[
        {
          type:'body',
          parameters: Object.keys(data).map(key=>({
            parameter_name:key,
            type:'text',
            text: data[key]
          }))
        }
      ]
    },{
      headers:{
        'Content-Type':'application/json',
        'Authorization':`Bearer ${this.token}`
      }
    });

    return resp.data;
  }
  
}