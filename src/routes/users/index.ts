import { BasService } from '../../services/users/basService';

export default async function Users(fastify:any, opts:any) {
  fastify.route({
    method: 'GET',
    url: '/',
    config:{
      auth:{
        roles:['admin']
      }
    },
    async handler (request:any, reply:any) {
      const bas = new BasService();
      return bas.getUsers(request.headers.authorization);
    }
  })

  fastify.route({
    method: 'POST',
    url: '/',
    schema:{
      body:{
        type:'object',
        required:['name','email','password','role'],
        properties:{
          name:{type:'string'},
          email:{type:'string'},
          password:{type:'string'},
          role:{type:'string'}
        }
      }
    },
    config:{
      auth:{
        roles:['admin']
      }
    },
    async handler (request:any, reply:any) {
      const bas = new BasService();
      const user = await bas.addUser(request.headers.authorization, request.body);
      await bas.addRole(request.headers.authorization, user.userId, request.body.role);
      return {
        user,
      };
    }
  });
}