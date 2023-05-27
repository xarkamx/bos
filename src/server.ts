// Require library to exit fastify process, gracefully (if possible)
import closeWithGrace from "close-with-grace";
import * as dotenv from "dotenv";
// Require the framework
import Fastify from "fastify";

import Db from "./db";

// Read the .env file.
dotenv.config();
Db.getInstance();

import { ErrorModel } from './models/ErrorsModel';
import RouterSingleton from './config/routes';
import { MeService } from './services/users/meService';
import { HttpError } from './errors/HttpError';
const isProduction = process.env.NODE_ENV === "production";
// Instantiate Fastify with some config
const app = Fastify({
  logger: !isProduction,
});

// Register JWT

// Register your application as a normal plugin.
void app.register(import("."));


app.addHook("onRequest", async (request: any, reply) => {
  const {auth} = request.context.config;
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
  const {auth} = request.context.config;
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
    throw new HttpError(`Invalid User Role, expecting ${auth.roles.join(',')}`, 403);
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


const model = new ErrorModel();
app.addHook('onError', model.addError.bind(model));



app.addHook("onClose", async (_instance, done) => {
  closeListeners.uninstall();
  done();
});




// Start listening.
void app.listen({
  port: Number(process.env.PORT ?? 3000),
  host: process.env.SERVER_HOSTNAME ?? "127.0.0.1",
});

app.ready((err: Error) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }

  app.log.info(`Server listening on port ${Number(process.env.PORT ?? 3000)}`);

});

export { app };
