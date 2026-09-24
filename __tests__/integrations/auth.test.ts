import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createControllerApp, methods, resetServices, user } from '../helpers/controller'

const mockBas = methods('auth')

// Explicit factories keep database and external-service implementations unloaded.
jest.mock('../../src/services/users/basService', () => ({ BasService: jest.fn(() => mockBas) }))

import controller from '../../src/routes/auth'
import { HttpError } from '../../src/errors/HttpError'

let app: FastifyInstance

beforeEach(async () => {
  resetServices(mockBas)
  app = await createControllerApp(controller, '/auth')
})

afterEach(async () => { await app?.close() })

describe('auth controller', () => {
  it('returns the authentication response from BAS', async () => {
    const result = { jwt: 'test-token', ttl: 3600, roles: ['cashier'] }
    mockBas.auth.mockResolvedValue(result)
    const payload = { email: user.email, password: 'test-only' }
    const response = await app.inject({ method: 'POST', url: '/auth', payload })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual(result)
    expect(mockBas.auth).toHaveBeenCalledWith(payload)
  })

  it('preserves an authentication rejection status', async () => {
    mockBas.auth.mockRejectedValue(new HttpError('Invalid credentials', 401))
    const response = await app.inject({ method: 'POST', url: '/auth', payload: { email: user.email, password: 'wrong' } })
    expect(response.statusCode).toBe(401)
    expect(response.json().message).toBe('Invalid credentials')
  })
})
