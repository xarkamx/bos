import type { FastifyPluginAsync } from "fastify";
import { CompanyAuth } from '../../services/companies/companyAuth';
import { CompanyService } from '../../services/companies/companyService';
import { UsersService } from '../../services/users/users.service';

 const companies: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.route({
    method: "POST",
    url: "/",
    async onRequest (request, reply) {
      const {id}:any = request.user;
      const companyAuth = new CompanyAuth();
      try{
      await companyAuth.isMasterUser(id);
      }catch(err: any){
        reply.code(err.code).send({message:err.message});
      }
    },
    async handler (_request, reply) {
      const {name}:any = _request.body;
      const {email}:any = _request.user;
      const company = new CompanyService();
      await company.addCompany({name},email);
      reply.code(201);
    }
  });
  fastify.route({
    method: "GET",
    url: "/",
    async handler (_request, reply) {
      reply.code(200);
    }
  })

};

export default companies;

