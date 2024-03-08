import { db } from '../config/db';
import { snakeCaseReplacer } from '../utils/objectFormat';

export class MetadataBilling {

  public tableName = 'metadata_billing';
  public db: any;
  constructor(){
    this.db = db;
  }

  async addMetadataBilling(metadataBilling: any) {
    metadataBilling = metadataBilling.map((metadataBilling: any) => snakeCaseReplacer(metadataBilling));
    return this.db(this.tableName).insert(metadataBilling).onConflict('uuid').merge();
  }

  async getMetadataBillingById(id: number) {
    return this.db(this.tableName).where('id', id).first();
  }

  getMetadataBillings() {
    return this.db(this.tableName).orderBy('sat_certification_date', 'desc');
  }

  async updateMetadataBilling(id: number, metadataBilling: Partial<MetadataBillingType>) {
    metadataBilling = snakeCaseReplacer(metadataBilling);
    return this.db(this.tableName).where('id', id).update(metadataBilling);
  }

  

}

export type MetadataBillingType = {
  issuerRfc: string;
  issuerName: string;
  receiverRfc: string;
  receiverName: string;
  pacRfc: string;
  issueDate: Date;
  satCertificationDate: Date;
  amount: number;
  voucherEffect: string;
  status: string;
  cancellationDate: Date;
  paymentStatus: string;
}