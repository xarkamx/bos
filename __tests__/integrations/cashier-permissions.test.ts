import Fastify, { type FastifyInstance } from 'fastify'
import { afterEach, beforeEach, expect, it, jest } from '@jest/globals'
import { methods, resetServices, user } from '../helpers/controller'

const mockClients = methods('getClient', 'updateClient')
const mockOrders = methods('getOrderById', 'updateOrder')
const mockBilling = methods('addInvoice', 'customInvoice', 'sendInvoice')
jest.mock('../../src/services/clients/ClientService', () => ({ ClientService: jest.fn(() => mockClients) }))
jest.mock('../../src/services/orders/OrdersService', () => ({ OrderService: jest.fn(() => mockOrders) }))
jest.mock('../../src/services/billing/BillingService', () => ({ BillingService: jest.fn(() => mockBilling) }))
jest.mock('../../src/services/billing/FacturaApiService', () => ({ FacturaApiService: jest.fn() }))
jest.mock('../../src/models/ApiKeyModel', () => ({ ApiKeyModel: jest.fn() }))
jest.mock('../../src/utils/mailSender', () => ({ sendBillingNotification: jest.fn() }))
import clients from '../../src/routes/clients'
import orders from '../../src/routes/orders'
import billing from '../../src/routes/billing'

let app: FastifyInstance
let roles: string[]
beforeEach(async () => {
  resetServices(mockClients, mockOrders, mockBilling)
  roles = ['cashier']
  app = Fastify()
  app.decorateRequest('user', null)
  // Test identity replaces BAS; route authorization follows both production entry points.
  app.addHook('onRequest', async (request, reply) => {
    ;(request as any).user = { user, roles }
    const auth = (request.routeOptions.config as any).auth
    if (!auth?.public && !roles.includes('admin') && !auth?.roles?.some((role: string) => roles.includes(role))) {
      return reply.code(403).send({ message: 'Forbidden' })
    }
  })
  await app.register(clients, { prefix: '/clients' })
  await app.register(orders, { prefix: '/orders' })
  await app.register(billing, { prefix: '/billing' })
  await app.ready()
})
afterEach(async () => { await app?.close() })

it('lets cashier read order and client details', async () => {
  mockOrders.getOrderById.mockResolvedValue({ order: { id: 42, total: 50 } })
  mockClients.getClient.mockResolvedValue({ id: 7, name: 'Cliente' })
  expect((await app.inject('/orders/42')).statusCode).toBe(200)
  expect((await app.inject('/clients/7')).statusCode).toBe(200)
})
it.each(['/billing', '/billing/custom'])('lets cashier issue via %s', async url => {
  mockBilling.addInvoice.mockResolvedValue({ id: 'inv', customer: { legal_name: 'Cliente' } })
  mockBilling.customInvoice.mockResolvedValue({ id: 'custom-inv' })
  const response = await app.inject({ method: 'POST', url, payload: { orderIds: [42], paymentType: '01', paymentMethod: 'PUE' } })
  expect(response.statusCode).toBe(200)
  expect(url === '/billing' ? mockBilling.addInvoice : mockBilling.customInvoice).toHaveBeenCalled()
})
it('rejects cashier edits to customer data', async () => {
  const response = await app.inject({ method: 'PUT', url: '/clients/7', payload: { name: 'Cambio' } })
  expect(response.statusCode).toBe(403)
  expect(mockClients.updateClient).not.toHaveBeenCalled()
})
it('rejects cashier changing the customer of an existing order', async () => {
  const response = await app.inject({ method: 'PUT', url: '/orders/42', payload: { clientId: 8 } })
  expect(response.statusCode).toBe(403)
  expect(mockOrders.updateOrder).not.toHaveBeenCalled()
})
it('keeps admin customer editing and order reassignment', async () => {
  roles = ['cashier', 'admin']
  mockClients.getClient.mockResolvedValue({ id: 7, name: 'Cambio' })
  mockOrders.updateOrder.mockResolvedValue({ id: 42 })
  expect((await app.inject({ method: 'PUT', url: '/clients/7', payload: { name: 'Cambio' } })).statusCode).toBe(200)
  expect((await app.inject({ method: 'PUT', url: '/orders/42', payload: { clientId: 8 } })).statusCode).toBe(200)
  expect(mockClients.updateClient).toHaveBeenCalled()
  expect(mockOrders.updateOrder).toHaveBeenCalledWith('42', { clientId: 8 })
})