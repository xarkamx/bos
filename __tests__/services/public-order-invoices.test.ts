import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { Readable } from 'stream'
import { unzipSync, strFromU8 } from 'fflate'
import { methods, resetServices } from '../helpers/controller'

const mockModel = methods('findByUuid', 'claim')
const mockClients = methods('getClient')
const mockBilling = methods('getBillByOrderId', 'addInvoice')
const mockProvider = methods('downloadPdf', 'downloadXml')
jest.mock('../../src/models/PublicOrderBillingModel', () => ({ PublicOrderBillingModel: jest.fn(() => mockModel) }))
jest.mock('../../src/services/clients/ClientService', () => ({ ClientService: jest.fn(() => mockClients) }))
jest.mock('../../src/services/billing/BillingService', () => ({ BillingService: jest.fn(() => mockBilling) }))
jest.mock('../../src/services/billing/FacturaApiService', () => ({ FacturaApiService: jest.fn(() => mockProvider) }))

import { PublicOrderInvoiceService, isInvoiceRfc } from '../../src/services/billing/PublicOrderInvoiceService'

const uuid = 'bd4e6519-6154-44b1-805d-b67539df0405'
const paid = { id: 42, public_uuid: uuid, status: 'paid', billed: null, client_id: 7, payment_type: 1 }

beforeEach(() => {
  resetServices(mockModel, mockClients, mockBilling, mockProvider)
  mockModel.findByUuid.mockResolvedValue({ ...paid })
  mockModel.claim.mockResolvedValue(true)
  mockClients.getClient.mockResolvedValue({ rfc: 'EKU9003173C9', name: 'Cliente', email: 'test@example.test', postal_code: '44100', tax_system: '601' })
  mockBilling.getBillByOrderId.mockResolvedValue([])
  mockProvider.downloadPdf.mockImplementation(async (id) => Readable.from([Buffer.from(`PDF ${id}`)]))
  mockProvider.downloadXml.mockImplementation(async (id) => Readable.from([Buffer.from(`XML ${id}`)]))
})

