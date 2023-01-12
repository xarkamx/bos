import type { FastifyPluginAsync } from 'fastify/types/plugin';
import { DomainsService } from '../../services/domains/DomainsService';

const domains : FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.route({
    method: 'POST',
    url: '/',
    async handler (_request, reply) {
      const {name}:any = _request.body;
      const domain = new DomainsService();
      await domain.addDomain(name);
      reply.code(201);
    }
  });
};

export default domains;