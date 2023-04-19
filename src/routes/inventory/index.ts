import { type FastifyPluginAsync } from 'fastify';
import { InventoryService } from '../../services/inventory';



const inventory:FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.route({
    method: 'POST',
    url: '/',
    schema:{
      body: {
        type: 'object',
        required: ['quantity'],
        properties: {
          quantity: { type: 'number' },
          external_id: { type: 'number' },
          type: { type: 'string' },
        }
      },
    },
    async handler (_request:any, reply) {
      const inventoryService = new InventoryService();
      const {external_id,type,quantity} = _request.body;
      return inventoryService.addItemToInventory(external_id,type,quantity);
     
    }
  });
  fastify.route({
    method: 'GET',
    url: '/',
    async handler (_request:any, reply) {
      const inventoryService = new InventoryService();
      return inventoryService.getAllItems(_request.query.type);
    }
  });
};

export default inventory;