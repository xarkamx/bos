import { HttpError } from '../../errors/HttpError';
import { CronModel, iCronJob } from '../../models/CronModel';
import parser from 'cron-parser';

export class CronService {
  services: any;
  constructor() {
    this.services = {}
  }

  setServices(command:string,service: any) {
    this.services[command] = service;
    return this
  }
  async addCronJob(cronjob: iCronJob) {
    const cronModel = new CronModel();
    const servicesNames = Object.keys(this.services);
    if(!servicesNames.includes(cronjob.command)){
      throw new HttpError(`Invalid command, must be one of the following: ${
        servicesNames.join(', ')
      }`, 400);
    }
    try{
      await cronModel.addCronJob(cronjob);
      return {message: 'Cron job added', data: cronjob}
    }catch(e:any){
      return {message: e.message}
    }
  }

  async getCronJobs() {
    const cronModel = new CronModel();
    try{
      const cronJobs = await cronModel.getCronJobs();
      return {message: 'Cron jobs retrieved', data: cronJobs}
    }catch(e:any){
      return {message: e.message}
    }
  }
  
  async getExecutableCronJobs() {
    const cronModel = new CronModel();
    const servicesNames = Object.keys(this.services);
    const jobs = await cronModel.getCronJobs().whereIn('command',servicesNames);
    return jobs.map((job:iCronJob) => {
      const interval = parser.parseExpression(job.schedule,{
        currentDate: new Date(job.executedAt)
      });
      const nextRun = interval.next().getTime();
      return {...job,nextRun}
    }).filter((job:any) => job.nextRun < new Date().getTime());
  }

  async executeCronJobs() {
    const jobs = await this.getExecutableCronJobs();
    const promiseJobs = jobs.map((job:any) => {
      return this.services[job.command]().then(() => {
        return new CronModel().updateCronJob(job.id, {executedAt: new Date()})
      });
    });
    return Promise.all(promiseJobs);
  }
  async updateCronJob(id: number, cronjob: Partial<iCronJob>) {
    const cronModel = new CronModel();
    try{
      await cronModel.updateCronJob(id, cronjob);
      return {message: 'Cron job updated', data: cronjob}
    }catch(e:any){
      return {message: e.message}
    }
  }

  async getScheduledEvents() {
    const cronModel = new CronModel();
    try{
      const scheduledEvents = await cronModel.getScheduledEvents();
      return {message: 'Scheduled events retrieved', data: scheduledEvents}
    }catch(e:any){
      return {message: e.message}
    }
  }
}

