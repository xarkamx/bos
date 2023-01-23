import type { FastifyPluginAsync } from "fastify";
import { RolesServices } from '../../../../services/roles/RolesServices';
import { UsersService } from '../../../../services/users/users.service';

 const Roles: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  
  fastify.route({
    method: "POST",
    url: "/",
    async handler (_request, reply) {
      const {roleName:name}:any = _request.body;
      const {id:companyId}:any = _request.params;
      const {id}:any = _request.user;
      const roles = new RolesServices();
      const userService = new UsersService();
      
      try{
        const validUser = await userService.userBelogsToCompany(id,companyId);
        if(!validUser ) {
          reply.code(401);
          return {message:'User not authorized'};
        }

        await roles.addRole({name,companyId});
        reply.code(201);
      }catch(err: any){
        reply.code(err.status).send({message:err.message});
      }
      
      
    }
  });

};

export default Roles;