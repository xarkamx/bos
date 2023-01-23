import { DomainModel } from '../../models/DomainsModel';

export class DomainsService {
  async addDomain(name: string, companyId?: number, userId?: number) {
    const domain = new DomainModel();
    try{
      const [domainId] = await domain.addDomain(name);

      if(companyId){
        await domain.addDomainToCompany(domainId, companyId);
      }
  
      if(userId){
        await domain.addDomainToUser(domainId, userId);
      }
    }catch(e:any){
      return {message: e.message}
    }
 
  }
}