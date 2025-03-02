import type { FastifyPluginAsync } from "fastify";
import { WsTemplate } from '../../templates/wsSender';

const example: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  /**
   * @swagger
   * tags:
   *   name: Example
   *   description: Hello world end point
   */

  /**
   * @swagger
   * /example:
   *   get:
   *     tags: [Example]
   *     description: Returns the hello world
   *     responses:
   *       200:
   *         description: hello world
   */
  fastify.get("/", async (_request:any, reply) => {
    const ws= new WsTemplate('newOrder.md');
    return ws.sendNotification(
      {
        'order_id':'John Doe',
        'customer_name':'John Doe',
        'customer_email':'j@doe.com',
        'customer_phone':'1234567890',
        'order_total':'$ 100.00',
        'order_date':'2022-01-01',
        'status':'1'
      },
      '523323280770'
    
    )
   
  }
    )
};

export default example;
