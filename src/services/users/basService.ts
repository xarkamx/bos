import axios from 'axios'
import { HttpError } from '../../errors/HttpError'

export class BasService {

  jwt:string = ''
  
  async auth ({ email,password }:CredentialType) {
    const basUrl = process.env.BAS_URL
    const company = process.env.BAS_COMPANY
    try {
      const fetch = await axios.post(`${basUrl}/users/signup`,{ email,password,company })
      
      const details = await this.getDetails(fetch.data.token)
      return {
        jwt: fetch.data.token,
        ttl: fetch.data.ttl,
        roles: details.roles
      }
    } catch (err:any) {
      throw new HttpError(err.response.data.message, err.response.status)
    }

   
  }

  async asSuperAdmin () {
    const token = process.env.BAS_SUPER_ADMIN_TOKEN
    this.jwt = token ? `Bearer ${token}` : ''
    return this.jwt
  }
  // Not sure if this is in the right place

  async getUsers (jwt:string) {
    const url:any = process.env.BAS_URL
    const company:any = process.env.BAS_COMPANY
    const validUrl = encodeURI(`${url}/companies/${company}/users`)
    try {
      const users = await axios.get(validUrl,{
        headers: {
          Authorization: jwt
        }
      })
      return users.data.data
    } catch (err:any) {
      throw new HttpError(err.response.data.message, err.response.status)
    }
  }

  async getDetails (jwt:string) {
    const url:any = process.env.BAS_URL
    const company = process.env.BAS_COMPANY?.split('-')[0]
    const fetch = await axios.get(`${url}/me`,{
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    })
    const validCompany = fetch.data.data.companies.find((c:any) => c.name === company)

    if (!validCompany) {
      throw new HttpError('Invalid User',403)
    }

    return {
      user: fetch.data.data.user,
      roles: validCompany.roles
    }
  }

  async addUser (jwt:string, user:UserType) {
    const url:any = process.env.BAS_URL
    const company = process.env.BAS_COMPANY
    const validUrl = encodeURI(`${url}/companies/${company}/users`)
    try {
      const users = await axios.post(validUrl,{
        name: user.name,
        email: user.email,
        password: user.password
      },{
        headers: {
          Authorization: jwt
        }
      })
      return users.data.data
    } catch (err:any) {
      throw new HttpError(err.response.data.message, err.response.status)
    }
  }

  async addDevice (jwt:string,device:DeviceType) {
    const url:any = process.env.BAS_URL
    const company = process.env.BAS_COMPANY
    const validUrl = encodeURI(`${url}/companies/${company}/devices`)
    try {
      const users = await axios.post(validUrl,device,{
        headers: {
          Authorization: jwt
        }
      })
      return users.data.data
    } catch (err:any) {
      throw new HttpError(err.response.data.message, err.response.status)
    }
  }

  async addRole (jwt:string, userId:number, role:string) {
    const url:any = process.env.BAS_URL
    const company = process.env.BAS_COMPANY
    const validUrl = encodeURI(`${url}/companies/${company}/users/${userId}/roles`)
    try {
      const users = await axios.post(validUrl,{
        roleName: role
      },{
        headers: {
          Authorization: jwt
        }
      })
      return users.data.data
    } catch (err:any) {
      throw new HttpError(err.response.data.message, err.response.status)
    }

  }

  async getUsersByRole (jwt:string, role:string) {
    const url:any = process.env.BAS_URL
    const company = process.env.BAS_COMPANY
    const validUrl = encodeURI(`${url}/companies/${company}/roles/${role}/users`)
    try {
      const users = await axios.get(validUrl,{
        headers: {
          Authorization: jwt
        }
      })
      return users.data.data
    } catch (err:any) {
      throw new HttpError(err.response.data.message, err.response.status)
    }
  }

  async sendNotification (jwt:string,  notification:any) {
    const url:any = process.env.BAS_URL
    const validUrl = encodeURI(`${url}/notifications`)
    try {
      const users = await axios.post(validUrl,notification,{
        headers: {
          Authorization: jwt
        }
      })
      return users.data.data
    } catch (err:any) {
      throw new HttpError(err.response.data.message, err.response.status)
    }
  }

  async changeMyPassword (jwt:string, password:string) {
    const url:any = process.env.BAS_URL
    const validUrl = encodeURI(`${url}/me/password`)
    try {
      const users = await axios.post(validUrl,{ newPassword: password },{
        headers: {
          Authorization: jwt
        }
      })
      return users.data.data
    } catch (err:any) {
      throw new HttpError(err.response.data.message, err.response.status)
    }
  }

  async removeUserFromCompany (jwt:string, userId:number) {
    const url:string = process.env.BAS_URL ?? ''
    const company = process.env.BAS_COMPANY ?? ''
    const validUrl = encodeURI(`${url}/companies/${company}/users/${userId}`)
    try {
      await axios.delete(validUrl,{
        headers: {
          Authorization: jwt
        }
      })
      return { message: `User ${userId} removed from company ${company}`,user: userId }
    } catch (err:any) {
      throw new HttpError(err.response.data.message, err.response.status)
    }
  }
}


type CredentialType = {
  email: string;
  password: string;
}

type UserType = {
  name: string;
  email: string;
  password: string;
}

type DeviceType = {
  name: string;
  type: string;
  token: string;
  os: string;
  osVersion: string;
  browser: string;
  brand: string;
}