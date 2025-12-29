import { createServiceClient } from "@/lib/supabase/service";
import { getAllTreezProducts } from "@/lib/treez/products/get-products";
import { transformTreezProductToSupabase } from "@/lib/treez/products/transform-product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("[sync-products] Starting sync job");
  
  // Verify the request is coming from the cron job
  const authHeader = request.headers.get("authorization");
  console.log("[sync-products] Auth header present:", !!authHeader);
  console.log("[sync-products] CRON_SECRET set:", !!process.env.CRON_SECRET);
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log("[sync-products] Authorization failed");
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  console.log("[sync-products] Authorization successful");

  try {
    // Get all products from the Treez API (handles pagination automatically)
    console.log("[sync-products] Fetching products from Treez API...");
    const treezProducts = await getAllTreezProducts();
    console.log(`[sync-products] Fetched ${treezProducts.length} products from Treez API`);

    // Transform Treez products to Supabase format
    console.log("[sync-products] Transforming products to Supabase format...");
    const supabaseProducts = treezProducts.map(transformTreezProductToSupabase);
    console.log(`[sync-products] Transformed ${supabaseProducts.length} products`);

    // Save the products to the database
    console.log("[sync-products] Initializing Supabase client...");
    const supabase = createServiceClient();
    console.log("[sync-products] Upserting products to database...");
    
    const { error } = await supabase
      .from("treez-product")
      .upsert(supabaseProducts, {
        onConflict: "treez_id",
      });

    if (error) {
      console.error("[sync-products] Database error:", error);
      console.error("[sync-products] Error details:", JSON.stringify(error, null, 2));
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`[sync-products] Successfully synced ${supabaseProducts.length} products`);
    return NextResponse.json(
      {
        message: "Products synced",
        count: supabaseProducts.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[sync-products] Unexpected error:", error);
    console.error("[sync-products] Error stack:", error instanceof Error ? error.stack : "No stack trace");
    console.error("[sync-products] Error details:", JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
