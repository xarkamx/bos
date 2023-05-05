import axios from 'axios';
import { decode } from 'jsonwebtoken';
import { HttpError } from '../../errors/HttpError';
import { BasService } from './basService';

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
        const bas = new BasService();
       return bas.getDetails(this.jwt.token);
    }



}

type jwtType = {
    token:string,
    exp:number,
    iat:number,
    email:string,
    id:string
}