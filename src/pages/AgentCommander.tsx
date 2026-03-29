import { useEffect, useState } from 'react';
import { Send, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AgentTask {
  id: string;
  type: string;
  instruction: string;
  status: string;
  created_at: string;
}

export default function AgentCommander() {
  const [instruction, setInstruction] = useState('Find restaurants in Basra');
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [importStatus, setImportStatus] = useState('');

  const loadTasks = async () => {
    const { data } = await supabase.from('agent_tasks').select('*').order('created_at', { ascending: false }).limit(25);
    setTasks((data as AgentTask[]) ?? []);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const queueTask = async () => {
    await supabase.from('agent_tasks').insert({
      type: 'finder',
      instruction,
      status: 'pending',
      created_at: new Date().toISOString(),
    });
    setInstruction('');
    await loadTasks();
  };

  const importSample = async () => {
    setImportStatus('Importing sample data...');
    const { error } = await supabase.from('businesses').insert([
      { name_en: 'Sample Business', category: 'restaurants', city: 'Baghdad', status: 'pending', created_at: new Date().toISOString() },
    ]);
    setImportStatus(error ? `Import failed: ${error.message}` : '✅ Imported sample business');
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Agent Commander</h1>
      <div className="flex gap-2">
        <input className="border rounded px-3 py-2 flex-1" value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="Task instruction" />
        <button onClick={queueTask} className="px-4 py-2 bg-indigo-600 text-white rounded flex items-center gap-2"><Send size={16} /> Queue</button>
      </div>
      <button onClick={importSample} className="px-4 py-2 border rounded flex items-center gap-2"><Upload size={16} /> Import sample</button>
      {importStatus && <p>{importStatus}</p>}
      <table className="w-full text-left text-sm">
        <thead><tr><th>Type</th><th>Instruction</th><th>Status</th></tr></thead>
        <tbody>
          {tasks.map((task) => <tr key={task.id} className="border-t"><td>{task.type}</td><td>{task.instruction}</td><td>{task.status}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
