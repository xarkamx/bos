import { HttpError } from '../../errors/HttpError'
import { ClientModel } from '../../models/ClientModel'
import { DebtModel, iDebt } from '../../models/DebtModel'
import { ProviderModel } from '../../models/ProviderModel'


export class DebtService {
  model: DebtModel
  providersModel: ProviderModel
  clientsModel: ClientModel
  constructor () {
    this.model = new DebtModel()
    this.providersModel = new ProviderModel()
    this.clientsModel = new ClientModel()
  }

  async addDebt (debt: iDebt) {
    await this.entityExists(debt.entity_id,debt.type)
    return this.model.addDebt(debt)        
  }

  async getOwnedDebt () {
    return this.model.getOwnedDebt()
  }

  async entityExists (entityId: number,type:string) {
    const model = type === 'client' ? this.clientsModel : this.providersModel
    const entity = await model.getById(entityId)

    if (!entity) throw new HttpError('Entity not found',404)
    return entity
  }
}

