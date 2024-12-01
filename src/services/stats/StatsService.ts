import { PaymentsModel } from '../../models/PaymentsModel';
import { ClientModel } from '../../models/ClientModel';
import { ProductsModel } from '../../models/productsModel';
import { OrderModel } from '../../models/OrderModel';
import { db } from '../../config/db';
export class StatsService{
    async getAbsoluteNumberOfClients(){
      const cm = new ClientModel();
      return cm.countClients();
    }

    async getAbsoluteNumberOfProducts(){
      const pm = new ProductsModel();
      return pm.countProducts();
    }

    async getAbsoluteNumberOfOrders(){
      const om = new OrderModel();
      return om.countOrders();
    }
    
    async getGlobalEarnings(){
      const pm = new PaymentsModel();
      const payments = await pm.getAll(['amount','flow']);
      const earnings = payments.reduce((acc:number,curr:any)=>{
        const amount:number = curr.flow==='inflow'?curr.amount:-curr.amount;
        acc+=amount;
        return acc;
      },0);
      return earnings;
    }

    async getDebtors(){
      const resp= await db.raw(`SELECT clients.client_id as clientId,clients.name, sum(total-partial_payment) as debt
       FROM orders 
       left join clients on orders.client_id = clients.client_id 
       where status='pending' GROUP by clients.client_id  
      ORDER BY debt DESC`);
      return resp[0];
    }

    async getSalesPerProduct(){
      const resp = await db.raw(`SELECT products.id,name,sum(quantity)as qty ,sum(items.price) as total FROM items
         left join products on products.id = items.product_id 
         GROUP by product_id  
        ORDER BY total DESC`
        );
      return resp[0];
    }

    async weeklyResume(){
      const paymentModel = new PaymentsModel();
      const orderModel = new OrderModel();
      const payments = await paymentModel.getPaymentsOfCurrentWeek();
      const outflow = payments.find((p:any)=>p.flow==='outflow')?.total||0;
      const inflow = payments.find((p:any)=>p.flow==='inflow')?.total||0;

      // number of products out of stock

      return {
        orders:await orderModel.countOrders().whereRaw(`YEARWEEK(created_at) = YEARWEEK(NOW())`).first(),
        outflow,
        inflow
      }


    }

    async getExpiredDebts(){
      const ordersModel = new OrderModel();
      return ordersModel.getOrders()
      .join('clients','orders.client_id','clients.client_id')
      .where({status:'pending'})
      .whereRaw('total - partial_payment > 1000')
      .whereRaw('DATEDIFF(NOW(),created_at) > 14')
      .select({
       "orderId": "orders.id",
        "clientId": "clients.client_id",
        "clientName": "clients.name",
        "clientEmail": "clients.email",
        "clientPhone": "clients.phones",
        "total": "orders.total",
        "paymentAmount": "orders.partial_payment",
        "debt": db.raw('total - partial_payment'),
        "days": db.raw('DATEDIFF(NOW(),created_at)'),
        "createdAt": "orders.created_at"
      })
    }
}