import { HttpError } from '../../errors/HttpError';
import { MaterialModel, type tMaterial } from '../../models/MaterialsModel';
import { ProductsModel } from '../../models/productsModel';
import { trimAllStringsInObject } from '../../utils/helpers';
import { sendPriceReductionNotification } from '../../utils/mailSender';

export class MaterialServiceV2 {
    async createMaterial(material: tMaterial) {
        const model = new MaterialModel();
        trimAllStringsInObject(material);
        const [id] = await model.createMaterial({
            name: material.name,
            description: material.description,
            unit: material.unit,
        });
        await  model.addPrice(id, material.provider_id, material.price);
        return [id];
    }

    async addPrice(materialId: number, providerId: number, price: number) {
        const model = new MaterialModel();
        const material = await model.getAll().where({ id: materialId }).first();
        if (!material) {
            throw new HttpError('Material not found');
        }

        return model.addPrice(materialId, providerId, price);
    }

    getMaterialById(id:number) {
        const model = new MaterialModel();
        return model.getAll().where({ id }).first();
    }

    async getMaterials() {
        const model = new MaterialModel();
        const materials = await model.getAll()
          .select('materials.id','materials.name', 'unit', 'price' );
        
        return materialFormat(materials)
    }
    async addProductsToMaterial(materialId: number,products: {productId:number,quantity:number}[]) {
        const model = new MaterialModel();
        const material = await model.getAll().where({ id: materialId }).first();
        if (!material) {
            throw new HttpError('Material not found',404);
        }
        return model.addProductsToMaterial(materialId, products);
    }
   async deleteProductsFromMaterial(materialId: number,productId:number) {
        const model = new MaterialModel();
        return model.deleteProductsFromMaterial(materialId, productId)
   }
    async getProductsByMaterialId(materialId: number) {
        const model = new ProductsModel();
        return model.getProductByMaterialId(materialId);
    
    }

    async updateMaterial(id: number, material: Partial<tMaterial>) {
        const model = new MaterialModel();
        trimAllStringsInObject(material);
        await model.updateMaterial(id, material);
        if (material.price) {
            await this.addPrice(id,0, material.price);
        }
    }

    async updateProductsPriceByMaterialId(materialId: number) {
        const model = new ProductsModel();
        const products = await model.getProductByMaterialId(materialId);
        const [current,prev] = await this.getMaterialPriceHistory(materialId);
        if(!prev?.price) return
        const diff = current.price - prev.price;
        if(diff === 0 ) return;
        let percentage = diff / current.price;

        if(Math.abs(percentage*100) <= 5 ) return;

        const newPrices = products.map((product:any) => {
            const priceRatio =product.price / prev.price;
            let newPrice = current.price * priceRatio;
            if(newPrice === product.price) return;
            if(newPrice < product.price) {
                newPrice = product.price * 0.95;
            }
            return {
                id: product.id,
                name: product.productName,
                price: newPrice,
                oldPrice: product.price,
            };
        });

        if(diff < 0 && newPrices.length) {
            sendPriceReductionNotification(newPrices)
        }

        return Promise.all(newPrices.map((product:any) => model.updateProduct(product.id, { price: product.price })));
    } 

    async getMaterialPriceHistory(materialId: number) {
        const model = new MaterialModel();
        return model.getMaterialPriceHistory(materialId);
    }
}


function materialFormat(materials:any){
  return materials.reduce((acc:any, material:any) => {
    const materialId = material.id;
    const { price, ...rest } = material;
    if (acc[materialId]) {
        acc[materialId].prices.push({
            price,
            created_at: material.created_at,
        });
    } else {
        acc[materialId] = {
            ...rest,
            prices: [{
              price,
              created_at: material.created_at,
            }],
        };
    }

    acc[materialId].currentPrice =acc[materialId].prices.sort((a:any, b:any) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB.getTime() - dateA.getTime();
    })[0].price || 0;

    return acc;
}, []).filter((material:any) => material);
}