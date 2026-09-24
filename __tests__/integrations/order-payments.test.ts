import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createControllerApp, methods, resetServices } from '../helpers/controller'

const mockOrders = methods('getAllOrders', 'getOrderById', 'addOrder', 'pay', 'cancelOrder', 'updateOrder', 'getPPDOrdersByBillId')
const mockPayments = methods('getAllPayments', 'addPayment', 'deletePayment', 'getPaymentsByOrderId', 'cancelPaymentByOrderId')

// Explicit factories keep database and external-service implementations unloaded.
jest.mock('../../src/services/orders/OrdersService', () => ({ OrderService: jest.fn(() => mockOrders) }))
jest.mock('../../src/services/payments/PaymentsServices', () => ({ PaymentsServices: jest.fn(() => mockPayments) }))

import controller from '../../src/routes/orders/_orderId/payments'

let app: FastifyInstance

beforeEach(async () => {
  resetServices(mockOrders, mockPayments)
  app = await createControllerApp(controller, '/orders/:orderId')
})

afterEach(async () => { await app?.close() })

describe('order-payments controller', () => {
  it('resets order payment status when canceling its payments', async () => {
    mockPayments.cancelPaymentByOrderId.mockResolvedValue({ message: 'Canceled' })
    const response = await app.inject({ method: 'DELETE', url: '/orders/42/payments' })
    expect(response.statusCode).toBe(200)
    expect(mockOrders.updateOrder).toHaveBeenCalledWith('42', { status: 'pending', partialPayment: 0 })
    expect(mockPayments.cancelPaymentByOrderId).toHaveBeenCalledWith('42')
  })

  it('GET /orders/42/payments returns service data', async () => {
    mockPayments.getPaymentsByOrderId.mockResolvedValue([{ id: 42 }])
    const response = await app.inject({ method: 'GET', url: '/orders/42/payments' })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual([{ id: 42 }])
    expect(mockPayments.getPaymentsByOrderId).toHaveBeenCalledWith(...['42'])
  })
})
