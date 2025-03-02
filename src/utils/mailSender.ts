import { EmailTemplate } from '../services/mail/senders/EmailTemplate'
import { StatsService } from '../services/stats/StatsService'
import { BasService } from '../services/users/basService'
import { ClientService } from '../services/clients/ClientService'
import { OrderService } from '../services/orders/OrdersService'

export async function sendNewClientMailToOwner (client: any, user: any) {
  const mail = new EmailTemplate('newClient.html')
  if (!client.email) return
  mail.setHandlebarsFields({ userName: user.name, clientName: client.name, clientEmail: client.email })
    .sendMail(
      user.email,
      'Nuevo cliente registrado'
    )
}

export async function sendWelcomeMessageToClient (client:any,user:any) {
  const mail = new EmailTemplate('welcomeClient.html')
  mail.setHandlebarsFields({ userName: user.name, clientName: client.name, clientEmail: client.email })
    .sendMail(
      client.email,
      'Bienvenido a nuestra plataforma'
    )
}

export async function sendWelcomeMessageToClientAsUser (client:any) {
  const mail = new EmailTemplate('clientAsUser.html')
  mail.setHandlebarsFields({ 
    clientName: client.name,
    pageLink: process.env.CLIENT_URL ?? 'https://pos-green.vercel.app/',
    companyEmail: process.env.COMPANY_EMAIL ?? 'hojalateriagutierrez@gmail.com'
  })
    .sendMail(
      client.email,
      'Bienvenido a nuestra plataforma'
    )
}

export async function sendNewOrderRequested (user:any,jwt:string,details:any) {
  const mail = new EmailTemplate('newOrderRequested.html')
  const bas = new BasService()
  const cashiers =  bas.getUsersByRole(jwt,'cashier')
  const admins =  bas.getUsersByRole(jwt,'admin')
  const { order,items } = details
  const resp = await Promise.all([admins,cashiers])
  const users = resp.flat()
  users.push(user)
  const statusSubject = order.status === 'pending' ? 'Nuevo pedido solicitado' : 'Compra completada'
  const subject = `${statusSubject} - Orden #${order.id}`
  
  const mails:any = users.map((user:any) => {
    return mail.setHandlebarsFields(
      { employeeName: user.name,
        orderId: order.id,
        createdAt: new Date(order.createdAt).toLocaleString(),
        items: formatArrayAsHTMLList(items),
        clientName: order.clientName,
        clientEmail: order.email,
        orderTotal: `$ ${order.total.toFixed(2)}`,
        status: order.status,
        paymentMethod: order.paymentType
      }).sendMail(user.email,subject)
  })

  return Promise.all(mails)
}

function formatArrayAsHTMLList (array: any[]) {
  return array.map((item) => `<div>
  <div>${item.name}</div>
  <div>Cantidad:${item.quantity}</div>
  <div>Precio: $ ${item.total.toFixed(2)}</div>
  </div>`).join('')
}

export async function sendBillingNotification (user:any,jwt:string,billingDetails: BillingDetails) {
  const mailService = new EmailTemplate('newInvoice.html')
  const bas = new BasService()
  const cashiers =  bas.getUsersByRole(jwt,'cashier')
  const admins =  bas.getUsersByRole(jwt,'admin')
  const resp = await Promise.all([admins,cashiers])
  const users = resp.flat()
  users.push(user)
  
  
  const emails:any = users.map((user:any) => {
    return mailService.setHandlebarsFields({
      'userName': user.name,
      'orderId': billingDetails.orderIds.join(','),
      'invoiceNumber': billingDetails.folio_number,
      'invoiceDate': new Date(billingDetails.date).toLocaleString(),
      'clientName': billingDetails.clientName,
      'totalAmount': `$ ${billingDetails.total.toFixed(2)}`,
      'paymentMethod': billingDetails.payment_method
    }).sendMail(user.email, 'Factura generada')
  })

  return Promise.all(emails)
}

