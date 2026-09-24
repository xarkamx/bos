import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { methods, resetServices } from '../helpers/controller'

const mockClients = methods('getClient')
const mockModel = methods('addBilling')
const mockProvider = methods('addInvoice')

jest.mock('../../src/services/clients/ClientService', () => ({ ClientService: jest.fn(() => mockClients) }))
jest.mock('../../src/models/BillingModel', () => ({ BillingModel: jest.fn(() => mockModel) }))
jest.mock('../../src/services/orders/OrdersService', () => ({ OrderService: jest.fn() }))
jest.mock('../../src/utils/mailSender', () => ({ sendInvoiceSubstitutionNotification: jest.fn() }))

import { BillingService } from '../../src/services/billing/BillingService'

const customer = {
  name: 'Customer', rfc: 'XAXX010101000', tax_system: '601',
  email: 'customer@example.test', postal_code: '44100'
}
const complement = {
  type: 'pago',
  data: [{ payment_form: '01', related_documents: [{ uuid: 'original-invoice', amount: 25 }] }]
}

beforeEach(() => {
  resetServices(mockClients, mockModel, mockProvider)
  mockClients.getClient.mockResolvedValue(customer)
  mockModel.addBilling.mockResolvedValue([1])
})

describe('BillingService payment complements', () => {
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
    expect(mockModel.addBilling).toHaveBeenCalledTimes(orderIds.length)
    orderIds.forEach((id, index) => {
      expect(mockModel.addBilling).toHaveBeenNthCalledWith(index + 1, {
        externalId: 'complement-1', ownerId: 0, status: 'Accepted',
        type: 'P', orderId: id, folio
      })
    })
  })

  it('does not issue or persist a complement for a missing customer', async () => {
    mockClients.getClient.mockResolvedValue(undefined)
    const service = new BillingService(mockProvider)
    await expect(service.paymentComplement('7', 25, complement, 42))
      .rejects.toMatchObject({ statusCode: 404, message: 'Customer not found' })
    expect(mockProvider.addInvoice).not.toHaveBeenCalled()
    expect(mockModel.addBilling).not.toHaveBeenCalled()
  })

  it('does not persist billing records when invoice creation fails', async () => {
    mockProvider.addInvoice.mockRejectedValue(new Error('Provider unavailable'))
    const service = new BillingService(mockProvider)
    await expect(service.paymentComplement('7', 25, complement, [1, 23, 55]))
      .rejects.toThrow('Provider unavailable')
    expect(mockModel.addBilling).not.toHaveBeenCalled()
  })
})
