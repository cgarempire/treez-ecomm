import { createServiceClient } from "../service";

export async function getMostRecentTreezAccessToken() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("treez-auth-code")
    .select("code")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data.code;
}
