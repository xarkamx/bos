import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createControllerApp, methods, resetServices, user } from '../helpers/controller'

const mockBilling = methods('getAllInvoices', 'addInvoice', 'sendInvoice', 'getBillById', 'paymentComplement', 'cancelInvoice', 'downloadInvoice')
const mockOrders = methods('getAllOrders', 'getOrderById', 'addOrder', 'pay', 'cancelOrder', 'updateOrder', 'getPPDOrdersByBillId')

// Explicit factories keep database and external-service implementations unloaded.
jest.mock('../../src/services/orders/OrdersService', () => ({ OrderService: jest.fn(() => mockOrders) }))
jest.mock('../../src/services/billing/BillingService', () => ({ BillingService: jest.fn(() => mockBilling) }))
jest.mock('../../src/services/billing/FacturaApiService', () => ({ FacturaApiService: jest.fn() }))
jest.mock('../../src/models/ApiKeyModel', () => ({ ApiKeyModel: jest.fn() }))

jest.mock('../../src/utils/mailSender', () => ({
  sendBillingNotification: jest.fn()
}))

import controller from '../../src/routes/billing'
import { sendBillingNotification } from '../../src/utils/mailSender'

let app: FastifyInstance

beforeEach(async () => {
  resetServices(mockBilling, mockOrders)
  app = await createControllerApp(controller, '/billing')
})

afterEach(async () => { await app?.close() })

describe('billing controller', () => {
  it('creates, sends and announces an invoice', async () => {
    const result = { id: 'inv-1', folio_number: 10, date: '2026-09-23', customer: { legal_name: 'Customer' }, total: 50, payment_method: 'PUE' }
    mockBilling.addInvoice.mockResolvedValue(result)
    const response = await app.inject({ method: 'POST', url: '/billing', payload: { orderIds: [42], paymentType: '01', paymentMethod: 'PUE' } })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual(result)
    expect(mockBilling.addInvoice).toHaveBeenCalledWith([42], '601', '01', 'PUE')
    expect(mockBilling.sendInvoice).toHaveBeenCalledWith('inv-1', '')
    expect(sendBillingNotification).toHaveBeenCalledWith(user, undefined, expect.objectContaining({ orderIds: [42], clientName: 'Customer', total: 50 }))
  })

  it('rejects a payment complement for an invoice that is not payable in installments', async () => {
    mockBilling.getBillById.mockResolvedValue({ payment_form: '01' })
    const response = await app.inject({ method: 'POST', url: '/billing/complement', payload: { billId: 'inv-1', amount: 10 } })
    expect(response.statusCode).toBe(400)
    expect(mockBilling.paymentComplement).not.toHaveBeenCalled()
    expect(mockOrders.getPPDOrdersByBillId).not.toHaveBeenCalled()
  })

  it('returns 201 for a partial-payment complement linked to its orders', async () => {
    mockBilling.getBillById.mockResolvedValue({ uuid: 'uuid-1', total: 100, payment_form: '99' })
    mockOrders.getPPDOrdersByBillId.mockResolvedValue([{ id: 42, client_id: 7 }, { id: 43, client_id: 7 }])
    mockBilling.paymentComplement.mockResolvedValue({ id: 'complement-1' })
    const response = await app.inject({ method: 'POST', url: '/billing/complement', payload: { billId: 'inv-1', amount: 25, paymentForm: '01', paymentDate: '2026-09-23' } })
    expect(response.statusCode).toBe(201)
    expect(response.json()).toEqual({ id: 'complement-1' })
    expect(mockBilling.paymentComplement).toHaveBeenCalledWith(7, 25, expect.objectContaining({ type: 'pago' }), [42, 43])
  })

  it('returns 404 without sending when an invoice has no order', async () => {
    mockOrders.getAllOrders.mockResolvedValue([])
    const response = await app.inject('/billing/inv-1/send')
    expect(response.statusCode).toBe(404)
    expect(mockBilling.sendInvoice).not.toHaveBeenCalled()
  })

  it('GET /billing?status=valid returns service data', async () => {
    mockBilling.getAllInvoices.mockResolvedValue([{ id: 42 }])
    const response = await app.inject({ method: 'GET', url: '/billing?status=valid' })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual([{ id: 42 }])
    expect(mockBilling.getAllInvoices).toHaveBeenCalledWith(...[{ status: 'valid' }])
  })

  it('rejects nonnumeric order IDs', async () => {
    const response = await app.inject({ method: 'POST', url: '/billing', payload: { orderIds: ['invalid'] } })
    expect(response.statusCode).toBe(400)
    expect(response.json()).toMatchObject({ error: 'Bad Request', statusCode: 400 })
    expect(mockBilling.addInvoice).not.toHaveBeenCalled()
  })
})
