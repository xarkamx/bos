export class HttpError extends Error {
  statusCode: number
  error: any
  constructor (message:string, statusCode = 500,error = {}) {
    super(message)
    this.statusCode = statusCode
    this.error = error
  }
}