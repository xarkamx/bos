import axios from 'axios';
import { HttpError } from '../../errors/HttpError';

export class NotsService {
    token: string;  
    constructor(token:string){
        this.token = token;
    }

    async sendTemplatedEmail(templateId:number,email:string,handlebarsData:any) {
        const url = process.env.MAIL_URL ?? '';
        const validUrl = encodeURI(`${url}/emails/send`);
        try {
            const users = await axios.post(validUrl, {
                templateId,
                to:email,
                handlebarsData
            },{
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${this.token}`
                }
            });
            return users.data.data;
        }
        catch (err:any) {
            throw new HttpError('Error sending email', 500);
        }
    }
}