describe('public invoice workflow', () => {
  it('issues a paid order and returns PDF and XML in one readable ZIP', async () => {
    mockBilling.getBillByOrderId.mockResolvedValueOnce([]).mockResolvedValueOnce([{ external_id: 'inv-1' }])
    const result = await new PublicOrderInvoiceService().download(uuid)
    const files = unzipSync(result)
    expect(Object.keys(files)).toEqual(['factura-1/factura.pdf', 'factura-1/factura.xml'])
    expect(strFromU8(files['factura-1/factura.pdf'])).toBe('PDF inv-1')
    expect(strFromU8(files['factura-1/factura.xml'])).toBe('XML inv-1')
    expect(mockBilling.addInvoice).toHaveBeenCalledWith([42], '601', '01', 'PUE')
    expect(mockModel.claim).toHaveBeenCalledWith(42, uuid)
    expect(mockModel.claim.mock.invocationCallOrder[0]).toBeLessThan(mockBilling.addInvoice.mock.invocationCallOrder[0])
  })

  it('downloads all related invoices, deduplicates and never issues again', async () => {
    mockModel.findByUuid.mockResolvedValue({ ...paid, status: 'pending', billed: 'inv-1' })
    mockBilling.getBillByOrderId.mockResolvedValue([{ external_id: 'inv-1' }, { external_id: 'complement-1' }, { external_id: 'inv-1' }])
    const files = unzipSync(await new PublicOrderInvoiceService().download(uuid))
    expect(Object.keys(files)).toHaveLength(4)
    expect(strFromU8(files['factura-2/factura.xml'])).toBe('XML complement-1')
    expect(mockBilling.addInvoice).not.toHaveBeenCalled()
    expect(mockClients.getClient).not.toHaveBeenCalled()
    expect(mockModel.claim).not.toHaveBeenCalled()
  })

  it('uses orders.billed when legacy invoice links are missing', async () => {
    mockModel.findByUuid.mockResolvedValue({ ...paid, billed: 'legacy-invoice' })
    await new PublicOrderInvoiceService().download(uuid)
    expect(mockProvider.downloadPdf).toHaveBeenCalledWith('legacy-invoice')
    expect(mockBilling.addInvoice).not.toHaveBeenCalled()
  })

  it.each([undefined, { ...paid, deleted_at: new Date() }])('rejects unknown or deleted orders', async order => {
    mockModel.findByUuid.mockResolvedValue(order)
    await expect(new PublicOrderInvoiceService().download(uuid)).rejects.toMatchObject({ statusCode: 404 })
    expect(mockBilling.addInvoice).not.toHaveBeenCalled()
  })

  it.each(['pending', 'requested', 'cancelled'])('does not issue a %s order', async status => {
    mockModel.findByUuid.mockResolvedValue({ ...paid, status })
    await expect(new PublicOrderInvoiceService().download(uuid)).rejects.toMatchObject({ statusCode: 409 })
    expect(mockModel.claim).not.toHaveBeenCalled()
    expect(mockBilling.addInvoice).not.toHaveBeenCalled()
  })

  it.each([null, '', 'INVALID', 'XAXX010101000', 'XEXX010101000', 'EKU9013323C9'])('rejects invalid or generic RFC %s', async rfc => {
    mockClients.getClient.mockResolvedValue({ rfc })
    await expect(new PublicOrderInvoiceService().download(uuid)).rejects.toMatchObject({ statusCode: 422 })
    expect(mockModel.claim).not.toHaveBeenCalled()
  })

  it('rejects missing fiscal data before claiming the order', async () => {
    mockClients.getClient.mockResolvedValue({ rfc: 'EKU9003173C9' })
    await expect(new PublicOrderInvoiceService().download(uuid)).rejects.toMatchObject({ statusCode: 422 })
    expect(mockModel.claim).not.toHaveBeenCalled()
  })

  it('does not invent a payment form for a paid order with form 99', async () => {
    mockModel.findByUuid.mockResolvedValue({ ...paid, payment_type: 99 })
    await expect(new PublicOrderInvoiceService().download(uuid)).rejects.toMatchObject({ statusCode: 422 })
    expect(mockBilling.addInvoice).not.toHaveBeenCalled()
  })

  it('allows only one simultaneous request to issue', async () => {
    mockModel.claim.mockResolvedValueOnce(true).mockResolvedValueOnce(false)
    mockBilling.addInvoice.mockImplementation(async () => {
      mockBilling.getBillByOrderId.mockResolvedValue([{ external_id: 'inv-1' }])
    })
    const results = await Promise.allSettled([
      new PublicOrderInvoiceService().download(uuid),
      new PublicOrderInvoiceService().download(uuid)
    ])
    expect(mockBilling.addInvoice).toHaveBeenCalledTimes(1)
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1)
    expect(results.filter(result => result.status === 'rejected')).toHaveLength(1)
  })

  it('retains the attempt after ambiguous provider failure and blocks a retry', async () => {
    mockBilling.addInvoice.mockRejectedValue(new Error('timeout with sensitive details'))
    await expect(new PublicOrderInvoiceService().download(uuid)).rejects.toMatchObject({ statusCode: 502 })
    mockModel.findByUuid.mockResolvedValue({ ...paid, public_billing_attempted_at: new Date() })
    await expect(new PublicOrderInvoiceService().download(uuid)).rejects.toMatchObject({ statusCode: 409 })
    expect(mockBilling.addInvoice).toHaveBeenCalledTimes(1)
  })

  it('fails the whole download on a stream error and retries without reissuing', async () => {
    mockBilling.getBillByOrderId.mockResolvedValue([{ external_id: 'inv-1' }])
    mockProvider.downloadXml.mockResolvedValueOnce(Readable.from((async function * () {
      yield Buffer.from('partial')
      throw new Error('provider failure')
    })()))
    await expect(new PublicOrderInvoiceService().download(uuid)).rejects.toMatchObject({ statusCode: 502 })
    await expect(new PublicOrderInvoiceService().download(uuid)).resolves.toBeInstanceOf(Buffer)
    expect(mockBilling.addInvoice).not.toHaveBeenCalled()
  })
})

describe('RFC structure', () => {
  it('accepts a company RFC and rejects non-existent calendar dates', () => {
    expect(isInvoiceRfc('EKU9003173C9')).toBe(true)
    expect(isInvoiceRfc('EKU9002303C9')).toBe(false)
  })
})

it('public details expose only fiscal display fields and never issue or claim', async () => {
  mockClients.getClient.mockResolvedValue({ name: 'Cliente', rfc: 'EKU9003173C9', postal_code: '44100', tax_system: '601', email: 'private@example.test', phones: 'private', bas_id: 9 })
  expect(await new PublicOrderInvoiceService().details(uuid)).toEqual({
    order: { id: 42, status: 'paid' },
    customer: { name: 'Cliente', rfc: 'EKU9003173C9', postalCode: '44100', taxSystem: '601' }
  })
  expect(mockBilling.addInvoice).not.toHaveBeenCalled()
  expect(mockModel.claim).not.toHaveBeenCalled()
})
it.each([undefined, { ...paid, deleted_at: new Date() }])('hides unavailable public details', async order => {
  mockModel.findByUuid.mockResolvedValue(order)
  await expect(new PublicOrderInvoiceService().details(uuid)).rejects.toMatchObject({ statusCode: 404 })
  expect(mockClients.getClient).not.toHaveBeenCalled()
})
