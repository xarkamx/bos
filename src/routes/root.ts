import type { FastifyPluginAsync } from 'fastify'
import RouterSingleton from '../config/routes'
const root: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get('/', async () => {
    const routes = RouterSingleton.getInstance().getRoutes()
    return routes.filter((route) => route.method !== 'OPTIONS' && route.method !== 'HEAD')
  })
  fastify.get('/health/check', async () => ({ status: true }))
}

export default root
