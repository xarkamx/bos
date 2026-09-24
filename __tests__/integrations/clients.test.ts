import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createControllerApp, methods, resetServices } from '../helpers/controller'

const mockClients = methods('getClients', 'getClient', 'createClient', 'updateClient', 'getClientByEmail')

// Explicit factories keep database and external-service implementations unloaded.
jest.mock('../../src/services/clients/ClientService', () => ({ ClientService: jest.fn(() => mockClients) }))

jest.mock('../../src/utils/mailSender', () => ({
  sendNewClientMailToOwner: jest.fn(),
  sendWelcomeMessageToClient: jest.fn(),
  sendWelcomeMessageToClientAsUser: jest.fn()
}))

import controller from '../../src/routes/clients'

let app: FastifyInstance

beforeEach(async () => {
  resetServices(mockClients)
  app = await createControllerApp(controller, '/clients')
})

afterEach(async () => { await app?.close() })

describe('clients controller', () => {
  it('creates a client with fiscal defaults', async () => {
    mockClients.createClient.mockResolvedValue([7])
    mockClients.getClient.mockResolvedValue({ id: 7 })
    const payload = { name: 'Customer', phones: ['5551234567'], postal_code: '44100' }
    const response = await app.inject({ method: 'POST', url: '/clients', payload })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual([7])
    expect(mockClients.createClient).toHaveBeenCalledWith({ ...payload, rfc: 'XAXX010101000', legal: false, tax_system: '601' })
    expect(mockClients.getClient).toHaveBeenCalledWith(7)
  })

  it('returns 404 when an updated client cannot be found', async () => {
    mockClients.getClient.mockResolvedValue(undefined)
    const response = await app.inject({ method: 'PUT', url: '/clients/7', payload: { name: 'Updated' } })
    expect(response.statusCode).toBe(404)
    expect(response.json().message).toBe('Client not found')
  })

  it('GET /clients returns service data', async () => {
    mockClients.getClients.mockResolvedValue([{ id: 42 }])
    const response = await app.inject({ method: 'GET', url: '/clients' })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual([{ id: 42 }])
    expect(mockClients.getClients).toHaveBeenCalledWith(...[])
  })

  it('GET /clients/42 returns service data', async () => {
    mockClients.getClient.mockResolvedValue([{ id: 42 }])
    const response = await app.inject({ method: 'GET', url: '/clients/42' })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual([{ id: 42 }])
    expect(mockClients.getClient).toHaveBeenCalledWith(...['42'])
  })

  it('rejects a client missing required contact and fiscal fields', async () => {
    const response = await app.inject({ method: 'POST', url: '/clients', payload: { name: 'Customer' } })
    expect(response.statusCode).toBe(400)
    expect(response.json()).toMatchObject({ error: 'Bad Request', statusCode: 400 })
    expect(mockClients.createClient).not.toHaveBeenCalled()
  })
})
