import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import { loadConfig } from "./server/config.js";
import { agentConfigs, runAllGovernors, runGovernor } from "./server/governors/index.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const config = loadConfig();
  const app = express();

  app.use(express.json());

  const agentStatus = new Map(
    agentConfigs.map((configItem) => [
      configItem.agentName,
      {
        name: configItem.agentName,
        governorate: configItem.governorate,
        category: configItem.categories.join(", "),
        status: "idle",
        sourceAdapters: configItem.sourceAdapters,
        collectionLimit: configItem.collectionLimit,
        lastActivity: null as null | string,
      },
    ]),
  );

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", mode: config.nodeEnv, demoMode: config.demoMode });
  });

  app.get("/api/agents", (_req, res) => {
    res.json(Array.from(agentStatus.values()));
  });

  app.post("/api/orchestrator/start", async (_req, res) => {
    const results = await runAllGovernors();

    for (const result of results) {
      const status = agentStatus.get(result.agentName);
      if (!status) continue;
      status.status = result.status === "success" ? "completed" : "error";
      status.lastActivity = new Date().toISOString();
    }

    res.json({ status: "completed", results });
  });

  app.post("/api/orchestrator/stop", (_req, res) => {
    for (const agent of agentStatus.values()) {
      if (agent.status === "running") agent.status = "idle";
    }
    res.json({ status: "stopped" });
  });

  app.post("/api/agents/:agentName/run", async (req, res) => {
    const { agentName } = req.params;
    const status = agentStatus.get(agentName);
    if (!status) {
      return res.status(404).json({ error: `Unknown agent: ${agentName}` });
    }

    status.status = "running";
    status.lastActivity = new Date().toISOString();

    try {
      const result = await runGovernor(agentName);
      status.status = "completed";
      return res.json({ status: "completed", agentName, result });
    } catch (error: any) {
      status.status = "error";
      return res.status(500).json({ error: error.message });
    }
  });

  if (config.nodeEnv !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "..", "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(config.port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
}

startServer().catch((error) => {
  console.error("Fatal startup error:", error.message);
  process.exit(1);
});
