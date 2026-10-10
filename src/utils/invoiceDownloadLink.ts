export function invoiceDownloadLink (uuid: unknown): string {
  if (typeof uuid !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)) return ''
  const base = new URL(process.env.CLIENT_URL || 'https://pos-green.vercel.app/')
  if (!['https:', 'http:'].includes(base.protocol)) throw new Error('CLIENT_URL must use HTTP(S)')
  const url = new URL(`/facturas/${uuid}`, base).href.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  return `<p><a href="${url}">Descargar facturas (PDF y XML)</a></p>`
}
