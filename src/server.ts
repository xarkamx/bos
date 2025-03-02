// Require library to exit fastify process, gracefully (if possible)
import closeWithGrace from 'close-with-grace'
import * as dotenv from 'dotenv'
// Require the framework
import Fastify from 'fastify'

import Db from './db'

import all from '.'

// Read the .env file.
dotenv.config()
Db.getInstance()

import { ErrorModel } from './models/ErrorsModel'
import RouterSingleton from './config/routes'
import { MeService } from './services/users/meService'
import { HttpError } from './errors/HttpError'
import { CacheService } from './services/cache/cacheService'
const isProduction = process.env.NODE_ENV === 'production'
// Instantiate Fastify with some config
const app = Fastify({
  logger: !isProduction
})

// Register JWT

// Register your application as a normal plugin.
void app.register(all)

CacheService.getInstance()

app.addHook('onRequest', async (request: any) => {
  
  const { auth } = request.routeOptions.config
  if (auth?.public) {
    return
  }

  if (!request.headers.authorization) {
    throw new HttpError('Missing Authorization Header', 401)
  }
  const user = new MeService(request.headers.authorization.replace('Bearer ', ''))
    
  if (user.isExpired()) {
    throw new HttpError('Token is expired', 401)
  }
    
  const details = await user.getDetails()
  request.user = details
  validate(request)
  
})

function validate (request:any) {
  const { auth } = request.routeOptions.config
  if (!auth) {
    return
  }

  const { roles } = request.user
  if (roles.includes('admin')) {
    return
  }

  // User has any of the roles
  const hasRoles = auth.roles.some((role:string) => roles.includes(role))
  if (!hasRoles) {
    const roles:string = auth.roles.join(',')
    throw new HttpError(`Invalid User Role, expecting ${roles}`, 403)
  }
}



// Delay is the number of milliseconds for the graceful close to finish
const closeListeners = closeWithGrace({ delay: 500 }, async (opts: any) => {
  if (opts.err) {
    process.exit(1)
  }

  await app.close()
})



app.addHook('onRoute', (routeOptions) => {
  RouterSingleton.getInstance().addRoute(routeOptions)
})


const model = new ErrorModel()
app.addHook('onError', model.addError.bind(model))



app.addHook('onClose', async () => {
  closeListeners.uninstall()
  return true
})




// Start listening.
void app.listen({
  port: Number(process.env.PORT ?? 3000),
  host: process.env.SERVER_HOSTNAME ?? '127.0.0.1'
})

app.ready((err: any) => {
  if (err) {
    process.exit(1)
  }
  

})

export { app }
