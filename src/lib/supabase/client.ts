import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase environment variables missing:");
  console.error("  - NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl);
  console.error(
    "  - NEXT_PUBLIC_SUPABASE_ANON_KEY:",
    supabaseAnonKey ? "present" : "missing",
  );
  throw new Error("Missing Supabase environment variables");
}

console.log("✅ Supabase client initialized");
console.log("  - URL:", supabaseUrl);

export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
);
