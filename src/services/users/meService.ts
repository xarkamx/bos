
import { decode } from 'jsonwebtoken';
import { BasService } from './basService';
import { CacheService } from '../cache/cacheService';

export class MeService{
    private readonly jwt:jwtType;
    private readonly cache:any;
    constructor(private readonly jwtString:string){
        const obj:any=decode(this.jwtString)
        this.cache = CacheService.getInstance().storage;
        this.jwt = {
            token:jwtString,
            ...obj
        };
    }

    isExpired(){
        return this.jwt.exp<(Date.now()/1000);
    }

    async getDetails(){
        const cached = this.cache.get(this.jwt.token);
        if(cached){
            return cached;
        }
        const bas = new BasService();
        const details =await  bas.getDetails(this.jwt.token);
        this.cache.set(this.jwt.token,details);
        return details;
    }
}

type jwtType = {
    token:string,
    exp:number,
    iat:number,
    email:string,
    id:string
}