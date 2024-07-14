import type { FastifyPluginAsync } from "fastify";
import {  sendWelcomeMessageToClientAsUser } from '../../utils/mailSender';
import { OrderService } from '../../services/orders/OrdersService';
import { ClientService } from '../../services/clients/ClientService';

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
    const clientService = new ClientService();
    const client = await clientService.getClientByEmail("albertogmx91@gmail.com");

    await  sendWelcomeMessageToClientAsUser(
      client
    );
    return "Hello world";
  }
    )
};

export default example;
