import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AgentControlPanel } from "../components/admin/AgentControlPanel";

type Governor = {
  id: string;
  name: string;
  category: string;
  emoji: string;
  color: string;
  records: number;
  target: number;
  status: string;
  lastRun: string;
  errors: number;
};

const GOVERNOR_STYLE_FALLBACKS = [
  { emoji: "🍽️", color: "#FF6B35" },
  { emoji: "☕", color: "#F7B731" },
  { emoji: "🥐", color: "#FC5C65" },
  { emoji: "🏨", color: "#45AAF2" },
  { emoji: "💪", color: "#26de81" },
];

const statusConfig: Record<string, any> = {
  active: { label: "ACTIVE", bg: "rgba(38,222,129,0.15)", border: "#26de81", dot: "#26de81" },
  idle:   { label: "IDLE",   bg: "rgba(247,183,49,0.15)",  border: "#F7B731", dot: "#F7B731" },
  error:  { label: "ERROR",  bg: "rgba(252,92,101,0.15)",  border: "#FC5C65", dot: "#FC5C65" },
};

function pulse(color: string) {
  return {
    width: 8, height: 8, borderRadius: "50%", background: color,
    boxShadow: `0 0 0 0 ${color}`,
    animation: "pulse 1.8s infinite",
  };
}

