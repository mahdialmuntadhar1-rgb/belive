export class AgentOrchestrator {
  private agents: { id: string; name: string; status: string }[] = [
    { id: "gov-01", name: "Gov-01 Restaurants", status: "idle" },
  ];

  getAgents() {
    return this.agents;
  }

  async startAll() {
    console.log('[Orchestrator] Starting all agents...');
    this.agents = this.agents.map(a => ({ ...a, status: 'running' }));
    return { status: 'started', agents: this.agents };
  }

  async stopAll() {
    console.log('[Orchestrator] Stopping all agents...');
    this.agents = this.agents.map(a => ({ ...a, status: 'stopped' }));
    return { status: 'stopped', agents: this.agents };
  }
}
