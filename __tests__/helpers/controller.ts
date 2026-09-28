import Fastify, { FastifyPluginAsync } from 'fastify'
import { jest } from '@jest/globals'

export const user = { id: 1, email: 'cashier@example.test' }

export function methods (...names: string[]) {
  return Object.fromEntries(names.map(name => [name, jest.fn<(...args: any[]) => Promise<any>>()]))
}

export function resetServices (...services: ReturnType<typeof methods>[]) {
  for (const service of services) {
    for (const method of Object.values(service)) method.mockReset()
  }
}

export async function createControllerApp (route: FastifyPluginAsync, prefix: string) {
  const app = Fastify()
  // Controller tests supply a user; production authorization is not replicated.
  app.decorateRequest('user', null)
  app.addHook('onRequest', async request => { (request as any).user = { user, roles: ['admin'] } })
  try {
    await app.register(route, { prefix })
    await app.ready()
    return app
  } catch (error) {
    await app.close()
    throw error
  }
}
