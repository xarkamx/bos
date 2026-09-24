import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createControllerApp, methods, resetServices } from '../helpers/controller'

const mockInventory = methods('addItemToInventory', 'getAllItems')
const mockMaterials = methods('consumeMaterial', 'getMaterialById')

// Explicit factories keep database and external-service implementations unloaded.
jest.mock('../../src/services/inventory', () => ({ InventoryService: jest.fn(() => mockInventory) }))
jest.mock('../../src/services/Materials', () => ({ MaterialService: jest.fn(() => mockMaterials) }))

import controller from '../../src/routes/inventory'

let app: FastifyInstance

beforeEach(async () => {
  resetServices(mockInventory, mockMaterials)
  app = await createControllerApp(controller, '/inventory')
})

afterEach(async () => { await app?.close() })

describe('inventory controller', () => {
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

  it('GET /inventory?type=product returns service data', async () => {
    mockInventory.getAllItems.mockResolvedValue([{ id: 42 }])
    const response = await app.inject({ method: 'GET', url: '/inventory?type=product' })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual([{ id: 42 }])
    expect(mockInventory.getAllItems).toHaveBeenCalledWith(...['product'])
  })

  it('rejects a nonnumeric inventory quantity', async () => {
    const response = await app.inject({ method: 'POST', url: '/inventory', payload: { quantity: 'invalid' } })
    expect(response.statusCode).toBe(400)
    expect(response.json()).toMatchObject({ error: 'Bad Request', statusCode: 400 })
    expect(mockInventory.addItemToInventory).not.toHaveBeenCalled()
  })
})
