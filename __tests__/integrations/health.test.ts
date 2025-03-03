import supertest from 'supertest'
import { app } from '../../src/server'
import { describe, afterAll,beforeAll,it,expect } from '@jest/globals'

describe('Health Check API', () => {
  let request: any

  beforeAll(async () => {
    await app.ready()
    request = supertest(app.server)
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /health', () => {
    it('should return 200 OK status', async () => {
      const response = await request.get('/health/check')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer token')
      expect(response.status).toBe(200)
    })
  })
})