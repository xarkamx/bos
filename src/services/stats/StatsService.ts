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
}