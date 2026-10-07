import Fastify, { type FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createControllerApp, methods, resetServices, user } from '../helpers/controller'

const mockOrders = methods('getOrderUuid', 'getAllOrders', 'getOrderById', 'addOrder', 'pay', 'cancelOrder', 'updateOrder', 'getPPDOrdersByBillId')
const mockClients = methods('getClients', 'getClient', 'createClient', 'updateClient', 'getClientByEmail')

// Explicit factories keep database and external-service implementations unloaded.
jest.mock('../../src/services/orders/OrdersService', () => ({ OrderService: jest.fn(() => mockOrders) }))
jest.mock('../../src/services/clients/ClientService', () => ({ ClientService: jest.fn(() => mockClients) }))

jest.mock('../../src/utils/mailSender', () => ({
  sendNewOrderRequested: jest.fn(),
  sendPaymentStatusChangeNotification: jest.fn()
}))

import controller from '../../src/routes/orders'
import { sendNewOrderRequested, sendPaymentStatusChangeNotification } from '../../src/utils/mailSender'

let app: FastifyInstance

beforeEach(async () => {
  resetServices(mockOrders, mockClients)
  app = await createControllerApp(controller, '/orders')
})

afterEach(async () => { await app?.close() })

describe('orders controller', () => {
  it('coerces pagination and numeric query filters', async () => {
    mockOrders.getAllOrders.mockResolvedValue([])
    const response = await app.inject('/orders?page=2&limit=10&total=50&status=pending')
    expect(response.statusCode).toBe(200)
    expect(mockOrders.getAllOrders).toHaveBeenCalledWith({ page: 2, limit: 10, total: 50, status: 'pending' }, 2, 10)
  })

  it('creates an order with the default payment type and notifies using its details', async () => {
    const payload = { clientId: 7, discount: 0, partialPayment: 0, items: [{ id: 2, quantity: 1 }] }
    mockOrders.addOrder.mockResolvedValue({ data: { orderId: 42 } })
    mockOrders.getOrderById.mockResolvedValue({ id: 42, total: 50 })
    const response = await app.inject({ method: 'POST', url: '/orders', payload, headers: { authorization: 'Bearer test' } })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ data: { orderId: 42 } })
    expect(mockOrders.addOrder).toHaveBeenCalledWith({ ...payload, paymentType: 1 })
    expect(mockOrders.getOrderById).toHaveBeenCalledWith(42)
    expect(sendNewOrderRequested).toHaveBeenCalledWith(user, 'Bearer test', { id: 42, total: 50 })
  })

  it('resolves the customer for requested orders', async () => {
    mockClients.getClientByEmail.mockResolvedValue({ id: 7 })
    mockOrders.addOrder.mockResolvedValue({ data: { orderId: 42 } })
    mockOrders.getOrderById.mockResolvedValue({ id: 42 })
    const response = await app.inject({ method: 'POST', url: '/orders/request', payload: { items: [] } })
    expect(response.statusCode).toBe(200)
    expect(mockClients.getClientByEmail).toHaveBeenCalledWith(user.email)
    expect(mockOrders.addOrder).toHaveBeenCalledWith({ items: [], clientId: 7, discount: 0, status: 'requested', paymentType: 99 })
  })

  it('records an order payment using the default payment method', async () => {
    mockOrders.pay.mockResolvedValue({ message: 'Paid' })
    const response = await app.inject({ method: 'PUT', url: '/orders/42/payment', payload: { payment: 25, clientId: 7 } })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ message: 'Paid' })
    expect(mockOrders.pay).toHaveBeenCalledWith('42', 7, 25, 1)
    expect(sendPaymentStatusChangeNotification).toHaveBeenCalledWith(undefined, { id: '42', clientId: 7, payment: 25, paymentMethod: 1 })
  })

  it('GET /orders/42 returns service data', async () => {
    mockOrders.getOrderById.mockResolvedValue({ order: { id: 42, publicUuid: 'c40d5e7b-a1ab-40ae-8f00-703a4c7c8406' }, items: [] })
    const response = await app.inject({ method: 'GET', url: '/orders/42' })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ order: { id: 42, publicUuid: 'c40d5e7b-a1ab-40ae-8f00-703a4c7c8406' }, items: [] })
    expect(mockOrders.getOrderById).toHaveBeenCalledWith(...['42'])
  })

  it('DELETE /orders/42 forwards the identifier', async () => {
    mockOrders.cancelOrder.mockResolvedValue({ message: 'Removed' })
    const response = await app.inject({ method: 'DELETE', url: '/orders/42' })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ message: 'Removed' })
    expect(mockOrders.cancelOrder).toHaveBeenCalledWith('42')
  })

  it('rejects an order payment without a payment amount', async () => {
    const response = await app.inject({ method: 'PUT', url: '/orders/42/payment', payload: {} })
    expect(response.statusCode).toBe(400)
    expect(response.json()).toMatchObject({ error: 'Bad Request', statusCode: 400 })
    expect(mockOrders.pay).not.toHaveBeenCalled()
  })
})

it.each(['c40d5e7b-a1ab-40ae-8f00-703a4c7c8406', null])('returns the stored UUID, including legacy null: %s', async publicUuid => {
  mockOrders.getOrderUuid.mockResolvedValue({ orderId: 42, publicUuid })
  const response = await app.inject('/orders/42/uuid')
  expect(response.statusCode).toBe(200)
  expect(response.json()).toEqual({ orderId: 42, publicUuid })
  expect(response.headers['cache-control']).toBe('no-store')
  expect(mockOrders.getOrderUuid).toHaveBeenCalledWith(42)
})
it.each(['abc', '0', '-1', '1.5', '9007199254740992'])('rejects invalid order ID %s', async id => {
  const response = await app.inject(`/orders/${id}/uuid`)
  expect(response.statusCode).toBe(400)
  expect(mockOrders.getOrderUuid).not.toHaveBeenCalled()
})
it('propagates missing-order 404', async () => {
  mockOrders.getOrderUuid.mockRejectedValue(Object.assign(new Error('Order not found'), { statusCode: 404 }))
  expect((await app.inject('/orders/42/uuid')).statusCode).toBe(404)
})
it('uses the same authorization metadata as POST /orders', async () => {
  const registered: any[] = []
  const instance = Fastify()
  instance.addHook('onRoute', route => { registered.push(route) })
  try {
    await instance.register(controller, { prefix: '/orders' })
    await instance.ready()
    const lookup = registered.find(route => route.method === 'GET' && route.url === '/orders/:id/uuid')
    const create = registered.find(route => route.method === 'POST' && route.url === '/orders/')
    expect(lookup.config.auth).toEqual(create.config.auth)
    expect(lookup.config.auth).toEqual({ roles: ['cashier', 'storer'] })
  } finally {
    await instance.close()
  }
})
