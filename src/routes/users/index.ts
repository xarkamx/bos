import { BasService } from '../../services/users/basService';

export default async function Users(fastify:any, opts:any) {
  fastify.route({
    method: 'GET',
    url: '/',
    async handler (request:any, reply:any) {
      const bas = new BasService();
      return bas.getUsers(request.headers.authorization);
    }
  })
}