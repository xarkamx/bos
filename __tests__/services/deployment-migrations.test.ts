import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import knex from 'knex'
import { resolve } from 'path'

jest.mock('../../knexfile', () => ({
  production: { client: 'mysql', connection: { host: 'test.invalid', database: 'isolated', user: 'test', password: '' } }
}))
import config = require('../../knexfile')
import { migrateDeploy } from '../../scripts/migrate-deploy'

const latest = jest.fn<() => Promise<[number, string[]]>>()
const destroy = jest.fn<() => Promise<void>>()
const create = jest.fn(() => ({ migrate: { latest }, destroy }))
beforeEach(() => {
  latest.mockReset().mockResolvedValue([1, ['migration.ts']])
  destroy.mockReset().mockResolvedValue(undefined)
  create.mockClear()
})

describe('deployment migration runner', () => {
  it('uses production configuration and only TypeScript migrations, then closes the pool', async () => {
    await expect(migrateDeploy(create as unknown as typeof knex)).resolves.toEqual([1, ['migration.ts']])
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      client: 'mysql',
      migrations: expect.objectContaining({ directory: resolve(__dirname, '../../migrations'), loadExtensions: ['.ts'] })
    }))
    expect(latest).toHaveBeenCalledTimes(1)
    expect(destroy).toHaveBeenCalledTimes(1)
  })

  it('propagates failures and still closes the database connection', async () => {
    latest.mockRejectedValue(new Error('Migration failed'))
    await expect(migrateDeploy(create as unknown as typeof knex)).rejects.toThrow('Migration failed')
    expect(destroy).toHaveBeenCalledTimes(1)
  })

  it('accepts a database with no pending migrations', async () => {
    latest.mockResolvedValue([1, []])
    await expect(migrateDeploy(create as unknown as typeof knex)).resolves.toEqual([1, []])
  })

  it('fails before opening a connection when database configuration is missing', async () => {
    const settings = config as any
    const original = settings.production.connection.host
    settings.production.connection.host = undefined
    try {
      await expect(migrateDeploy(create as unknown as typeof knex)).rejects.toThrow('DB_HOST')
      expect(create).not.toHaveBeenCalled()
    } finally {
      settings.production.connection.host = original
    }
  })
})
