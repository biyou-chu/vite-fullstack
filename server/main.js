// import services from "./service";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const routeMap = {
      // "/api/login": services.user,
    };

    const handler = Object.entries(routeMap).find(([route]) => path.startsWith(route));
    if (handler) {
      const mod = handler[1];
      return mod.handleRequest(request, env, ctx);
    }

    return new Response("Not Found", { status: 404 });
  },
};
