import { ProductsModel } from '../../models/productsModel';

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
}

type iProduct = {
  id: number;
  name: string;
  price: number;
}