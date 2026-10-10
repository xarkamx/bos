import { beforeEach, expect, it, jest } from '@jest/globals'
import { methods, resetServices } from '../helpers/controller'
const mockOrders = methods('updateOrder')
const mockPayments = methods('addPayment')
const mockBilling = methods('getBillById', 'getPaymentSummary', 'paymentComplement')
const mockFirst = jest.fn<() => Promise<any>>()
jest.mock('../../src/models/OrderModel', () => ({ OrderModel: jest.fn(() => ({ ...mockOrders, getOrderById: () => ({ leftJoin: () => ({ select: () => ({ first: mockFirst }) }) }) })) }))
jest.mock('../../src/models/PaymentsModel', () => ({ PaymentsModel: jest.fn(() => mockPayments) }))
jest.mock('../../src/models/InventoryModel', () => ({ InventoryModel: jest.fn() }))
jest.mock('../../src/models/itemsModel', () => ({ ItemsModel: jest.fn() }))
jest.mock('../../src/models/productsModel', () => ({ ProductsModel: jest.fn() }))
jest.mock('../../src/services/billing/BillingService', () => ({ BillingService: jest.fn(() => mockBilling) }))
jest.mock('../../src/services/billing/FacturaApiService', () => ({ FacturaApiService: jest.fn() }))
import { OrderService } from '../../src/services/orders/OrdersService'

const order = { client_id: 7, total: '116.00', partialPayment: '0.00', status: 'pending', uuid: 'invoice-id', paymentMethod: 1 }
const summary = { uuid: 'fiscal-uuid', installment: 2, last_balance: 116, amount: 58, taxes: [{ base: 50, type: 'IVA', rate: 0.16 }] }
beforeEach(() => {
  resetServices(mockOrders, mockPayments, mockBilling)
  mockFirst.mockReset().mockResolvedValue({ ...order })
  mockBilling.getBillById.mockResolvedValue({ payment_method: 'PPD' })
  mockBilling.getPaymentSummary.mockResolvedValue(summary)
  mockBilling.paymentComplement.mockResolvedValue({ id: 'complement-id' })
  mockOrders.updateOrder.mockResolvedValue(1)
})
it('issues for a PPD invoice even when the order payment form is not 99', async () => {
  const result = await new OrderService().pay(42, 7, 58, 3)
  expect(mockBilling.getPaymentSummary).toHaveBeenCalledWith('invoice-id', 58)
  expect(mockBilling.paymentComplement).toHaveBeenCalledWith(7, 58, {
    type: 'pago', data: [{ payment_form: '03', date: expect.any(String), related_documents: [summary] }]
  }, 42)
  expect(mockPayments.addPayment).toHaveBeenCalledWith(expect.objectContaining({ amount: 58, billingId: 'complement-id', clientId: 7 }))
  expect(result.data).toMatchObject({ status: 'pending', total: 58, paid: 58 })
})
it('settles the exact balance and issues a complement on final payment', async () => {
  mockFirst.mockResolvedValue({ ...order, partialPayment: '58.00' })
  expect((await new OrderService().pay(42, 7, 58, 1)).data?.status).toBe('paid')
  expect(mockBilling.paymentComplement).toHaveBeenCalledTimes(1)
})
it('does not treat a remaining cent as paid', async () => {
  expect((await new OrderService().pay(42, 7, 115.99, 1)).data?.status).toBe('pending')
})
it.each([0, -1, 116.01, 1.001])('rejects invalid/overpayment %s before invoicing', async amount => {
  await expect(new OrderService().pay(42, 7, amount, 1)).rejects.toMatchObject({ statusCode: 400 })
  expect(mockBilling.paymentComplement).not.toHaveBeenCalled()
  expect(mockPayments.addPayment).not.toHaveBeenCalled()
})
it('does not invoice PUE even when the order has payment form 99', async () => {
  mockFirst.mockResolvedValue({ ...order, paymentMethod: 99 })
  mockBilling.getBillById.mockResolvedValue({ payment_method: 'PUE' })
  await new OrderService().pay(42, 7, 58, 1)
  expect(mockBilling.paymentComplement).not.toHaveBeenCalled()
  expect(mockPayments.addPayment).toHaveBeenCalled()
})
it('does not invoice an order without a previous invoice', async () => {
  mockFirst.mockResolvedValue({ ...order, uuid: null })
  await new OrderService().pay(42, 7, 58, 1)
  expect(mockBilling.getBillById).not.toHaveBeenCalled()
})
it('does not record a payment when complement issuance fails', async () => {
  mockBilling.paymentComplement.mockRejectedValue(new Error('Provider failed'))
  await expect(new OrderService().pay(42, 7, 58, 1)).rejects.toThrow('Provider failed')
  expect(mockOrders.updateOrder).not.toHaveBeenCalled()
  expect(mockPayments.addPayment).not.toHaveBeenCalled()
})
it('rejects undefined PPD payment form', async () => {
  await expect(new OrderService().pay(42, 7, 58, 99)).rejects.toMatchObject({ statusCode: 400 })
  expect(mockBilling.paymentComplement).not.toHaveBeenCalled()
})
