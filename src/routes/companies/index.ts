import type { FastifyPluginAsync } from "fastify";
import { CompanyService } from '../../services/companies/companyService';

 const companies: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  
  fastify.route({
    method: "POST",
    url: "/",
    async handler (_request, reply) {
      const {name}:any = _request.body;
      const {email}:any = _request.user;
      const company = new CompanyService();
      await company.addCompany({name},email);
      reply.code(201);
    }
  });

};

export default companies;