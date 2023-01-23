import { CompanyModel, type UserWithDomainName, type ICompany } from '../../models/CompanyModel';
import { RolesModel } from '../../models/RolesModel';
import { RolesServices } from '../roles/RolesServices';
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

  async addUserToCompany(companyId: number, userId: number) {
    const userService = new UsersService();
    const user = await userService.userBelogsToCompany(userId,companyId);
    if(user) {
      throw {message:'User already in company',status:400};
    }
    
    return this.companyModel.addUserToCompany(companyId,userId);
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

  async getCompanyUsers(id: number) {
    const res:UserWithDomainName[] = await this.companyModel.getCompanyUsers(id);
    return formatUserList(res);
  }

  async getCompanyDomains(id: number) {
    const res = await this.companyModel.getCompanyDomains(id);
    return res;
  }

  async getCompanyUserByEmail(id: number, email: string) {
    return this.companyModel.getCompanyUserByEmail(id,email);
  }

  async getCompanyUserById(id: number, userId: number) {
    const users:UserWithDomainName[]= await this.companyModel.getCompanyUsers(id).where({'users.id':userId});
    const roleService = new RolesServices();
    const roles = await roleService.getRoleByUserId(userId,id);
    const user= formatUserList(users)[0];
    user.roles = roles.map((role:any) => role.name);
    return user;
  }

}

function formatUserList(users: UserWithDomainName[]) {
  return users.reduce(userReducer,[]);
}

function userReducer(acc:UserWithDomains[],curr:UserWithDomainName) {
  const {name,email,domain_name,role_name} = curr;
  if(acc.length === 0) return [{name,email,roles:[role_name],domains:[domain_name]}]
  const user = acc.find((user:any) => user.email === email);
  user?.domains.push(domain_name);
  user?.roles.push(role_name);
  return acc;
}

type UserWithDomains = {
  name: string;
  email: string;
  domains: string[];
  roles: string[];
}
