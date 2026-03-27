import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isConfigured =
  supabaseUrl.startsWith("http") && !supabaseUrl.includes("your-");

export function createClient() {
  if (!isConfigured) {
    // Return a mock-like client that won't crash
    return createBrowserClient(
      "https://placeholder.supabase.co",
      "placeholder-key"
    );
  }
  return createBrowserClient(supabaseUrl, supabaseKey);
}

export { isConfigured as isSupabaseConfigured };
