
export default class RouterSingleton {
  public static getInstance (): RouterSingleton {
    if (!RouterSingleton.instance) {
      RouterSingleton.instance = new RouterSingleton()
    }

    return RouterSingleton.instance
  }

  private static instance: RouterSingleton
  public routes: any[] = []
  addRoute (route: any) {
    this.routes.push(route)
  }

  getRoutes () {
    return this.routes
  }
}