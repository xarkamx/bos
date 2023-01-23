import { CompanyService } from '../../../../services/companies/companyService';

export default async function (fastify: any) {
  fastify.route({
    method: 'GET',
    url: '/',
    async handler(request:any, reply:any)  {
      const {id} = request.params;
      const companyService = new CompanyService();
      const res = await companyService.getCompanyUsers(id);
      reply.send(res);
    }
  });
  fastify.route({
    method: 'POST',
    url: '/',
    accessLevel: {
      level: 'company',
      roles: ['fake']
    },
    async handler(request:any, reply:any)  {
      reply.send({message: 'ok'});
      // Const {id} = request.params;
      // const {userId} = request.body;
      // const companyService = new CompanyService();
      // const res = await companyService.addUserToCompany(id,userId);
      // reply.send(res);
    }
  });
}