import { MaterialModel, tMaterial } from '../../models/MaterialModel'
import { InventoryService } from '../inventory'
import { ProductsService } from '../products/ProductService'

export class MaterialService {
  model: MaterialModel
  productsService: ProductsService
  inventoryService: InventoryService
  constructor () {
    this.model = new MaterialModel()
    this.productsService = new ProductsService()
    this.inventoryService = new InventoryService()
  }

  async addMaterial (material: tMaterial) {
    const [id] = await this.model.addMaterial(material)
    return this.model.getMaterialById(id)
  }

  getMaterialById (id: number): Promise<tMaterial> {
    return this.model.getMaterialById(id)
  }

  getMaterialsByProductId (productId: number): Promise<any[]> {
    return this.productsService.getMaterialsPerProduct(productId)
  }

  async consumeMaterial (productId: number, productQty: number) {
    const materials = await this.getMaterialsByProductId(productId)
    const promisedMaterials = materials.map(async (material) => {
      const amount = (material.requiredQuantity * productQty) * -1
      return this.inventoryService.addItemToInventory(material.materialId, 'materials', amount)
    })
    return Promise.all(promisedMaterials)
  }
}