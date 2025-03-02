import { BaseTemplateHandler } from './baseTemplateHandler';
import { WsService } from '../services/notifications/wsService';

export class WsTemplate extends BaseTemplateHandler {
  readonly wsService: WsService;

  constructor(templateFileName: string) {
    super(`/whatsapp/${templateFileName}`);
    this.wsService = new WsService();
    
  }

  async sendNotification(data:Record<string,string>,to:string): Promise<any> {
    this.setHandlebarsFields(data);
    return this.wsService.sendNotification(this.formattedTemplate, to);
  }
}