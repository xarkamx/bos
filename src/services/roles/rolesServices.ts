import { RolesModel, type roleType } from '../../models/RolesModel';
import { CompanyService } from '../companies/companyService';

export class RolesServices {
  roleModel: RolesModel;
  constructor() {
    this.roleModel = new RolesModel();
  }

  async addRole(role: roleType) {
    const company = new CompanyService();
    const val =await company.getCompanyById(role.companyId);
    if(!val) throw {message: 'Company not found', status: 404}
    const validRole = await this.roleModel.getRole(role);
    if(validRole) return [validRole.id];
    const res = await this.roleModel.addRole(role);
    return res;
  }

  async getRole(role: roleType) {
    return this.roleModel.getRole(role);
  }

  async getRoleByUserId(userId: number, companyId: number) {
    return this.roleModel.getRolesByUserId(userId, companyId);
  }

}

