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
    
    // Log sample product data to debug
    if (treezProducts.length > 0) {
      console.log("[sync-products] Sample Treez product:", JSON.stringify(treezProducts[0], null, 2));
    }

    // Transform Treez products to Supabase format
    console.log("[sync-products] Transforming products to Supabase format...");
    const supabaseProducts = treezProducts.map(transformTreezProductToSupabase);
    console.log(`[sync-products] Transformed ${supabaseProducts.length} products`);
    
    // Log sample transformed product to debug
    if (supabaseProducts.length > 0) {
      console.log("[sync-products] Sample transformed product:", JSON.stringify(supabaseProducts[0], null, 2));
    }

    // Save the products to the database
    console.log("[sync-products] Initializing Supabase client...");
    const supabase = createServiceClient();
    console.log("[sync-products] Upserting products to database...");
    
    // Try to identify problematic products by checking for decimal values in integer fields
    const integerFields = ['doses', 'minimum_visible_inventory_level', 'sellable_quantity'];
    for (let i = 0; i < supabaseProducts.length; i++) {
      const product = supabaseProducts[i];
      for (const field of integerFields) {
        const value = product[field as keyof typeof product];
        if (value !== null && value !== undefined && typeof value === 'number' && !Number.isInteger(value)) {
          console.warn(`[sync-products] Product ${i} (treez_id: ${product.treez_id}) has non-integer value in ${field}: ${value}`);
        }
      }
    }
    
    const { error } = await supabase
      .from("treez-product")
      .upsert(supabaseProducts, {
        onConflict: "treez_id",
      });

    if (error) {
      console.error("[sync-products] Database error:", error);
      console.error("[sync-products] Error details:", JSON.stringify(error, null, 2));
      
      // Try to identify which product caused the error by checking values
      console.error("[sync-products] Checking for problematic values...");
      for (let i = 0; i < supabaseProducts.length; i++) {
        const product = supabaseProducts[i];
        const productStr = JSON.stringify(product);
        if (productStr.includes('1.5')) {
          console.error(`[sync-products] Found product with 1.5 value at index ${i}:`, JSON.stringify(product, null, 2));
        }
      }
      
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
