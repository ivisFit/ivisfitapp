import "./load-env.js";

import { connectDB } from "@ivisfit/database";

const PORT = process.env.PORT ?? 4000;

async function start() {
  await connectDB();

  const { createApp } = await import("./app.js");
  const { startScheduler } = await import("./services/scheduler.service.js");
  const app = createApp();

  startScheduler();

  app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Error al iniciar el servidor:", error);
  process.exit(1);
});
