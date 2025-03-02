import path from 'path'
import fs from 'fs'
import { HttpError } from '../errors/HttpError'

export class BaseTemplateHandler {
  template: string
  formattedTemplate: string
  constructor (templatePath:string) {
    this.template = fs.readFileSync(path.join(__dirname,templatePath), 'utf8')
    this.formattedTemplate = ''
  }

  getRequiredHandlebarsFields () {
    const regex = /\[[a-zA-Z]+\]/g
    const fields = []
    let match
    while ((match = regex.exec(this.template))) {
      fields.push(match[0].replace('[', '').replace(']', ''))
    }
    return fields
  }

  setHandlebarsFields (data: Record<string, string>) {
    const keys = Object.keys(data)
    const templateKeys = this.getRequiredHandlebarsFields()
    const missingKeys = templateKeys.filter(key => !keys.includes(key))
    if (missingKeys.length > 0) {
      throw new HttpError(`Missing keys: ${missingKeys.join(',')}`,400)
    }
    const text = this.template.replace(/\[[a-zA-Z]+\]/g, (match) => {
      const key = match.replace('[', '').replace(']', '')
      return data[key]
    })
    this.formattedTemplate = text
    return this
  }

}

