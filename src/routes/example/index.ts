import type { FastifyPluginAsync } from "fastify";
import { EmailTemplate } from '../../services/mail/senders/emailTemplate';
import { sendNewOrderRequested } from '../../utils/mailSender';
import { OrderService } from '../../services/orders/OrdersService';

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
    const {user} = _request.user;
    const order = (await new OrderService().getOrderById(42))
    console.log(order)
    return sendNewOrderRequested(
      user,_request.headers.authorization,order
    );
  }
    )
};

export default example;
