import { HttpError } from '../../errors/HttpError';
import { InventoryModel } from '../../models/InventoryModel';
import { ProcessModel, type ProcessType } from '../../models/ProcessModel';
import { type optionalProduct, ProductsModel } from '../../models/productsModel';
import { sendPriceReductionNotification } from '../../utils/mailSender';

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
    const currentProduct = await productModel.getProductById(id)
    if(!currentProduct) throw new HttpError('Product not found', 404);
    const price = product.price ?? currentProduct.price;
    if(currentProduct.price>price){
      console.log(product)
      sendPriceReductionNotification([{name:currentProduct.name,oldPrice:currentProduct.price,price:product.price}]);
    }
    return productModel.updateProduct(id, product);
  }

  async updateAllPricesIn (increment: number): Promise<iProduct> {
    const productModel = new ProductsModel();
    return productModel.updateAllPricesIn(increment);
  }

  async getDetailsPerProduct (productId: number): Promise<any> {
    const productModel = new ProductsModel();
    
    const product =  productModel.getProductById(productId);
    const sales =  productModel.getHowManySalesPerProduct(productId);
    const customers =  productModel.getCustomersPerProduct(productId);
    const orders =  productModel.getOrdersPerProduct(productId);
    const materials = this.getMaterialsPerProduct(productId);
    const details = await Promise.all([product,sales, customers, orders,materials]);
    return {
      product: details[0],
      sales: details[1],
      customers: details[2],
      orders: details[3]
    }
  }

  async getMaterialsPerProduct (productId: number): Promise<any> {
    const productModel = new ProductsModel();
    return productModel.getMaterialsPerProduct(productId);
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

  async getInventory (): Promise<any> {
    const inventoryModel = new InventoryModel();
    const products = await  inventoryModel.getAllItemsByType('product'); 
    return products[0].map((product: any) => {
      return {
        ...product,
        materials: product.materials? JSON.parse(product.materials): [],
        
      }
    });
  }

  async getProductsInProcess(){
    const productModel = new ProcessModel();
    return productModel.getGroupedProcess();
  }

  async addProcess (process: ProcessType): Promise<any> {
    const processModel = new ProcessModel();
    return processModel.addProcess(process);
  }

  async getGroupedProcess (): Promise<any> {
    const processModel = new ProcessModel();
    let content = await processModel.getGroupedProcess();
    content = content.reduce((acc: any, item: any) => {
      const flow = item.flow === 'inflow' ? -1 : 1;
      const quantity:number = item.quantity * flow;
      acc[item.productId] = acc[item.productId] || item;
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      acc[item.productId].total = acc[item.productId].total?acc[item.productId].total+quantity:quantity;
      return acc;
    }, {})
    return Object.values(content).filter((item: any) => item.total > 0);
  }
}




type iProduct = {
  id: number;
  name: string;
  price: number;
}