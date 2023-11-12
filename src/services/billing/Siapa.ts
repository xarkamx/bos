import axios from 'axios';
import { BillableServicesModel } from '../../models/BillableServiceModel';

export class Siapa {
  
    async get(code:string) {
        const response = await axios.post(`https://api.siapa.wispok.mx/api/siapa/user/inscription/${code}`);
        const content = response.data.data
        const {DOMICI,ENTREC,COLONI,MUNICI,FECVEN,TOTAL1} = content.data
        const history = [
          content.data.HISTC2['0'],
          content.data.HISTC3['0'],
          content.data.HISTC4['0'],
          content.data.HISTC5['0'],
          content.data.HISTC6['0'],
          content.data.HISTC7['0'],
          content.data.HISTC8['0'],
          content.data.HISTC9['0'],
          content.data.HISTC10['0']
          
        ]

        const keys = content.data.HISTC1["0"].split(/\s{2,}/).filter((item:string) => item !== '');
        keys.push('total')
        let values = history.map((item:string) => item.split(/\s{3,}/));
        values = values.map((item:string[]) => {
          const obj:any = {};
          item.forEach((value:string, index:number) => {
            obj[keys[index]] = value;
          });
          return obj;
        });
        let date = FECVEN["0"].split('.')
        date = new Date(date[2],date[1],date[0])
        return {
          paymentUrl: `https://siapa.wispok.mx/cc/${code}`,
          total: TOTAL1["0"],
          address: `${DOMICI["0"]} ${ENTREC["0"]} ${COLONI["0"]} ${MUNICI["0"]}` ,
          dueDate: date,
          history:values,
          qr: response.data.qr,
        };
    }

    async getSimple(code:string){
      const response = await axios.get(`https://api.siapa.wispok.mx/api/pokme/get-info/encripter/${code}`);
      const content = response.data.data

      return {
        paymentUrl: `https://siapa.wispok.mx/cc/${code}`,
        total:content.pendient.mounth.total_decimal,
        dueDate:content.pendient.due_date,
        status:content.pendient.due_paymenths.map((item:any) =>( {status:item.status,date:item.due_month})),

      }
    }

    async getAll(){
      const model = new BillableServicesModel();
      let content = await model.getByName('siapa');
      content = content.map((item:any)=>this.getSimple(item.code))

      return Promise.all(content);
    }

    async add(code:string){
      const model = new BillableServicesModel();
      model.add({name:'siapa', code});
    }
}