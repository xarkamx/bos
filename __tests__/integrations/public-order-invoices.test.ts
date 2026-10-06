import Fastify, { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { HttpError } from '../../src/errors/HttpError'

const mockDownload = jest.fn<(uuid: string) => Promise<Buffer>>()
jest.mock('../../src/services/billing/PublicOrderInvoiceService', () => ({
  PublicOrderInvoiceService: jest.fn(() => ({ download: mockDownload }))
}))
import route from '../../src/routes/public/orders'

const uuid = 'bd4e6519-6154-44b1-805d-b67539df0405'
let app: FastifyInstance
beforeEach(async () => {
  mockDownload.mockReset()
  app = Fastify()
  // Same public-route condition used by both production entry points; no fake user.
  app.addHook('onRequest', async request => {
    if (!(request.routeOptions.config as any).auth?.public) throw new HttpError('Authentication required', 401)
  })
  await app.register(route, { prefix: '/public/orders' })
  await app.ready()
})
afterEach(async () => { await app.close() })

describe('public order invoice route', () => {
  it('downloads without Authorization and disables caching', async () => {
    const bytes = Buffer.from('ZIP bytes')
    mockDownload.mockResolvedValue(bytes)
    const response = await app.inject(`/public/orders/${uuid}/invoices.zip`)
    expect(response.statusCode).toBe(200)
    expect(response.rawPayload).toEqual(bytes)
    expect(response.headers['content-type']).toBe('application/zip')
    expect(response.headers['content-disposition']).toBe(`attachment; filename="facturas-${uuid}.zip"`)
    expect(response.headers['cache-control']).toContain('no-store')
    expect(mockDownload).toHaveBeenCalledWith(uuid)
  })

  it.each(['42', 'not-a-uuid', '00000000-0000-0000-0000-000000000000'])('rejects malformed UUID %s', async value => {
    expect((await app.inject(`/public/orders/${value}/invoices.zip`)).statusCode).toBe(400)
    expect(mockDownload).not.toHaveBeenCalled()
  })

  it.each([404, 409, 422, 502])('returns %s as JSON, not a corrupt ZIP', async status => {
    mockDownload.mockRejectedValue(new HttpError('Cannot invoice', status))
    const response = await app.inject(`/public/orders/${uuid}/invoices.zip`)
    expect(response.statusCode).toBe(status)
    expect(response.headers['content-type']).toContain('application/json')
    expect(response.headers['content-disposition']).toBeUndefined()
  })

  it('never creates invoices for HEAD probes', async () => {
    const response = await app.inject({ method: 'HEAD', url: `/public/orders/${uuid}/invoices.zip` })
    expect(response.statusCode).not.toBe(200)
    expect(mockDownload).not.toHaveBeenCalled()
  })
})
