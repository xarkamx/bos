import { HttpError } from '../../errors/HttpError';
import { MiddlemanModel, type MiddlemanType } from '../../models/MiddlemanModel';
import { ClientService } from '../clients/ClientService';
import { BasService } from '../users/basService';

export class MiddlemanService {
    async addMiddleman(middleman: MiddlemanType) {
        const middlemanModel = new MiddlemanModel();
        return middlemanModel.addMiddleman(middleman);
    }


    async getAllMiddleman() {
        const middlemanModel = new MiddlemanModel();
        const resp = await middlemanModel.getAllMiddleman();

        return resp.map((middleman:any) => ({
            middlemanId: middleman.bas_id,
            name: middleman.name,
            email: middleman.email,
            address: middleman.address,
            phone: middleman.phone,
            rfc: middleman.rfc,
            bankName: middleman.bank_name,
            clabe: middleman.clabe
        }));
    }

    async getMiddlemanById(id: number) {
        const middlemanModel = new MiddlemanModel();
        const resp=await  middlemanModel.getMiddlemanById(id);
        if(!resp) throw new HttpError('Middleman not found', 404);
        return {
            middlemanId: resp.bas_id,
            name: resp.name,
            email: resp.email,
            address: resp.address,
            phone: resp.phone,
            rfc: resp.rfc,
            bankName: resp.bank_name,
            clabe: resp.clabe
        };
    }

    async getMiddlemanByName(name: string) {
        const middlemanModel = new MiddlemanModel();
        return middlemanModel.getMiddlemanByName(name);
    }

    async updateMiddleman(id: number, middleman: Partial<MiddlemanType>) {
        const middlemanModel = new MiddlemanModel();
        return middlemanModel.updateMiddleman(id, middleman);
    }

    async deleteMiddleman(id: number) {
        const middlemanModel = new MiddlemanModel();
        return middlemanModel.deleteMiddleman(id);
    }

    async getAllMiddlemanClients(id: number) {
        const middlemanModel = new MiddlemanModel();
        return middlemanModel.getAllMiddlemanClients(id);
    }

    async addClientToMiddleman(middlemanId: number, clientId: any) {
        const middlemanModel = new MiddlemanModel();
        const clientService = new ClientService();
       
        const client = await clientService.getClient(clientId);
        if(!client) throw new HttpError('Client not found',404);
        const clients = await middlemanModel.getAllMiddlemanClients(middlemanId);

        const found = clients.find((c:any) => c.client_id === clientId);
        if(found) throw new HttpError('Client already linked to middleman', 400);
        return middlemanModel.addClientToMiddleman(middlemanId, clientId);
      }

    async getOrdersByMiddlemanId(id: number) {
        const middlemanModel = new MiddlemanModel();
        const resp = await  middlemanModel.getOrdersByMiddlemanId(id);
        return resp.map((order:any) => ({
            orderId: order.orderId,
            total: order.total,
            status: order.status,
            createdAt: order.created_at,
            partialPayment: order.partial_payment,
            clientName: order.client_name,
            clientId: order.client_id,
            rfc: order.rfc
        }));
    }
}