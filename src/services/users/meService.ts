import axios from 'axios';
import { decode } from 'jsonwebtoken';
import { HttpError } from '../../errors/HttpError';

export class MeService{
    private readonly jwt:jwtType;
    constructor(private readonly jwtString:string){
        const obj:any=decode(this.jwtString)
        this.jwt = {
            token:jwtString,
            ...obj
        };
    }

    isExpired(){
        return this.jwt.exp<(Date.now()/1000);
    }

    async getDetails(){
        const url:any= process.env.BAS_URL;
        const company = process.env.BAS_COMPANY?.split('-')[0];
        const fetch = await axios.get(`${url}/me`,{
            headers:{
                Authorization:`Bearer ${this.jwt.token}`
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

type jwtType = {
    token:string,
    exp:number,
    iat:number,
    email:string,
    id:string
}