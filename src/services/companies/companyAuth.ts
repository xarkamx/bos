import { CompanyService } from './companyService';

export class CompanyAuth{
  async  isMasterUser (userId: any) {
    return this.validUser(userId, 1,['master']);
  }

  async validUser (userId: number, companyId: number,roles:string[]) {
    const companyServices = new CompanyService();
    const user =  await companyServices.getCompanyUserById(userId, companyId);
    if(!user) throw {message: 'User not found', status: 404};
    const hasRoles = roles.some((role) => user.roles.includes(role));
    if(!hasRoles) throw {message: 'User not authorized', status: 401};
    return user;
  }
  
}