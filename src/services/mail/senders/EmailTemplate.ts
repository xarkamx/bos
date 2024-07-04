import fs from 'fs';
import { HttpError } from '../../../errors/HttpError';
import { MailService } from '../MailService';

export class EmailTemplate {
  template: string;
  html: string ='';
  constructor(templateName:string) {
    const templatePath = `src/templates/${templateName}`;
    this.template = fs.readFileSync(templatePath, 'utf8');
  }
  getRequiredHandlebarsFields() {
    const regex = /\[[a-zA-Z]+\]/g;
    const fields = [];
    let match;
    while ((match = regex.exec(this.template))) {
      fields.push(match[0].replace('[', '').replace(']', ''))
    }
    return fields;
  }

  setHandlebarsFields(data: Record<string, string>) {
   const keys = Object.keys(data);
   const templateKeys = this.getRequiredHandlebarsFields();
  const missingKeys = templateKeys.filter(key => !keys.includes(key));
    if(missingKeys.length > 0) {
      throw new HttpError(`Missing keys: ${missingKeys.join(',')}`,400);
    }
    const html = this.template.replace(/\[[a-zA-Z]+\]/g, (match) => {
      const key = match.replace('[', '').replace(']', '');
      return data[key];
    })
    this.html = html;
    return this;
  }

  sendMail(to:string, subject:string){
    const mailer = new MailService();
    return mailer.sendMail(to, subject, this.html);
  }


}