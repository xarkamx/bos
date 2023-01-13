import jwt from "@fastify/jwt";
import closeWithGrace from "close-with-grace";
import * as dotenv from "dotenv";
// Require the framework
import Fastify from "fastify";

import Db from "../src/db";

// Read the .env file.
dotenv.config();
Db.getInstance();

const isProduction = process.env.NODE_ENV === "production";
// Instantiate Fastify with some config
const app = Fastify({
  logger: !isProduction,
});

// Register JWT
void app.register<{ secret: any,sign:any,verify:any }>(jwt, {
  secret: process.env.JWT_SECRET,
  sign: {
    expiresIn: "1h",
    iss: 'bas',
  },
  verify: {
    allowedIss:['bas']
  },
});
// Register your application as a normal plugin.
void app.register(import("../src/index"));
const closeListeners = closeWithGrace({ delay: 500 }, async (opts: any) => {
  if (opts.err) {
    app.log.error(opts.err);
  }

  await app.close();
});

app.addHook("onClose", async (_instance, done) => {
  closeListeners.uninstall();
  done();
});

app.addHook("onRequest", async (request: any, reply) => {
  try {
    if (request.routeSchema?.public) {
      return;
    }

    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// // Start listening.
// void app.listen({
//   port: Number(process.env.PORT ?? 3000),
//   host: process.env.SERVER_HOSTNAME ?? "127.0.0.1",
// });

export default async (req: any, res: any) => {
  await app.ready();
  app.server.emit("request", req, res);
};
