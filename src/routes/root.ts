import type { FastifyPluginAsync } from "fastify";
import RouterSingleton from '../config/routes';
const root: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get("/", async (_request, _reply) => {
    const routes = RouterSingleton.getInstance().getRoutes();
    return routes.filter((route) => route.method !== "OPTIONS" && route.method !== "HEAD");
  });
  fastify.get("/health/check", async (_request, _reply) => ({ status: true }));
};

export default root;
