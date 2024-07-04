import { EmailTemplate } from '../services/mail/senders/emailTemplate';

export async function sendNewClientMailToOwner (client: any, user: any) {
  const mail=new EmailTemplate("newClient.html");
  mail.setHandlebarsFields({ userName: user.name, clientName: client.name, clientEmail: client.email })
    .sendMail(
      user.email,
      "Nuevo cliente registrado"
    );
}

export async function sendWelcomeMessageToClient(client:any,user:any){
  const mail=new EmailTemplate("welcomeClient.html");
  mail.setHandlebarsFields({ userName: user.name, clientName: client.name, clientEmail: client.email })
    .sendMail(
      client.email,
      "Bienvenido a nuestra plataforma"
    );

}