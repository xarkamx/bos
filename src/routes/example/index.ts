import type { FastifyPluginAsync } from "fastify";
import { EmailTemplate } from '../../services/mail/senders/emailTemplate';

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
  fastify.get("/", async (_request, reply) => {
    const mail = new EmailTemplate("newClient.html");
    return mail.setHandlebarsFields({ userName: "John Doe",clientName: "Jane Doe",clientEmail: "xarkamx@gmail.com"})
      .sendMail(
        "xarkamx@gmail.com",
        "New Client"
      );
  });
};

export default example;
