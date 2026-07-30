import Fastify from "fastify";
const app = Fastify({ logger: true });
app.get("/health", async () => ({ status: "ok" }));
app.get("/users", async () => []);
const start = async () => {
  try {
    await app.listen({ port: 3001, host: "0.0.0.0" });
    console.log("API running on port 3001");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();
