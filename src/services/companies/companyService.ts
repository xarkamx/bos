import { CompanyModel, type ICompany } from '../../models/CompanyModel';
import { RolesModel } from '../../models/RolesModel';
import { UsersService } from '../users/users.service';

export class CompanyService {
  companyModel: CompanyModel;
  constructor() {
    this.companyModel = new CompanyModel();
  }

  async addCompany(company: ICompany,email:string) {
    const userService = new UsersService();
    const user = await userService.getUser({email});
    if(!user.id || !email) throw {message:'User not found',status:404};
    const companyId = await this.companyModel.addCompany(company);
    await this.companyModel.addUserToCompany(companyId[0],user.id);
    const roleId = await this.addMasterRole(companyId[0]);
    await userService.addRoleToUser(user.id,roleId);
    return {message:'Company created',status:201};
  }

  async addMasterRole(companyId: number) {
    const role = {
      name: 'master',
      companyId
    };
    const roleModel = new RolesModel();
    const roleExists = await roleModel.getRole(role);
    if(roleExists) return roleExists.id;
    const res = await roleModel.addRole(role);
    return res;
  }

  async getCompany(query: any) {
    const res = await this.companyModel.getCompany(query);
    return res;
  }
  
  async getCompanyById(id: number) {
    const res = await this.companyModel.getCompany({id});
    return res;
  }
}