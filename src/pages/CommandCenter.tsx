import { useEffect, useState } from 'react';
import { Play, Square, Terminal } from 'lucide-react';
import { supabase } from '../lib/supabase';

type LogEntry = { id: string; message: string; type: string; created_at: string };

export default function CommandCenter() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [instruction, setInstruction] = useState('Run social enrichment for Baghdad');
  const [running, setRunning] = useState(false);

  const fetchLogs = async () => {
    const { data } = await supabase.from('agent_logs').select('*').order('created_at', { ascending: false }).limit(50);
    setLogs((data as LogEntry[]) ?? []);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const start = async () => {
    setRunning(true);
    await supabase.from('agent_tasks').insert({
      type: 'social',
      instruction,
      status: 'running',
      created_at: new Date().toISOString(),
    });
    await supabase.from('agent_logs').insert({
      type: 'info',
      message: `Task started: ${instruction}`,
      created_at: new Date().toISOString(),
    });
    await fetchLogs();
  };

  const stop = async () => {
    setRunning(false);
    await supabase.from('agent_logs').insert({
      type: 'warning',
      message: 'All agents stopped by user',
      created_at: new Date().toISOString(),
    });
    await fetchLogs();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Command Center</h1>
      <div className="flex gap-3">
        <input value={instruction} onChange={(e) => setInstruction(e.target.value)} className="border rounded px-3 py-2 flex-1" />
        <button onClick={start} className="px-4 py-2 bg-emerald-600 rounded text-white flex items-center gap-2"><Play size={16} /> Start</button>
        <button onClick={stop} className="px-4 py-2 border rounded flex items-center gap-2"><Square size={16} /> Stop</button>
      </div>
      <div>Status: {running ? 'running' : 'idle'}</div>
      <div className="border rounded p-4">
        <div className="font-semibold mb-2 flex items-center gap-2"><Terminal size={16} /> Recent Logs</div>
        <ul className="space-y-2 text-sm">
          {logs.map((log) => <li key={log.id}>[{log.type}] {log.message}</li>)}
        </ul>
      </div>
    </div>
  );
}
