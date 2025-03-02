import NodeCache from 'node-cache'

export class CacheService {
  private static instance: CacheService
  public storage: NodeCache
  constructor () {
    this.storage = new NodeCache(
      {
        stdTTL: 60 * 60 ,
        checkperiod: 10 * 10,
        useClones: false
      }
    )
  }
 
  static getInstance () {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }
}