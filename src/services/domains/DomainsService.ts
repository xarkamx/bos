import { DomainModel } from '../../models/DomainsModel';

export class DomainsService {
  async addDomain(name: string) {
    const domain = new DomainModel();
    await domain.addDomain(name);
  }
}