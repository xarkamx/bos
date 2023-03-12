import { PaymentsModel } from '../../models/PaymentsModel';
import { ClientModel } from '../../models/ClientModel';
import { ProductsModel } from '../../models/productsModel';
import { OrderModel } from '../../models/OrderModel';

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
}