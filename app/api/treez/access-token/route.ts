import { createServiceClient } from "@/lib/supabase/service";
import { getTreezAccessToken } from "@/lib/treez/token/get-token";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Verify the request is coming from the cron job
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  // Get the access token from the Treez API
  const accessToken = await getTreezAccessToken();

  // Save the access token to the database
  const supabase = createServiceClient();
  const { error } = await supabase.from("treez-auth-code").insert({
    code: accessToken.access_token,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Access token saved" }, { status: 200 });
}
