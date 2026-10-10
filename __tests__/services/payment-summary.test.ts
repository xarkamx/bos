import { expect, it, jest } from '@jest/globals'
import axios from 'axios'
jest.mock('axios')
jest.mock('facturapi', () => jest.fn())
import { FacturaApiService } from '../../src/services/billing/FacturaApiService'

it('requests provider payment history/taxes without creating an invoice', async () => {
  const summary = { uuid: 'fiscal-uuid', installment: 2, last_balance: 116, amount: 58, taxes: [] }
  jest.mocked(axios.get).mockResolvedValue({ data: summary })
  await expect(new FacturaApiService('test-only-key').paymentSummary('invoice-id', 58)).resolves.toEqual(summary)
  expect(axios.get).toHaveBeenCalledWith('https://www.facturapi.io/v2/invoices/invoice-id/payment-summary', {
    params: { amount: 58 }, headers: { Authorization: 'Bearer test-only-key' }, timeout: 15000
  })
})
it('propagates summary failure instead of inventing taxes or installment', async () => {
  jest.mocked(axios.get).mockRejectedValue(new Error('Provider unavailable'))
  await expect(new FacturaApiService('test-only-key').paymentSummary('invoice-id', 58)).rejects.toThrow('Provider unavailable')
})
