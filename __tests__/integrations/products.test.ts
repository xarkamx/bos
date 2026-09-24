import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createControllerApp, methods, resetServices } from '../helpers/controller'

const mockProducts = methods('getAllProducts', 'addProduct', 'updateProduct', 'deleteProduct')

// Explicit factories keep database and external-service implementations unloaded.
jest.mock('../../src/services/products/ProductService', () => ({ ProductsService: jest.fn(() => mockProducts) }))

import controller from '../../src/routes/products'

let app: FastifyInstance

beforeEach(async () => {
  resetServices(mockProducts)
  app = await createControllerApp(controller, '/products')
})

afterEach(async () => { await app?.close() })

describe('products controller', () => {
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

  it('returns 500 when a service fails unexpectedly', async () => {
    mockProducts.getAllProducts.mockRejectedValue(new Error('Unavailable'))
    const response = await app.inject('/products')
    expect(response.statusCode).toBe(500)
    expect(response.json()).toMatchObject({ statusCode: 500, error: 'Internal Server Error' })
  })

  it('GET /products returns service data', async () => {
    mockProducts.getAllProducts.mockResolvedValue([{ id: 42 }])
    const response = await app.inject({ method: 'GET', url: '/products' })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual([{ id: 42 }])
    expect(mockProducts.getAllProducts).toHaveBeenCalledWith(...[])
  })

  it('DELETE /products/42 forwards the identifier', async () => {
    mockProducts.deleteProduct.mockResolvedValue({ message: 'Removed' })
    const response = await app.inject({ method: 'DELETE', url: '/products/42' })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ message: 'Removed' })
    expect(mockProducts.deleteProduct).toHaveBeenCalledWith('42')
  })

  it('rejects a product without a price', async () => {
    const response = await app.inject({ method: 'POST', url: '/products', payload: { name: 'Panel' } })
    expect(response.statusCode).toBe(400)
    expect(response.json()).toMatchObject({ error: 'Bad Request', statusCode: 400 })
    expect(mockProducts.addProduct).not.toHaveBeenCalled()
  })
})
