import express from 'express';
import { createServer as createViteServer } from 'vite';
import { runGovernor } from './server/governors/index.js';
import { supabaseAdmin } from './server/supabase-admin.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());

  app.get('/api/health', async (_req, res) => {
    const { error } = await supabaseAdmin.from('agents').select('id', { count: 'exact', head: true });
    res.json({ status: error ? 'degraded' : 'ok', persistence: 'supabase', detail: error?.message ?? null });
  });

  app.get('/api/agents', async (_req, res) => {
    const { data, error } = await supabaseAdmin.from('agents').select('*').order('name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data ?? []);
  });

  app.post('/api/orchestrator/start', async (_req, res) => {
    const { error } = await supabaseAdmin.from('agents').update({ status: 'running' }).neq('name', '');
    if (error) return res.status(500).json({ error: error.message });
    const { data } = await supabaseAdmin.from('agents').select('*').order('name');
    res.json({ status: 'started', agents: data ?? [] });
  });

  app.post('/api/orchestrator/stop', async (_req, res) => {
    const { error } = await supabaseAdmin.from('agents').update({ status: 'idle' }).neq('name', '');
    if (error) return res.status(500).json({ error: error.message });
    const { data } = await supabaseAdmin.from('agents').select('*').order('name');
    res.json({ status: 'stopped', agents: data ?? [] });
  });

  app.post('/api/agents/:agentName/run', async (req, res) => {
    const { agentName } = req.params;
    try {
      runGovernor(agentName).catch(console.error);
      res.json({ status: 'started', agentName });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
