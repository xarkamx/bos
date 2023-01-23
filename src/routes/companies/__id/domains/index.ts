import type { FastifyPluginAsync } from 'fastify/types/plugin';
import { CompanyService } from '../../../../services/companies/companyService';
import { DomainsService } from '../../../../services/domains/DomainsService';
import { UsersService } from '../../../../services/users/users.service';

const domains : FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.route({
    method: 'POST',
    url: '/',
    async handler (_request, reply) {
      const {name}:any = _request.body;
      const {id:companyId}:any = _request.params;
      const {id:userId}:any = _request.user;
      
      const userService = new UsersService();
      const isValid = await userService.userBelogsToCompany(userId,companyId);

      if(!isValid){
        reply.code(403);
        return {message:'User does not belong to company'};
      }

      const domain = new DomainsService();
      await domain.addDomain(name,companyId,userId);
      reply.code(201);
    }
  });

  fastify.route({
    method: 'GET',
    url: '/',
    async handler (_request) {
      const companyServices = new CompanyService();
      const {id:companyId}:any = _request.params;
      return companyServices.getCompanyDomains(companyId);
    }
  });
};

export default domains;