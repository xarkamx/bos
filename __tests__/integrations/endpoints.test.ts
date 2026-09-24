import Fastify, { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'

// Explicit factories prevent importing service dependencies (database, SMTP,
// Facturapi, etc.). Only the real HTTP handlers and schemas run in this suite.
const mockOrders = methods('getAllOrders', 'getOrderById', 'addOrder', 'pay', 'cancelOrder', 'updateOrder', 'getPPDOrdersByBillId')
const mockProducts = methods('getAllProducts', 'addProduct', 'updateProduct', 'deleteProduct')
const mockClients = methods('getClients', 'getClient', 'createClient', 'updateClient', 'getClientByEmail')
const mockPayments = methods('getAllPayments', 'addPayment', 'deletePayment', 'getPaymentsByOrderId', 'cancelPaymentByOrderId')
const mockBilling = methods('getAllInvoices', 'addInvoice', 'sendInvoice', 'getBillById', 'paymentComplement', 'cancelInvoice', 'downloadInvoice')
const mockInventory = methods('addItemToInventory', 'getAllItems')
const mockMaterials = methods('consumeMaterial', 'getMaterialById')
const mockBas = methods('auth')

function methods(...names: string[]) {
  return Object.fromEntries(names.map(name => [name, jest.fn<(...args: any[]) => Promise<any>>()]))
}

jest.mock('../../src/services/orders/OrdersService', () => ({ OrderService: jest.fn(() => mockOrders) }))
jest.mock('../../src/services/products/ProductService', () => ({ ProductsService: jest.fn(() => mockProducts) }))
jest.mock('../../src/services/clients/ClientService', () => ({ ClientService: jest.fn(() => mockClients) }))
jest.mock('../../src/services/payments/PaymentsServices', () => ({ PaymentsServices: jest.fn(() => mockPayments) }))
jest.mock('../../src/services/billing/BillingService', () => ({ BillingService: jest.fn(() => mockBilling) }))
jest.mock('../../src/services/billing/FacturaApiService', () => ({ FacturaApiService: jest.fn() }))
jest.mock('../../src/models/ApiKeyModel', () => ({ ApiKeyModel: jest.fn() }))
jest.mock('../../src/services/inventory', () => ({ InventoryService: jest.fn(() => mockInventory) }))
jest.mock('../../src/services/Materials', () => ({ MaterialService: jest.fn(() => mockMaterials) }))
jest.mock('../../src/services/users/basService', () => ({ BasService: jest.fn(() => mockBas) }))
jest.mock('../../src/utils/mailSender', () => ({
  sendNewOrderRequested: jest.fn(), sendPaymentStatusChangeNotification: jest.fn(),
  sendNewClientMailToOwner: jest.fn(), sendWelcomeMessageToClient: jest.fn(),
  sendWelcomeMessageToClientAsUser: jest.fn(), sendBillingNotification: jest.fn()
}))

import orders from '../../src/routes/orders'
import products from '../../src/routes/products'
import clients from '../../src/routes/clients'
import payments from '../../src/routes/payments'
import billing from '../../src/routes/billing'
import invoice from '../../src/routes/billing/_facturaApiId'
import orderPayments from '../../src/routes/orders/_orderId/payments'
import inventory from '../../src/routes/inventory'
import auth from '../../src/routes/auth'
import { HttpError } from '../../src/errors/HttpError'
import { sendNewOrderRequested, sendPaymentStatusChangeNotification, sendBillingNotification } from '../../src/utils/mailSender'

let app: FastifyInstance
const user = { id: 1, email: 'cashier@example.test' }

beforeEach(async () => {
  for (const service of [mockOrders, mockProducts, mockClients, mockPayments, mockBilling, mockInventory, mockMaterials, mockBas]) {
    for (const method of Object.values(service)) method.mockReset()
  }
  app = Fastify()
  // Route contract tests assume an authenticated user. Production authorization
  // hooks live in the server entry points and are intentionally not replicated.
  app.decorateRequest('user', null)
  app.addHook('onRequest', async request => { (request as any).user = { user, roles: ['admin'] } })
  await app.register(orders, { prefix: '/orders' })
  await app.register(orderPayments, { prefix: '/orders/:orderId' })
  await app.register(products, { prefix: '/products' })
  await app.register(clients, { prefix: '/clients' })
  await app.register(payments, { prefix: '/payments' })
  await app.register(billing, { prefix: '/billing' })
  await app.register(invoice, { prefix: '/billing/:facturaApiId' })
  await app.register(inventory, { prefix: '/inventory' })
  await app.register(auth, { prefix: '/auth' })
  await app.ready()
})

afterEach(async () => { await app?.close() })

describe('Core reads and deletes', () => {
  it.each<[string, ReturnType<typeof methods>[string], any[]]>([
    ['/products', mockProducts.getAllProducts, []],
    ['/clients', mockClients.getClients, []],
    ['/clients/42', mockClients.getClient, ['42']],
    ['/orders/42', mockOrders.getOrderById, ['42']],
    ['/orders/42/payments', mockPayments.getPaymentsByOrderId, ['42']],
    ['/inventory?type=product', mockInventory.getAllItems, ['product']],
    ['/billing?status=valid', mockBilling.getAllInvoices, [{ status: 'valid' }]]
  ])('GET %s returns service data', async (url, method, args) => {
    method.mockResolvedValue([{ id: 42 }])
    const response = await app.inject({ method: 'GET', url })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual([{ id: 42 }])
    expect(method).toHaveBeenCalledWith(...args)
  })

  it.each<[string, ReturnType<typeof methods>[string]]>([
    ['/products/42', mockProducts.deleteProduct],
    ['/payments/42', mockPayments.deletePayment],
    ['/orders/42', mockOrders.cancelOrder]
  ])('DELETE %s forwards the identifier', async (url, method) => {
    method.mockResolvedValue({ message: 'Removed' })
    const response = await app.inject({ method: 'DELETE', url })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ message: 'Removed' })
    expect(method).toHaveBeenCalledWith('42')
  })
})

