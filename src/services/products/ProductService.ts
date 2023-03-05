import { ProductsModel } from '../../models/productsModel';

export class ProductsService {
  async getAllProducts (): Promise<iProduct[]> {
    const productModel = new ProductsModel();
    return productModel.getAllProducts();
  }
}

type iProduct = {
  id: number;
  name: string;
  price: number;
}