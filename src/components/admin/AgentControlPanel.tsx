import React, { useState, useEffect } from "react";

interface Agent {
  name: string;
  governorate: string;
  governmentRate: string;
  status: "running" | "idle" | "error";
  recordsInserted?: number;
  lastActivity?: string;
}

export const AgentControlPanel: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents");
      if (!response.ok) throw new Error("Failed to fetch agents");
      const data = await response.json();
      setAgents(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching agents:", err);
      setError("Failed to load agent status");
    }
  };

  const startAgents = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/orchestrator/start", { method: "POST" });
      if (!response.ok) throw new Error("Failed to start agents");
      await fetchAgents();
    } catch (err) {
      setError("Failed to start agents");
    } finally {
      setLoading(false);
    }
  };

  const stopAgents = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/orchestrator/stop", { method: "POST" });
      if (!response.ok) throw new Error("Failed to stop agents");
      await fetchAgents();
    } catch (err) {
      setError("Failed to stop agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8 p-6 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl">
      <h2 className="text-xl font-bold text-white mb-6 font-mono tracking-tight">
        ENRICHMENT AGENT CONTROL
      </h2>

      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={startAgents}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-mono text-sm transition-colors disabled:opacity-50"
        >
          START AGENTS
        </button>
        <button
          onClick={stopAgents}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-mono text-sm transition-colors disabled:opacity-50"
        >
          STOP AGENTS
        </button>
        <button
          onClick={fetchAgents}
          disabled={loading}
          className="bg-neutral-700 hover:bg-neutral-600 text-white px-6 py-2 rounded font-mono text-sm transition-colors disabled:opacity-50"
        >
          REFRESH STATUS
        </button>
        <div className="ml-auto flex items-center gap-3 px-4 py-2 bg-emerald-900/20 border border-emerald-800 rounded">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-emerald-400 font-mono text-xs font-bold tracking-widest">QC_OVERSEER: ACTIVE</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 text-red-400 text-xs font-mono">
          ERROR: {error}
        </div>
      )}

      <div className="overflow-hidden border border-neutral-800 rounded">
        <table className="w-full text-left font-mono text-sm">
          <thead>
            <tr className="bg-neutral-800 text-neutral-400">
              <th className="px-4 py-3 font-bold uppercase tracking-wider">Agent ID</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider">Gov Rate</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider">Records</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider">Last Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {agents.length > 0 ? (
              agents.map((agent, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-neutral-900" : "bg-neutral-900/50"}>
                  <td className="px-4 py-3 text-neutral-300 font-bold">{agent.name}</td>
                  <td className="px-4 py-3 text-neutral-400 text-xs">{agent.governmentRate}</td>
                  <td className="px-4 py-3">
                    <span className={`
                      ${agent.status === "running" ? "text-emerald-400" : ""}
                      ${agent.status === "idle" ? "text-amber-400" : ""}
                      ${agent.status === "error" ? "text-red-400" : ""}
                    `}>
                      {agent.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-300 font-mono">{(agent.recordsInserted || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">{agent.lastActivity || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500 italic">
                  No agents found or loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
