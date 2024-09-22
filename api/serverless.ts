// Require library to exit fastify process, gracefully (if possible)
import closeWithGrace from "close-with-grace";
import * as dotenv from "dotenv";
// Require the framework
import Fastify from "fastify";

import Db from "../src/db";
import all from "../src";
// Read the .env file.
dotenv.config();
Db.getInstance();
import RouterSingleton from '../src/config/routes';
import { MeService } from '../src/services/users/meService';
import { HttpError } from '../src/errors/HttpError';
const isProduction = process.env.NODE_ENV === "production";
// Instantiate Fastify with some config
const app = Fastify({
  logger: !isProduction,
});

// Register JWT

// Register your application as a normal plugin.
void app.register(all);


app.addHook("onRequest", async (request: any, reply) => {
  const {auth} = request.routeOptions.config;
  if(auth?.public){
    return;
  }

  if(!request.headers.authorization){
    throw new HttpError('Missing Authorization Header', 401);
  }

    const user = new MeService(request.headers.authorization.replace('Bearer ', ''));
    if(user.isExpired()){
      throw new HttpError('Token is expired', 401);
    }
    
    const details = await user.getDetails();
    request.user = details;
    validate(request);
  
});

function validate(request:any) {
  const {auth} = request.routeOptions.config;
  if(!auth){
    return;
  }

  const {roles} = request.user;
  if(roles.includes('admin')){
    return;
  }

  // User has any of the roles
  const hasRoles = auth.roles.some((role:string)=>roles.includes(role));
  if(!hasRoles){
    const roles:string= auth.roles.join(',');
    throw new HttpError(`Invalid User Role, expecting ${roles}`, 403);
  }
}



// Delay is the number of milliseconds for the graceful close to finish
const closeListeners = closeWithGrace({ delay: 500 }, async (opts: any) => {
  if (opts.err) {
    app.log.error(opts.err);
  }

  await app.close();
});



app.addHook("onRoute", (routeOptions) => {
  RouterSingleton.getInstance().addRoute(routeOptions);
});




app.addHook("onClose", async (_instance, done) => {
  closeListeners.uninstall();
  done();
});






export default async (req: any, res: any) => {
  await app.ready();
  app.server.emit("request", req, res);
};