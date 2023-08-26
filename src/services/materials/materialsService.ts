import { HttpError } from '../../errors/HttpError';
import { MaterialModel, type tMaterial } from '../../models/MaterialsModel';
import { trimAllStringsInObject } from '../../utils/helpers';

export class MaterialService {
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

    getMaterialById(id) {
        const model = new MaterialModel();
        return model.getAll().where({ id }).first();
    }

    async getMaterials() {
        const model = new MaterialModel();
        const materials = await model.getAll()
          .leftJoin('materials_price_list', 'materials.id', 'materials_price_list.material_id')
          .leftJoin('providers', 'materials_price_list.provider_id', 'providers.id')
          .select('materials.id','materials.name', 'unit', 'price','materials_price_list.created_at', 'providers.name as provider_name' );
        
        return materialFormat(materials)
    }

    updateMaterial(id, material) {
        return 'toDo';
    }

    getMaterialByIdWithBankDetails(id) {
        return 'toDo';
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