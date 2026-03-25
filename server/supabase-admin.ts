import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { loadConfig } from "./config.js";

dotenv.config();

const config = loadConfig();

export const supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