export default function Admin() {
  const [time, setTime] = useState(new Date());
  const [animatedRecords, setAnimatedRecords] = useState<Record<string, number>>({});
  const [selectedGov, setSelectedGov] = useState<string | number | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [governors, setGovernors] = useState<Governor[]>([]);
  const [newToday, setNewToday] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const response = await fetch("/api/agents");
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.status}`);
      }

      const data = await response.json();
      const liveGovernors = Array.isArray(data)
        ? data.map((agent: any, index: number) => {
            const fallback = GOVERNOR_STYLE_FALLBACKS[index % GOVERNOR_STYLE_FALLBACKS.length];
            return {
              id: String(agent.id ?? agent.name ?? `agent-${index + 1}`),
              name: agent.name ?? agent.agent_name ?? `Agent ${index + 1}`,
              category: agent.category ?? "Unassigned",
              emoji: agent.emoji ?? fallback.emoji,
              color: agent.color ?? fallback.color,
              records: Number(agent.records_collected ?? agent.records ?? 0),
              target: Number(agent.target ?? 1000),
              status: agent.status ?? "idle",
              lastRun: agent.lastRun ?? "Unknown",
              errors: Number(agent.errors ?? 0),
            };
          })
        : [];

      setGovernors(liveGovernors);
      setNewToday(liveGovernors.reduce((total: number, governor: Governor) => total + governor.records, 0));
    } catch (err) {
      console.error("Error fetching agents:", err);
      setGovernors([]);
      setNewToday(0);
    }
  }

  useEffect(() => {
    // Animate numbers counting up
    const initial: Record<string, number> = {};
    governors.forEach(g => { initial[g.id] = 0; });
    setAnimatedRecords(initial);
    
    const timers = governors.map((g, i) =>
      setTimeout(() => {
        let count = 0;
        const step = Math.ceil(g.records / 60) || 1;
        const iv = setInterval(() => {
          count = Math.min(count + step, g.records);
          setAnimatedRecords(prev => ({ ...prev, [g.id]: count }));
          if (count >= g.records) clearInterval(iv);
        }, 20);
      }, i * 80)
    );
    return () => timers.forEach(clearTimeout);
  }, [governors]);

  const totalRecords = governors.reduce((a, g) => a + g.records, 0);
  const activeCount = governors.filter(g => g.status === "active").length;
  const errorCount = governors.filter(g => g.status === "error").length;
  const totalTarget = governors.reduce((a, g) => a + g.target, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalRecords / totalTarget) * 100) : 0;

  const filtered = activeFilter === "all" ? governors : governors.filter(g => g.status === activeFilter);

  return (
    <div style={{
      fontFamily: "'Courier New', 'Lucida Console', monospace",
      background: "#090d13",
      minHeight: "100vh",
      color: "#e2e8f0",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 currentColor; }
          70% { box-shadow: 0 0 0 6px transparent; }
          100% { box-shadow: 0 0 0 0 transparent; }
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .gov-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255,255,255,0.2) !important;
          cursor: pointer;
        }
        .gov-card { transition: all 0.2s ease; }
        .filter-btn:hover { opacity: 1 !important; }
      `}</style>

      {/* Grid background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        pointerEvents: "none",
      }} />

      {/* Scan line effect */}
      <div style={{
        position: "fixed", left: 0, right: 0, height: "2px",
        background: "linear-gradient(90deg, transparent, rgba(69,170,242,0.4), transparent)",
        zIndex: 1, animation: "scan 4s linear infinite", pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1400, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <div style={{ fontSize: 11, color: "#45AAF2", letterSpacing: 6, fontWeight: 700 }}>
                IRAQ COMPASS // GOVERNOR CONTROL CENTER
              </div>
              <div style={{ fontSize: 9, color: "#26de81", animation: "blink 1.2s infinite", letterSpacing: 2 }}>
                ● LIVE
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, color: "#fff" }}>
              {governors.length} GOVERNORS DASHBOARD
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, letterSpacing: 2, display: "flex", gap: "16px" }}>
              <span>BUSINESS INTELLIGENCE COLLECTION NETWORK</span>
              <Link to="/" style={{ color: "#45AAF2", textDecoration: "none", borderBottom: "1px solid #45AAF2" }}>
                [ RETURN TO PUBLIC DIRECTORY ]
              </Link>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#45AAF2", letterSpacing: 2, fontVariantNumeric: "tabular-nums" }}>
              {time.toLocaleTimeString("en-US", { hour12: false })}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2 }}>
              {time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "TOTAL RECORDS", value: totalRecords.toLocaleString(), sub: `${overallProgress}% of target`, color: "#45AAF2", icon: "◈" },
            { label: "ACTIVE GOVERNORS", value: `${activeCount} / ${governors.length}`, sub: `${governors.length - activeCount - errorCount} idle`, color: "#26de81", icon: "▶" },
            { label: "NEW TODAY", value: `+${newToday.toLocaleString()}`, sub: "across all categories", color: "#f7b731", icon: "↑" },
            { label: "ERRORS", value: errorCount, sub: `${governors.reduce((a,g)=>a+g.errors,0)} total issues`, color: "#FC5C65", icon: "⚠" },
          ].map((stat, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid rgba(255,255,255,0.07)`,
              borderTop: `2px solid ${stat.color}`,
              borderRadius: 8, padding: "20px 20px",
              animation: `slideIn 0.4s ease ${i * 0.1}s both`,
            }}>
              <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 3, marginBottom: 8 }}>
                {stat.icon} {stat.label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: stat.color, fontVariantNumeric: "tabular-nums" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Overall progress bar */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 8, padding: "16px 20px", marginBottom: 28,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, letterSpacing: 3, color: "#64748b" }}>◈ OVERALL NETWORK PROGRESS</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#45AAF2" }}>{overallProgress}% — {totalRecords.toLocaleString()} / {totalTarget.toLocaleString()} records</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 8, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4, width: `${overallProgress}%`,
              background: "linear-gradient(90deg, #45AAF2, #26de81)",
              transition: "width 1s ease",
              boxShadow: "0 0 10px rgba(69,170,242,0.5)",
            }} />
          </div>
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["all", "active", "idle", "error"].map(f => (
            <button key={f} className="filter-btn" onClick={() => setActiveFilter(f)} style={{
              background: activeFilter === f ? "rgba(69,170,242,0.15)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${activeFilter === f ? "#45AAF2" : "rgba(255,255,255,0.07)"}`,
              color: activeFilter === f ? "#45AAF2" : "#64748b",
              borderRadius: 4, padding: "6px 16px",
              fontSize: 11, letterSpacing: 2, fontFamily: "inherit", cursor: "pointer",
              opacity: 0.9, transition: "all 0.15s",
            }}>
              {f.toUpperCase()}
              {f !== "all" && <span style={{ marginLeft: 8, opacity: 0.7 }}>
                ({governors.filter(g => g.status === f).length})
              </span>}
            </button>
          ))}
        </div>

        {/* Governor Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {filtered.map((gov, i) => {
            const pct = gov.target > 0 ? Math.round((gov.records / gov.target) * 100) : 0;
            const sc = statusConfig[gov.status] || statusConfig.idle;
            const isSelected = selectedGov === gov.id;

            return (
              <div key={gov.id} className="gov-card"
                onClick={() => setSelectedGov(isSelected ? null : gov.id)}
                style={{
                  background: isSelected ? "rgba(69,170,242,0.06)" : "rgba(255,255,255,0.025)",
                  border: `1px solid ${isSelected ? "#45AAF2" : "rgba(255,255,255,0.07)"}`,
                  borderLeft: `3px solid ${gov.color}`,
                  borderRadius: 8, padding: "16px 18px",
                  animation: `slideIn 0.4s ease ${i * 0.04}s both`,
                }}>

                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{gov.emoji}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", letterSpacing: 1 }}>
                        {gov.name}
                      </div>
                      <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{gov.category}</div>
                    </div>
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 5,
                    background: sc.bg, border: `1px solid ${sc.border}`,
                    borderRadius: 4, padding: "3px 8px",
                  }}>
                    <div style={{ ...pulse(sc.dot), color: sc.dot }} />
                    <span style={{ fontSize: 9, letterSpacing: 2, color: sc.dot, fontWeight: 700 }}>{sc.label}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 10, color: "#64748b" }}>PROGRESS</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: gov.color }}>{pct}%</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 3, height: 5, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 3, width: `${pct}%`,
                      background: `linear-gradient(90deg, ${gov.color}88, ${gov.color})`,
                      boxShadow: `0 0 8px ${gov.color}66`,
                      transition: "width 1.2s ease",
                    }} />
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 4, padding: "7px 8px" }}>
                    <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 1, marginBottom: 2 }}>RECORDS</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#e2e8f0", fontVariantNumeric: "tabular-nums" }}>
                      {(animatedRecords[gov.id] || 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 4, padding: "7px 8px" }}>
                    <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 1, marginBottom: 2 }}>TARGET</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#64748b", fontVariantNumeric: "tabular-nums" }}>
                      {gov.target.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ background: gov.errors > 0 ? "rgba(252,92,101,0.08)" : "rgba(255,255,255,0.04)", borderRadius: 4, padding: "7px 8px" }}>
                    <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 1, marginBottom: 2 }}>ERRORS</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: gov.errors > 0 ? "#FC5C65" : "#26de81" }}>
                      {gov.errors}
                    </div>
                  </div>
                </div>

                {/* Last run */}
                <div style={{ marginTop: 10, fontSize: 10, color: "#475569", display: "flex", justifyContent: "space-between" }}>
                  <span>◷ LAST RUN: {gov.lastRun}</span>
                  <span style={{ color: "#334155" }}>→ NEXT: 6h</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enrichment Agent Control */}
        <AgentControlPanel />

        {/* Footer */}
        <div style={{
          marginTop: 28, padding: "14px 0 0",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex", justifyContent: "space-between",
          fontSize: 10, color: "#334155", letterSpacing: 2,
        }}>
          <span>IRAQ COMPASS // AI GOVERNOR NETWORK v1.0</span>
          <span>SUPABASE → VERCEL → GITHUB</span>
          <span>AUTO-REFRESH: 30s</span>
        </div>
      </div>
    </div>
  );
}
