import { EmailTemplate } from '../services/mail/senders/emailTemplate';
import { BasService } from '../services/users/basService';

export async function sendNewClientMailToOwner (client: any, user: any) {
  const mail=new EmailTemplate("newClient.html");
  if(!client.email) return;
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

export async function sendNewOrderRequested(user:any,jwt:string,details:any){
  const mail=new EmailTemplate("newOrderRequested.html");
  const bas = new BasService();
  const cashiers =  bas.getUsersByRole(jwt,'cashier');
  const admins =  bas.getUsersByRole(jwt,'admin');
  const {order,items} = details;
  const resp = await Promise.all([admins,cashiers]);
  const users = resp.flat();
  users.push(user);
  const mails:any = users.map((user:any)=>{
    return mail.setHandlebarsFields(
      { employeeName: user.name,
         orderId:order.id,
         createdAt:new Date(order.createdAt).toLocaleString(),
         items:formatArrayAsHTMLList(items),
         clientName:order.clientName,
         clientEmail:order.email,
         orderTotal:`$ ${order.total.toFixed(2)}` ,
        }).sendMail(user.email,"Nuevo pedido solicitado");
  });

  return Promise.all(mails);
}

function formatArrayAsHTMLList(array: any[]) {
  return array.map((item) => `<div>
  <div>${item.name}</div>
  <div>Cantidad:${item.quantity}</div>
  <div>Precio: $ ${item.total.toFixed(2)}</div>
  </div>`).join('');
}