import { type FastifyInstance } from 'fastify';
import { CompanyService } from '../../../../../services/companies/companyService';
import { RolesServices } from '../../../../../services/roles/RolesServices';
import { UsersService } from '../../../../../services/users/users.service';

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/',
    async handler(request:any, reply)  {
      const {id,userId} = request.params;
      const companyService = new CompanyService();
      const user = await companyService.getCompanyUserById(id,userId);
      if(!user){
        reply.code(404);
        return {message:'User not found'};
      }

      return user;
    }
  },
  );
  fastify.route({
    method: 'POST',
    url: '/roles',
    async handler(request:any, reply)  {
      const {id,userId} = request.params;
      const {roleName} = request.body;
      try{
        const {userService,role} = await validateRole(roleName,id,userId);
        await userService.addRoleToUser(userId,role.id);
        reply.code(201);
      }catch(err:any){
        reply.code(err.code || 500).send({message:err.message});
      }
  }})
}

async function validateRole(roleName:string,id:number,userId:number){
  const userService = new UsersService();
  const roleService = new RolesServices();
  const resp = await Promise.allSettled([
    roleService.getRole({name:roleName,companyId:id}),
    userService.userBelogsToCompany(userId,id)]);

  const [role,isValid] = resp.map((r:any)=>r.value);
  if(!role){
    throw {message:'Role not found',code:404};
  }

  if(!isValid){
    throw {message:'User does not belong to company',code:403};
  }

  const hasRole = await userService.userHasRole(userId,role.id);
  if(hasRole){
    throw {message:'User already has role',code:409};
  }

  return {
    userService,
    role
  }
}