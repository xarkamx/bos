import { zipSync } from 'fflate'
import { HttpError } from '../../errors/HttpError'
import { PublicOrderBillingModel } from '../../models/PublicOrderBillingModel'
import { ClientService } from '../clients/ClientService'
import { BillingService } from './BillingService'
import { FacturaApiService } from './FacturaApiService'

const MAX_ARCHIVE_BYTES = 50 * 1024 * 1024

export class PublicOrderInvoiceService {
  private readonly model = new PublicOrderBillingModel()
  private readonly provider = new FacturaApiService()
  private readonly billing = new BillingService(this.provider)

  async details (uuid: string) {
    const order = await this.model.findByUuid(uuid)
    if (!order || order.deleted_at) throw new HttpError('Orden no encontrada', 404)
    const customer = await new ClientService().getClient(String(order.client_id))
    return {
      order: { id: order.id, status: order.status },
      customer: {
        name: customer?.name ?? null,
        rfc: customer?.rfc ?? null,
        postalCode: customer?.postal_code ?? null,
        taxSystem: customer?.tax_system ?? null
      }
    }
  }
  async download (uuid: string): Promise<Buffer> {
    const order = await this.model.findByUuid(uuid)
    if (!order || order.deleted_at) throw new HttpError('Orden no encontrada', 404)

    const records = await this.billing.getBillByOrderId(String(order.id))
    const ids = new Set<string>(records.map((record: { external_id: string }) => record.external_id).filter(Boolean))
    if (order.billed) ids.add(order.billed)

    // Existing invoices remain downloadable even if fiscal data has since changed.
    if (ids.size === 0) {
      await this.issue(order)
      const updated = await this.billing.getBillByOrderId(String(order.id))
      for (const record of updated) if (record.external_id) ids.add(record.external_id)
      const current = await this.model.findByUuid(uuid)
      if (current?.billed) ids.add(current.billed)
      if (ids.size === 0) throw new HttpError('La factura requiere revisión antes de descargarse', 409)
    }

    if (order.status !== 'paid' && Number(order.payment_type) !== 99) {
      throw new HttpError('La orden debe estar pagada para descargar facturas que no sean PPD', 409)
    }
    return this.archive([...ids])
  }

  private async issue (order: any) {
    const isPPD = Number(order.payment_type) === 99
    if (order.status !== 'paid' && !(isPPD && order.status === 'pending')) {
      throw new HttpError('La orden no está marcada como pagada', 409)
    }
    if (order.public_billing_attempted_at) {
      throw new HttpError('La facturación está en proceso o requiere revisión', 409)
    }
    const customer = await new ClientService().getClient(String(order.client_id))
    if (!customer || !isInvoiceRfc(customer.rfc)) throw new HttpError('La orden no tiene un RFC válido para facturar', 422)
    if (!customer.name?.trim() || !customer.email?.trim() || !/^\d{5}$/.test(customer.postal_code || '') || !customer.tax_system) {
      throw new HttpError('Los datos fiscales del cliente están incompletos', 422)
    }
    const paymentType = String(order.payment_type).padStart(2, '0')
    if (!isPPD && !/^(01|02|03|04|05|06|08|12|13|14|15|17|23|24|25|26|27|28|29|30|31)$/.test(paymentType)) {
      throw new HttpError('La orden pagada requiere una forma de pago definida', 422)
    }
    // Durable compare-and-set: independent workers cannot issue this order twice.
    // Never clear on provider failure: a timeout may occur after successful stamping.
    if (!await this.model.claim(order.id, order.public_uuid, Number(paymentType))) {
      throw new HttpError('La orden cambió o su facturación ya está en proceso', 409)
    }
    try {
      await this.billing.addInvoice([order.id], customer.tax_system, paymentType, isPPD ? 'PPD' : 'PUE')
    } catch {
      throw new HttpError('No se pudo confirmar la emisión; la orden requiere revisión antes de reintentar', 502)
    }
  }

  private async archive (ids: string[]) {
    const files: Record<string, Uint8Array> = {}
    const budget = { size: 0 }
    try {
      for (const [index, id] of ids.entries()) {
        // Names are generated locally; provider/user filenames never become ZIP paths.
        for (const extension of ['pdf', 'xml'] as const) {
          const stream = extension === 'pdf'
            ? await this.provider.downloadPdf(id)
            : await this.provider.downloadXml(id)
          files[`factura-${index + 1}/factura.${extension}`] = await readInvoiceFile(stream, budget)
        }
      }
      return Buffer.from(zipSync(files, { level: 0 }))
    } catch {
      throw new HttpError('No se pudieron descargar todas las facturas; intenta nuevamente', 502)
    }
  }
}

async function readInvoiceFile (stream: AsyncIterable<Buffer | Uint8Array | string>, budget: { size: number }) {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    budget.size += buffer.length
    if (budget.size > MAX_ARCHIVE_BYTES) throw new Error('Archive too large')
    chunks.push(buffer)
  }
  const file = Buffer.concat(chunks)
  if (file.length === 0) throw new Error('Empty invoice file')
  return file
}

// Local structural validation; the invoicing provider validates fiscal data on issue.
// Generic public/foreign RFCs are placeholders, not a customer's fiscal identity.
export function isInvoiceRfc (value: unknown): boolean {
  if (typeof value !== 'string') return false
  if (value === 'XAXX010101000' || value === 'XEXX010101000') return false
  const match = /^[A-ZÑ&]{3,4}(\d{2})(\d{2})(\d{2})[A-Z0-9]{3}$/.exec(value)
  if (!match) return false
  const year = 2000 + Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}
