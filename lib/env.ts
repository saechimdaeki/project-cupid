export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  );
}

export function assertSupabaseEnv() {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase environment variables are missing.");
  }
}
