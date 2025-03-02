import { type IProvider, ProviderModel } from '../../models/ProviderModel'
import { trimAllStringsInObject } from '../../utils/helpers'

export class ProviderService {
  createProvider (provider:IProvider) {
    const model = new ProviderModel()
    trimAllStringsInObject(provider)
    return model.add(provider)
  }

  getProviderById (id:number) {
    const model = new ProviderModel()
    return model.getAll().where({ id }).first()
  }

  getProviders () {
    const model = new ProviderModel()
    return model.getAll()
  }

}

