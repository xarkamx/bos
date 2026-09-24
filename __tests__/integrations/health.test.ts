import Fastify from 'fastify'
import { describe, it, expect } from '@jest/globals'
import root from '../../src/routes/root'

describe('Health endpoint', () => {
  it('returns the health payload without opening a listening socket', async () => {
    const app = Fastify()
    try {
      await app.register(root)
      const response = await app.inject({ method: 'GET', url: '/health/check' })
      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({ status: true })
    } finally {
      await app.close()
    }
  })
})