describe('Orders', () => {
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

  it('resets order payment status when canceling its payments', async () => {
    mockPayments.cancelPaymentByOrderId.mockResolvedValue({ message: 'Canceled' })
    const response = await app.inject({ method: 'DELETE', url: '/orders/42/payments' })
    expect(response.statusCode).toBe(200)
    expect(mockOrders.updateOrder).toHaveBeenCalledWith('42', { status: 'pending', partialPayment: 0 })
    expect(mockPayments.cancelPaymentByOrderId).toHaveBeenCalledWith('42')
  })
})

describe('Products, clients and payments', () => {
  it('creates a product', async () => {
    mockProducts.addProduct.mockResolvedValue({ id: 2 })
    const response = await app.inject({ method: 'POST', url: '/products', payload: { name: 'Panel', price: 50 } })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ id: 2 })
    expect(mockProducts.addProduct).toHaveBeenCalledWith({ name: 'Panel', price: 50 })
  })

  it('updates a product', async () => {
    mockProducts.updateProduct.mockResolvedValue({ id: 2, price: 60 })
    const response = await app.inject({ method: 'PUT', url: '/products/2', payload: { price: 60 } })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ id: 2, price: 60 })
    expect(mockProducts.updateProduct).toHaveBeenCalledWith('2', { price: 60 })
  })

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
})

describe('Schema validation', () => {
  it.each<['POST' | 'PUT', string, Record<string, unknown>, ReturnType<typeof methods>[string]]>([
    ['POST', '/products', { name: 'Panel' }, mockProducts.addProduct],
    ['POST', '/clients', { name: 'Customer' }, mockClients.createClient],
    ['POST', '/payments', { amount: 10, flow: 'invalid' }, mockPayments.addPayment],
    ['POST', '/payments', { flow: 'inflow' }, mockPayments.addPayment],
    ['PUT', '/orders/42/payment', {}, mockOrders.pay],
    ['POST', '/inventory', { quantity: 'invalid' }, mockInventory.addItemToInventory],
    ['POST', '/billing', { orderIds: ['invalid'] }, mockBilling.addInvoice]
  ])('%s %s rejects invalid payload %j before calling the service', async (method, url, payload, service) => {
    const response = await app.inject({ method, url, payload })
    expect(response.statusCode).toBe(400)
    expect(response.json()).toMatchObject({ error: 'Bad Request', statusCode: 400 })
    expect(service).not.toHaveBeenCalled()
  })
})

describe('Inventory', () => {
  it('consumes materials when adding finished products', async () => {
    mockInventory.addItemToInventory.mockResolvedValue({ id: 8 })
    const response = await app.inject({ method: 'POST', url: '/inventory', payload: { external_id: 2, type: 'product', quantity: 3 } })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ id: 8 })
    expect(mockInventory.addItemToInventory).toHaveBeenCalledWith(2, 'product', 3)
    expect(mockMaterials.consumeMaterial).toHaveBeenCalledWith(2, 3)
  })

  it('rejects stock additions for unknown materials', async () => {
    mockMaterials.getMaterialById.mockResolvedValue(undefined)
    const response = await app.inject({ method: 'POST', url: '/inventory/materials', payload: { materialId: 2, quantity: 3 } })
    expect(response.statusCode).toBe(404)
    expect(response.json().message).toBe('Material does not exist')
    expect(mockInventory.addItemToInventory).not.toHaveBeenCalled()
  })
})

describe('Billing', () => {
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

describe('Authentication endpoint and service failures', () => {
  it('returns the authentication response from BAS', async () => {
    const result = { jwt: 'test-token', ttl: 3600, roles: ['cashier'] }
    mockBas.auth.mockResolvedValue(result)
    const payload = { email: user.email, password: 'test-only' }
    const response = await app.inject({ method: 'POST', url: '/auth', payload })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual(result)
    expect(mockBas.auth).toHaveBeenCalledWith(payload)
  })

  it('preserves an authentication rejection status', async () => {
    mockBas.auth.mockRejectedValue(new HttpError('Invalid credentials', 401))
    const response = await app.inject({ method: 'POST', url: '/auth', payload: { email: user.email, password: 'wrong' } })
    expect(response.statusCode).toBe(401)
    expect(response.json().message).toBe('Invalid credentials')
  })

  it('returns 500 when a service fails unexpectedly', async () => {
    mockProducts.getAllProducts.mockRejectedValue(new Error('Unavailable'))
    const response = await app.inject('/products')
    expect(response.statusCode).toBe(500)
    expect(response.json()).toMatchObject({ statusCode: 500, error: 'Internal Server Error' })
  })
})

