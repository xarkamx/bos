import { type FastifyPluginAsync } from 'fastify';
import { InventoryService } from '../../services/inventory';



const inventory:FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.route({
    method: 'POST',
    url: '/',
    config:{
      auth:{
        roles:['cashier','storer']
      }
    },
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
    method: 'POST',
    url: '/products',
    config:{
      auth:{
        roles:['cashier','storer']
      }
    },
    schema:{
      body: {
        type: 'object',
        required: ['quantity'],
        properties: {
          quantity: { type: 'number' },
          product_id: { type: 'number' },
        }
      },
    },
    async handler (_request:any, reply) {
      const inventoryService = new InventoryService();
      const {product_id,quantity} = _request.body;
      const inv= await inventoryService.addItemToInventory(product_id,'product',quantity);
    }
  });

  fastify.route({
    method: 'POST',
    url: '/materials',
    config:{
      auth:{
        roles:['cashier','storer']
      }
    },
    schema:{
      body: {
        type: 'object',
        required: ['quantity'],
        properties: {
          quantity: { type: 'number' },
          material_id: { type: 'number' },
        }
      },
    },
    async handler (_request:any, reply) {
      const inventoryService = new InventoryService();
      const {material_id,quantity} = _request.body;
      return inventoryService.addItemToInventory(material_id,'materials',quantity);
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

  fastify.route({
    method: 'GET',
    url: '/items',
    config:{
      auth:{ 
        roles:['cashier','admin','storer']
      }
    },
    async handler (_request:any, reply) {
      const inventoryService = new InventoryService();
      return inventoryService.getAllSoldItems();
    }
  });

  fastify.route({
    method: 'GET',
    url: '/items/:product_id',
    config:{
      auth:{ 
        roles:['cashier','admin','storer']
      }
    },
    async handler (_request:any, reply) {
      const inventoryService = new InventoryService();
      return inventoryService.getItemsByProductId(_request.params.product_id);
    }
  });

  fastify.route({
    method: 'GET',
    url: '/history/:product_id',
    config:{
      auth:{ 
        roles:['cashier','admin','storer']
      }
    },
    async handler (_request:any, reply) {
      const inventoryService = new InventoryService();
      return inventoryService.getInventoryItemsByProductId(_request.params.product_id);
    }
  });
};

export default inventory;