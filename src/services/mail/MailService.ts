import nodemailer, { type TransportOptions } from 'nodemailer';
import config from '../../common/config';

export class MailService {
    transport: any;  
    email: string | undefined;
    constructor(){
        const smtpConfig = config.smtpConfig;
        const configOptions:CustomTransportOptions = {
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: false, // upgrade later with STARTTLS
            auth: {
              user: smtpConfig.user,
              pass: smtpConfig.password,
            },
        }
        console.log(configOptions)
        this.transport = nodemailer.createTransport(configOptions);
        this.email = smtpConfig.user
    }

    async sendMail(to:string|[string], subject:string, html:string){
        const mailOptions = {
            from: this.email,
            to,
            subject,
            html}
        return this.transport.sendMail(mailOptions)
}
}



type CustomTransportOptions = TransportOptions & {
    host: string | undefined;
    port: string | undefined;
    secure: boolean | undefined;
    auth: {
        user: string | undefined;
        pass: string | undefined;
    } | undefined;
};