import { HttpError } from '../../errors/HttpError';
import { InventoryModel } from '../../models/InventoryModel';
import { type optionalProduct, ProductsModel } from '../../models/productsModel';

export class ProductsService {
  async getAllProducts (): Promise<iProduct[]> {
    const productModel = new ProductsModel();
    return productModel.getAllProducts();
  }

  async addProduct (product: iProduct): Promise<iProduct> {
    const productModel = new ProductsModel();
    return productModel.addProduct(product);
  }

  async deleteProduct (id: number): Promise<iProduct> {
    const productModel = new ProductsModel();
    return productModel.deleteProduct(id);
  }

  async updateProduct (id: number, product:optionalProduct): Promise<iProduct> {
    const productModel = new ProductsModel();
    product.name = product.name?.toUpperCase();
    return productModel.updateProduct(id, product);
  }

  async updateAllPricesIn (increment: number): Promise<iProduct> {
    const productModel = new ProductsModel();
    return productModel.updateAllPricesIn(increment);
  }


  async addProductToInventory (id: number, quantity: number): Promise<any> {
    const productModel = new ProductsModel();
    const inventoryModel = new InventoryModel();
    const product= await productModel.getProductsByIds([id]).first();
    if(!product) throw new HttpError('Product not found', 404);
    await inventoryModel.addToInventory(id,'product', quantity);
    const qty = await inventoryModel.getTotalQty(id);
    product.quantity = qty;
    product.price *=  qty;
    return product;
  }
}




type iProduct = {
  id: number;
  name: string;
  price: number;
}