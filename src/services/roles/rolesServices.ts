import { RolesModel, type roleType } from '../../models/RolesModel';
import { CompanyService } from '../companies/companyService';
import { UsersService } from '../users/users.service';

export class RolesServices {
  roleModel: RolesModel;
  constructor() {
    this.roleModel = new RolesModel();
  }

  async addRole(role: roleType) {
    const company = new CompanyService();
    const val =await company.getCompanyById(role.companyId);
    if(!val) throw {message: 'Company not found', status: 404}
    const res = await this.roleModel.addRole(role);
    return res;
  }

}

