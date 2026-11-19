// APP_ENV decides the backend. Only exact "local" and "preview" use the mock;
// anything else, including a missing value, uses Supabase.
export function pickAuthBackend(
  appEnv: string | undefined,
): "mock" | "supabase" {
  return appEnv === "local" || appEnv === "preview" ? "mock" : "supabase";
}
