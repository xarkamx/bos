import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { methods, resetServices } from '../helpers/controller'

const mockClients = methods('getClient')
const mockModel = methods('addBilling')
const mockProvider = methods('addInvoice')
const mockOrders = methods('getOrderById', 'updateOrder')
const mockLinks = methods('linkOrdersToBillId')

jest.mock('../../src/services/clients/ClientService', () => ({ ClientService: jest.fn(() => mockClients) }))
jest.mock('../../src/models/BillingModel', () => ({ BillingModel: jest.fn(() => mockModel) }))
jest.mock('../../src/services/orders/OrdersService', () => ({ OrderService: jest.fn(() => mockOrders) }))
jest.mock('../../src/services/billing/OrderBillingService', () => ({ OrderBillingService: jest.fn(() => mockLinks) }))
jest.mock('../../src/utils/mailSender', () => ({ sendInvoiceSubstitutionNotification: jest.fn() }))

import { BillingService } from '../../src/services/billing/BillingService'

const customer = {
  name: 'Customer', rfc: 'XAXX010101000', tax_system: '601',
  email: 'customer@example.test', postal_code: '44100'
}
const complement = {
  type: 'pago',
  data: [{
    payment_form: '01',
    date: '2026-10-06T12:00:00.000Z',
    related_documents: [{
      uuid: 'original-invoice', amount: 25, last_balance: 50, installment: 1,
      taxes: [{ base: 21.55, type: 'IVA', rate: 0.16 }]
    }]
  }]
}

beforeEach(() => {
  resetServices(mockClients, mockModel, mockProvider, mockOrders, mockLinks)
  mockClients.getClient.mockResolvedValue(customer)
  mockModel.addBilling.mockResolvedValue([1])
  mockOrders.getOrderById.mockImplementation(async (id: number) => ({
    order: { id, clientId: 7, billed: null, discount: 0, paymentType: '01', total: 50 },
    items: [{ name: 'Product', quantity: 1, unitPrice: 50 }]
  }))
})

describe('BillingService invoice order links', () => {
  it.each([[42], [55, 1, 23]].map(ids => [ids]))('links orders %j to the local bill as the final step', async (orderIds) => {
    const result = { id: 'invoice-1', total: '150.75' }
    mockProvider.addInvoice.mockResolvedValue(result)
    mockModel.addBilling.mockResolvedValue([91])
    mockLinks.linkOrdersToBillId.mockImplementation(async () => {
      expect(mockOrders.updateOrder).toHaveBeenCalledTimes(orderIds.length)
      expect(mockModel.addBilling).toHaveBeenCalledTimes(1)
    })

    await expect(new BillingService(mockProvider).addInvoice(orderIds, '601', '01'))
      .resolves.toEqual(result)

    expect(mockModel.addBilling).toHaveBeenCalledWith(expect.objectContaining({
      externalId: 'invoice-1', type: 'I', orderId: orderIds[0]
    }))
    expect(mockLinks.linkOrdersToBillId).toHaveBeenCalledTimes(1)
    expect(mockLinks.linkOrdersToBillId).toHaveBeenCalledWith(
      orderIds.map((orderId: number) => ({ orderId, amount: 150.75 })), 91
    )
  })

  it('does not link orders when saving the local invoice fails', async () => {
    mockProvider.addInvoice.mockResolvedValue({ id: 'invoice-1', total: 50 })
    mockModel.addBilling.mockRejectedValue(new Error('Insert failed'))
    await expect(new BillingService(mockProvider).addInvoice([42], '601', '01'))
      .rejects.toThrow('Insert failed')
    expect(mockLinks.linkOrdersToBillId).not.toHaveBeenCalled()
  })

  it('waits for linking and propagates a link failure', async () => {
    mockProvider.addInvoice.mockResolvedValue({ id: 'invoice-1', total: 50 })
    mockLinks.linkOrdersToBillId.mockRejectedValue(new Error('Link failed'))
    await expect(new BillingService(mockProvider).addInvoice([42], '601', '01'))
      .rejects.toThrow('Link failed')
  })
})

describe('BillingService payment complements', () => {
  it('propagates complement link failures', async () => {
    mockProvider.addInvoice.mockResolvedValue({ id: 'complement-1', total: 0 })
    mockLinks.linkOrdersToBillId.mockRejectedValue(new Error('Link failed'))
    await expect(new BillingService(mockProvider).paymentComplement('7', 25, complement, 42))
      .rejects.toThrow('Link failed')
  })

  it.each<[string, number | number[], string]>([
    ['single order', 42, 'C_ORD_42'],
    ['single-element order array', [42], 'C_ORD_42'],
    ['bulk orders', [1, 23, 55], 'C_bulk-1-23-55'],
    ['bulk orders in supplied order', [55, 1, 23], 'C_bulk-55-1-23']
  ])('sets and persists the folio for %s', async (_description, orderId, folio) => {
    const result = { id: 'complement-1', folio_number: folio, type: 'P' }
    mockProvider.addInvoice.mockResolvedValue(result)
    const service = new BillingService(mockProvider)

    await expect(service.paymentComplement('7', 25, complement, orderId)).resolves.toEqual(result)

    expect(mockClients.getClient).toHaveBeenCalledWith('7')
    expect(mockProvider.addInvoice).toHaveBeenCalledTimes(1)
    expect(mockProvider.addInvoice).toHaveBeenCalledWith({
      folio_number: folio,
      customer: {
        legal_name: customer.name, tax_id: customer.rfc,
        tax_system: customer.tax_system, email: customer.email,
        address: { zip: customer.postal_code }
      },
      complements: [complement],
      type: 'P'
    })
    const orderIds = Array.isArray(orderId) ? orderId : [orderId]
    expect(mockModel.addBilling).toHaveBeenCalledTimes(1)
    expect(mockModel.addBilling).toHaveBeenCalledWith({
        externalId: 'complement-1', ownerId: 0, status: 'Accepted',
        type: 'P', orderId: orderIds[0], folio
    })
    expect(mockLinks.linkOrdersToBillId).toHaveBeenCalledWith(
      orderIds.map(orderId => ({ orderId, amount: 25 })), 1
    )
    expect(mockLinks.linkOrdersToBillId.mock.invocationCallOrder[0])
      .toBeGreaterThan(mockModel.addBilling.mock.invocationCallOrder[0])
  })

  it('does not issue or persist a complement for a missing customer', async () => {
    mockClients.getClient.mockResolvedValue(undefined)
    const service = new BillingService(mockProvider)
    await expect(service.paymentComplement('7', 25, complement, 42))
      .rejects.toMatchObject({ statusCode: 404, message: 'Customer not found' })
    expect(mockProvider.addInvoice).not.toHaveBeenCalled()
    expect(mockModel.addBilling).not.toHaveBeenCalled()
    expect(mockLinks.linkOrdersToBillId).not.toHaveBeenCalled()
  })

  it('does not persist billing records when invoice creation fails', async () => {
    mockProvider.addInvoice.mockRejectedValue(new Error('Provider unavailable'))
    const service = new BillingService(mockProvider)
    await expect(service.paymentComplement('7', 25, complement, [1, 23, 55]))
      .rejects.toThrow('Provider unavailable')
    expect(mockModel.addBilling).not.toHaveBeenCalled()
    expect(mockLinks.linkOrdersToBillId).not.toHaveBeenCalled()
  })
})
