import { createServiceClient } from "@/lib/supabase/service";
import { getAllTreezProducts } from "@/lib/treez/products/get-products";
import { transformTreezProductToSupabase } from "@/lib/treez/products/transform-product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Verify the request is coming from the cron job
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    // Get all products from the Treez API (handles pagination automatically)
    const treezProducts = await getAllTreezProducts();

    // Transform Treez products to Supabase format
    const supabaseProducts = treezProducts.map(transformTreezProductToSupabase);

    // Save the products to the database
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("treez-product")
      .upsert(supabaseProducts, {
        onConflict: "treez_id",
      });

    if (error) {
      console.error("[sync-products] Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "Products synced",
        count: supabaseProducts.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[sync-products] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
