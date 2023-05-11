import axios from 'axios';
import { HttpError } from '../../errors/HttpError';

export class BasService {
  
  async auth({email,password}:CredentialType){
    const basUrl = process.env.BAS_URL;
    const company = process.env.BAS_COMPANY;
    try{
      const fetch = await axios.post(`${basUrl}/users/signup`,{email,password,company});
      const details = await this.getDetails(fetch.data.token);
      return {
        jwt:fetch.data.token,
        ttl:fetch.data.ttl,
        roles: details.roles
      };
    }catch(err:any){
      throw new HttpError(err.response.data.message, err.response.status)
    }

   
  }


  // Not sure if this is in the right place

  async getUsers(jwt:string){
    const url:any= process.env.BAS_URL;
    const company:any = process.env.BAS_COMPANY;
    const validUrl = encodeURI(`${url}/companies/${company}/users`);
    try{
      const users= await axios.get(validUrl,{
        headers:{
          Authorization:jwt
        }
      })
      return users.data.data;
    }catch(err:any){
      throw new HttpError(err.response.data.message, err.response.status)
    }
  }

  async getDetails(jwt:string){
    const url:any= process.env.BAS_URL;
    const company = process.env.BAS_COMPANY?.split('-')[0];
    const fetch = await axios.get(`${url}/me`,{
        headers:{
            Authorization:`Bearer ${jwt}`
        }
    })
    const validCompany = fetch.data.data.companies.find((c:any)=>c.name===company);

    if(!validCompany){
        throw new HttpError('Invalid User',403)
    }

    return {
        user:fetch.data.data.user,
        roles:validCompany.roles
    };
  }
}


type CredentialType = {
  email: string;
  password: string;
}