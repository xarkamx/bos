import { MaterialModel, tMaterial } from '../../models/MaterialModel';

export class MaterialService {
    model: MaterialModel;
    constructor() {
       this.model = new MaterialModel();
    }

    async addMaterial(material: tMaterial) {
        const [id] = await this.model.addMaterial(material);
        return this.model.getMaterialById(id);
    }

    getMaterialById(id: number): Promise<tMaterial> {
        return this.model.getMaterialById(id);
    }
}