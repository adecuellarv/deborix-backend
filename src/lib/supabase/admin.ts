import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type SupabaseEnvironmentVariable = "SUPABASE_URL" | "SUPABASE_SECRET_KEY";

const getRequiredEnvironmentVariable = (name: SupabaseEnvironmentVariable) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return value;
};

export const createSupabaseAdmin = () =>
  createClient<Database>(
    getRequiredEnvironmentVariable("SUPABASE_URL"),
    getRequiredEnvironmentVariable("SUPABASE_SECRET_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