export async function resumeOfTheWeek () {
  const mailService = new EmailTemplate('resumeOfTheWeek.html')
  const stats = new StatsService()
  const week = await stats.weeklyResume()
  // remove hardcoded email
  return mailService.setHandlebarsFields({
    count: week.orders.count,
    inflow: week.inflow,
    outflow: week.outflow
  }).sendMail('xarkamx@gmail.com','Resumen de la semana')

  
}

export async function sendInvoiceSubstitutionNotification (ogInvoice: any, newInvoice: any,order:any) {
  const mailService = new EmailTemplate('notifyInvoiceSubstitution.html')
  // remove hardcoded email
  return mailService.setHandlebarsFields({
    originalInvoice: ogInvoice.folio_number,
    substituteInvoice: newInvoice.folio_number,
    clientName: ogInvoice.customer.legal_name,
    substitutionDate: new Date().toLocaleString()
  }).sendMail(order.email,'Factura sustituida')
    
}


export async function sendNotificationError (error:errorMessage) {
  const mailService = new EmailTemplate('errorNotification.html')
  // remove hardcoded email
  return mailService.setHandlebarsFields({
    errorCode: error.errorCode,
    errorMessage: error.message,
    errorDateTime: error.errorDateTime,
    username: 'Admin'
  }).sendMail('xarkamx@gmail.com','Error en la plataforma')
}

export async function sendPaymentRemainder (debtorInfo:any) {
  const mailService = new EmailTemplate('paymentRemainder.html')
  if (!debtorInfo.clientEmail) return
  return mailService.setHandlebarsFields({
    clientName: debtorInfo.clientName,
    orderId: debtorInfo.orderId,
    debt: debtorInfo.debt,
    createdAt: new Date(debtorInfo.createdAt).toLocaleString(
      'es-MX',
      { timeZone: 'America/Mexico_City',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'

      }
    )
  }).sendMail(debtorInfo.clientEmail,`Recordatorio de pago pendiente – Orden #${debtorInfo.orderId}`)
}

export async function sendPaymentStatusChangeNotification (jwt:string,paymentDetails:any) {
  const mailService = new EmailTemplate('paymentUpdated.html')
  const users = await getClientsByRole(jwt,['admin','cashier'])
  const orderService = new OrderService()
  const { order }:any = await orderService.getOrderById(paymentDetails.id)
  const debt = order.total - order.partialPayment
  const mails = users.map((user:any) => {
    return mailService.setHandlebarsFields({
      orderId: order.id,
      clientName: order.clientName,
      createdAt: new Date(order.createdAt).toLocaleString(),
      clientEmail: order.email,
      orderTotal: order.total,
      debt: debt.toFixed(2),
      paymentAmount: paymentDetails.payment.toFixed(2),
      paymentDate: new Date().toLocaleString(),
      paymentStatus: order.status,
      paymentMethod: paymentDetails.paymentMethod
    }).sendMail(user.email,`Estado de pago actualizado – Orden #${order.id}`)
  })
  return Promise.all(mails)
}

export async function sendPriceReductionNotification (items: any) {
  const mailService = new EmailTemplate('priceReductionNotification.html')
  const clientService = new ClientService()
  const clients = await clientService.getClients()
  items = formatPriceChangeItems(items)
  return clients.filter((client:any) => client.email).map((client:any) => {
    mailService.setHandlebarsFields({
      userName: client.name,
      items
    }).sendMail(client.email,'¡Ofertas Increíbles! Reducción de Precios 🚀')
  })
  // remove hardcoded email

}



function formatPriceChangeItems (items:any) {
  return items.map((item:any) => `<div>
  <div>${item.name}</div>
  <div>Precio anterior: $ ${item.oldPrice.toFixed(2)}</div>
  <div>Precio nuevo: $ ${item.price.toFixed(2)}</div>
  </div>`).join('')
}


async function getClientsByRole (jwt:string,roles:string[]) {
  const bas = new BasService()
  const userPromises = roles.map((role) => bas.getUsersByRole(jwt,role)).flat()
  const mails = await Promise.all(userPromises)
  return mails.flat()
}

type BillingDetails = {
  orderIds: number[],
  folio_number: string,
  date: string,
  clientName: string,
  total: number,
  payment_method: string
}

type errorMessage = {
  errorCode: string,
  message: string,
  errorDateTime: string
}