import type { FastifyPluginAsync } from 'fastify';
import { UsersService } from '../../services/users/users.service';


const user: FastifyPluginAsync = async (fastify:any, _opts): Promise<void> => {
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      public: true,
    },
    async handler (request:any, reply:any)  {
      
      const {username,email,password}:basicUser = request.body;
      const userService = new UsersService();
      const userExist = await userService.getUser({email});
      if(userExist) {
        reply.code(409);
        return {message:'User already exist'};
      }
    
      await userService.addUser({name:username,email, password});
      reply.code(201);
    }});

    fastify.route({
      method: 'POST',
      url: '/signup',
      schema: {
        public: true,
      },
      async handler (request:any, reply:any)  {
        const {username,email,password}:any = request.body;
        const userService = new UsersService();
        const userExist = await userService.getUser({email,name:username});
        if(!userExist) {
          reply.code(404);
          return {message:'User not found'};
        }

        const valid =await userService.singUp({name:username,email, password});
        
        if(!valid) {
          reply.code(401);
          return {message:'Invalid credentials'};
        }

        const token = fastify.jwt.sign({email:userExist.email,id:userExist.id}, {expiresIn: '1h'});
        
        reply.code(200).send({token,ttl:3600});
      }});
};



type basicUser = {
  username: string;
  email: string;
  password: string;
};
export default user;
