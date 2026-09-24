import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createControllerApp, methods, resetServices } from '../helpers/controller'

const mockPayments = methods('getAllPayments', 'addPayment', 'deletePayment', 'getPaymentsByOrderId', 'cancelPaymentByOrderId')

// Explicit factories keep database and external-service implementations unloaded.
jest.mock('../../src/services/payments/PaymentsServices', () => ({ PaymentsServices: jest.fn(() => mockPayments) }))

import controller from '../../src/routes/payments'

let app: FastifyInstance

beforeEach(async () => {
  resetServices(mockPayments)
  app = await createControllerApp(controller, '/payments')
})

afterEach(async () => { await app?.close() })

describe('payments controller', () => {
  it('creates a payment with defaults', async () => {
    mockPayments.addPayment.mockResolvedValue({ id: 9 })
    const response = await app.inject({ method: 'POST', url: '/payments', payload: { amount: 25, flow: 'inflow' } })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ id: 9 })
    expect(mockPayments.addPayment).toHaveBeenCalledWith({ amount: 25, flow: 'inflow', clientId: 0, paymentType: 'order' })
  })

  it('passes payment filters and pagination through', async () => {
    mockPayments.getAllPayments.mockResolvedValue([])
    const response = await app.inject('/payments?page=2&limit=10&flow=inflow')
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual([])
    expect(mockPayments.getAllPayments).toHaveBeenCalledWith({ page: '2', limit: '10', flow: 'inflow' }, '2', '10')
  })

  it('DELETE /payments/42 forwards the identifier', async () => {
    mockPayments.deletePayment.mockResolvedValue({ message: 'Removed' })
    const response = await app.inject({ method: 'DELETE', url: '/payments/42' })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ message: 'Removed' })
    expect(mockPayments.deletePayment).toHaveBeenCalledWith('42')
  })

  it('rejects an invalid payment flow', async () => {
    const response = await app.inject({ method: 'POST', url: '/payments', payload: { amount: 10, flow: 'invalid' } })
    expect(response.statusCode).toBe(400)
    expect(response.json()).toMatchObject({ error: 'Bad Request', statusCode: 400 })
    expect(mockPayments.addPayment).not.toHaveBeenCalled()
  })

  it('rejects a payment without an amount', async () => {
    const response = await app.inject({ method: 'POST', url: '/payments', payload: { flow: 'inflow' } })
    expect(response.statusCode).toBe(400)
    expect(response.json()).toMatchObject({ error: 'Bad Request', statusCode: 400 })
    expect(mockPayments.addPayment).not.toHaveBeenCalled()
  })
})
