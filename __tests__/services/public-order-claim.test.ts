import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import knex from 'knex'

const mockDb = Object.assign(jest.fn<any>(), { fn: { now: () => '2026-10-06T12:00:00Z' } })
jest.mock('../../src/config/db', () => ({ db: mockDb }))
import { PublicOrderBillingModel } from '../../src/models/PublicOrderBillingModel'

const compiler = knex({ client: 'mysql' })
beforeEach(() => { mockDb.mockReset() })

describe('public UUID lookup and durable claim SQL', () => {
  it('looks up only the public UUID, never a numeric order ID fallback', () => {
    mockDb.mockImplementation((table: string) => compiler(table))
    const query = new PublicOrderBillingModel().findByUuid('uuid').toSQL()
    expect(query.sql).toContain('where `public_uuid` = ?')
    expect(query.bindings).toEqual(['uuid', 1])
  })

  it.each([0, 1])('claims only an eligible unclaimed order (affected rows: %s)', async affected => {
    const builder = compiler('orders')
    const update = builder.update.bind(builder)
    let compiled: any
    jest.spyOn(builder, 'update').mockImplementation(((values: any) => {
      compiled = update(values).toSQL()
      return Promise.resolve(affected)
    }) as any)
    mockDb.mockReturnValue(builder)
    await expect(new PublicOrderBillingModel().claim(42, 'uuid')).resolves.toBe(affected === 1)
    expect(compiled.sql).toContain('update `orders` set `public_billing_attempted_at` = ?')
    expect(compiled.sql).toContain('`id` = ? and `public_uuid` = ? and `status` = ?')
    expect(compiled.sql).toContain('`deleted_at` is null and `billed` is null and `public_billing_attempted_at` is null')
    expect(compiled.bindings).toEqual(['2026-10-06T12:00:00Z', 42, 'uuid', 'paid'])
  })
})
