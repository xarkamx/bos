import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createControllerApp, methods, resetServices } from '../helpers/controller'

const mockBilling = methods('getAllInvoices', 'addInvoice', 'sendInvoice', 'getBillById', 'paymentComplement', 'cancelInvoice', 'downloadInvoice')

// Explicit factories keep database and external-service implementations unloaded.
jest.mock('../../src/services/billing/BillingService', () => ({ BillingService: jest.fn(() => mockBilling) }))
jest.mock('../../src/services/billing/FacturaApiService', () => ({ FacturaApiService: jest.fn() }))

import controller from '../../src/routes/billing/_facturaApiId'

let app: FastifyInstance

beforeEach(async () => {
  resetServices(mockBilling)
  app = await createControllerApp(controller, '/billing/:facturaApiId')
})

afterEach(async () => { await app?.close() })

describe('invoice controller', () => {
  it('uses the default cancellation motive', async () => {
    mockBilling.cancelInvoice.mockResolvedValue({ status: 'canceled' })
    const response = await app.inject({ method: 'DELETE', url: '/billing/inv-1', payload: {} })
    expect(response.statusCode).toBe(200)
    expect(mockBilling.cancelInvoice).toHaveBeenCalledWith('inv-1', '03')
  })

  it('downloads invoice bytes with ZIP attachment headers', async () => {
    const zip = Buffer.from([0x50, 0x4b, 0x03, 0x04])
    mockBilling.downloadInvoice.mockResolvedValue(zip)
    const response = await app.inject('/billing/inv-1/download')
    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toBe('application/zip')
    expect(response.headers['content-disposition']).toBe('attachment; filename=inv-1.zip')
    expect(response.rawPayload).toEqual(zip)
    expect(mockBilling.downloadInvoice).toHaveBeenCalledWith('inv-1')
  })
})
