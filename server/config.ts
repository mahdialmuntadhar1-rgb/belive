export type AppConfig = {
  nodeEnv: "development" | "test" | "production";
  port: number;
  demoMode: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  googlePlacesApiKey?: string;
  geminiApiKey?: string;
};

function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const nodeEnv = (env.NODE_ENV as AppConfig["nodeEnv"]) || "development";
  const port = Number(env.PORT || 3000);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: ${env.PORT}`);
  }

  return {
    nodeEnv,
    port,
    demoMode: parseBoolean(env.DEMO_MODE, false),
    supabaseUrl: requireEnv("VITE_SUPABASE_URL", env.VITE_SUPABASE_URL),
    supabaseAnonKey: requireEnv("VITE_SUPABASE_ANON_KEY", env.VITE_SUPABASE_ANON_KEY),
    supabaseServiceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY", env.SUPABASE_SERVICE_ROLE_KEY),
    googlePlacesApiKey: env.GOOGLE_PLACES_API_KEY,
    geminiApiKey: env.GEMINI_API_KEY,
  };
}
