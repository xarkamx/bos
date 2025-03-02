import { MetadataBilling, type MetadataBillingType } from '../../models/metadataBilling'

export class MetadataBillingService {
  add (metadataBilling:MetadataBillingType) {
    const model = new MetadataBilling()
    return model.addMetadataBilling(metadataBilling)
  }

  getAll () {
    const model = new MetadataBilling()
    return model.getMetadataBillings()
  }
}