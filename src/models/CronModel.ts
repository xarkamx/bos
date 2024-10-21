import { db } from '../config/db';
import { HttpError } from '../errors/HttpError';
import { snakeCaseReplacer } from '../utils/objectFormat';
import cron from 'node-cron';

export class CronModel {
  tableName: string;
  db: any;
  constructor() {
    this.tableName = 'cronjobs';
    this.db = db; 
  }

  addCronJob(cronjob: iCronJob): Promise<any> {
    if(cronjob.type==='cron'){
      this.validateSchedule(cronjob.schedule);
    }
    cronjob.createdAt = new Date();
    cronjob.executedAt = new Date();
    return this.db(this.tableName).insert(snakeCaseReplacer(cronjob));
  }

  validateSchedule(schedule: string): boolean {
    if(!cron.validate(schedule)){
      throw new HttpError('Invalid cron schedule', 400);
    }
    return true;
  }

  getCronJobs() {
    return this.db(this.tableName).select('id','name','schedule','status','type','command','created_at as createdAt','executed_at as executedAt')
    .where('status','active')
    .where('type','cron');
    ;
  }

  async getScheduledEvents(): Promise<string[]> {
    return this.db(this.tableName).select('*')
      .where('status','active')
      .where('type','event')
      .where('executed_at','>','now()')
  }

  async updateCronJob(id: number, cronjob: Partial<iCronJob>): Promise<any> {
    return this.db(this.tableName).where({ id }).update(snakeCaseReplacer(cronjob));
  }

}

export type iCronJob = {
  name: string;
  schedule: string;
  status: string;
  type: string;
  command: string;
  createdAt: Date;
  executedAt: Date;
};