export const updateClientSchema = {
  body: {
    type: 'object',
    properties: {
      rfc: { type: 'string' },
      name: { type: 'string' },
      email: { type: 'string' },
      phones: { type: 'array', items: { type: 'string' } },
      legal: { type: 'boolean' },
      postal_code: { type: 'string' }
    }
  }
}