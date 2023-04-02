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
}




type iProduct = {
  id: number;
  name: string;
  price: number;
}