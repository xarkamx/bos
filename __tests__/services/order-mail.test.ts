import { beforeEach, afterEach, expect, it, jest } from '@jest/globals'
const mockSend = jest.fn<(...args: any[]) => Promise<any>>()
const mockDetails = jest.fn<() => Promise<any>>()
jest.mock('../../src/services/mail/MailService', () => ({ MailService: jest.fn(() => ({ sendMail: mockSend })) }))
jest.mock('../../src/services/stats/StatsService', () => ({ StatsService: jest.fn() }))
jest.mock('../../src/services/clients/ClientService', () => ({ ClientService: jest.fn() }))
jest.mock('../../src/services/users/basService', () => ({ BasService: jest.fn(() => ({ getUsersByRole: async () => [] })) }))
jest.mock('../../src/services/orders/OrdersService', () => ({ OrderService: jest.fn(() => ({ getOrderById: mockDetails })) }))
import { sendNewOrderRequested, sendPaymentStatusChangeNotification } from '../../src/utils/mailSender'
import { invoiceDownloadLink } from '../../src/utils/invoiceDownloadLink'
const originalUrl = process.env.CLIENT_URL
const uuid = 'bd4e6519-6154-44b1-805d-b67539df0405'
const order = { id: 42, publicUuid: uuid, email: 'client@example.test', clientName: 'Cliente', status: 'paid', total: 116, partialPayment: 116, createdAt: '2026-10-07', paymentType: 1 }
beforeEach(() => {
  mockSend.mockReset().mockResolvedValue({})
  mockDetails.mockReset().mockResolvedValue({ order })
  process.env.CLIENT_URL = 'https://pos.example.test/'
})
afterEach(() => { if (originalUrl === undefined) delete process.env.CLIENT_URL; else process.env.CLIENT_URL = originalUrl })
it('sends the real order template to the customer with the public download page link', async () => {
  await sendNewOrderRequested({ name: 'Staff', email: 'staff@example.test' }, 'jwt', { order, items: [] })
  const mail = mockSend.mock.calls.find(args => args[0] === order.email)
  expect(mail?.[2]).toContain(`href="https://pos.example.test/facturas/${uuid}"`)
  expect(mail?.[2]).not.toContain('/invoices.zip')
  expect(mail?.[2]).not.toContain('[invoiceLink]')
})
it('includes the same link in the customer payment email', async () => {
  await sendPaymentStatusChangeNotification('jwt', { id: 42, payment: 58, paymentMethod: 1 })
  expect(mockSend).toHaveBeenCalledWith(order.email, expect.any(String), expect.stringContaining(`/facturas/${uuid}`))
})
it('does not invent a link for historical orders', () => {
  expect(invoiceDownloadLink(null)).toBe('')
  expect(invoiceDownloadLink('42')).toBe('')
})
it('does not send twice when the user is the customer', async () => {
  await sendNewOrderRequested({ name: 'Cliente', email: order.email }, 'jwt', { order, items: [] })
  expect(mockSend).toHaveBeenCalledTimes(1)
})
