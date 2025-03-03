import { jest,beforeAll,afterAll,beforeEach } from '@jest/globals'
import { db } from './src/config/db'

/**
 * Jest Setup File
 * This file runs after Jest is initialized but before tests are run
 */

// Set default timeout for all tests (useful for integration tests)
jest.setTimeout(30000)

jest.mock('./src/services/users/basService', () => {
  return {
    BasService: jest.fn().mockImplementation(() => ({
      getDetails: jest.fn(() => {
        return Promise.resolve({ roles: ['admin'] })
      }),
      auth: jest.fn(() => {
        return Promise.resolve()
      })
    }))
  }
})

// Suppress console.log during tests
// Comment out any of these if you want to see the output during tests
global.console = {
  ...console,
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: jest.fn() // Consider keeping error logs visible by removing this line
}

// Mock fetch if you're using it
// global.fetch = jest.fn(() => 
//   Promise.resolve({
//     json: () => Promise.resolve({}),
//     text: () => Promise.resolve(''),
//     ok: true
//   })
// ) as jest.Mock;

// Add your global test setup here
beforeAll(async () => {
  const resp = await db('information_schema.tables').select('table_name').where('table_schema', 'bos')
  const promisedTruncate = resp.map((table: any) => db.raw(`TRUNCATE TABLE ${table.table_name}`))
  await Promise.all(promisedTruncate)
  await db.seed.run()
})

afterAll(() => {
  // Cleanup code that runs after all tests complete
})

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
})

// Add custom matchers if needed
// Example: 
// expect.extend({
//   toBeWithinRange(received, floor, ceiling) {
//     const pass = received >= floor && received <= ceiling;
//     return {
//       pass,
//       message: () => `expected ${received} ${pass ? 'not ' : ''}to be within range ${floor} - ${ceiling}`,
//     };
//   },
// });