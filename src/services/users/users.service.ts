import { type queryUser, UserModel } from '../../models/UserModel';
import type { IUser } from '../../models/UserModel';
import { validatePassword } from '../../utils/passwordUtils';

export class UsersService {
  model: UserModel;
  constructor() {
    this.model = new UserModel();
  }

  async addUser(user:IUser) {
    return this.model.addUser(user);
  }

  async getUser(query: queryUser) {
    return this.model.getUser(query);
  }
  
  async addRoleToUser(userId: number, roleId: number) {
    return this.model.addRoleToUser(userId, roleId);
  }
  
  async userHasRole(userId: number, roleId: number) {
    return Boolean(await (this.model.userHasRole(userId, roleId)));
  }

  

  async singUp(user:IUser) {
    const userExist = await this.getUser({email:user.email, name:user.name});
    return validatePassword(user.password, userExist.password);
  }

  async userBelogsToCompany(userId: number, companyId: number) {
    return Boolean(await this.model.userBelogsToCompany(userId, companyId));
  }
  
}
