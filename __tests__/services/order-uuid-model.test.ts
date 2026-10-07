import { describe, expect, it, jest } from '@jest/globals'
import knex from 'knex'
jest.mock('../../src/config/db', () => ({ db: null }))
import { OrderModel } from '../../src/models/OrderModel'

describe('order UUID queries', () => {
  const compiler = knex({ client: 'mysql' })
  it('includes nullable publicUuid in the detail query', () => {
    const model = new OrderModel()
    model.db = compiler
    const query = model.getOrderById(42).toSQL()
    expect(query.sql).toContain('`public_uuid` as `publicUuid`')
    expect(query.bindings).toEqual([42])
  })
  it('looks up the stored UUID only for a nondeleted order, without updating', () => {
    const model = new OrderModel()
    model.db = compiler
    const query = model.getOrderUuid(42).toSQL()
    expect(query.sql).toBe('select `id`, `public_uuid` as `publicUuid` from `orders` where `id` = ? and `deleted_at` is null limit ?')
    expect(query.bindings).toEqual([42, 1])
  })
})
