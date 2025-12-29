import { Database } from "@/lib/supabase/database";
import { TreezProduct } from "./type";

type SupabaseProductInsert =
  Database["public"]["Tables"]["treez-product"]["Insert"];

/**
 * Converts a number to an integer, rounding if necessary.
 * Returns null if the value is null or undefined.
 */
function toInteger(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Math.round(value);
}

/**
 * Transforms a TreezProduct from the Treez API to a Supabase treez-product format
 */
export function transformTreezProductToSupabase(
  product: TreezProduct
): SupabaseProductInsert {
  return {
    treez_id: product.product_id,
    treez_updated_at: product.last_updated_at,
    name: product.product_configurable_fields.name,
    brand: product.product_configurable_fields.brand || null,
    size: product.product_configurable_fields.size || null,
    amount: product.product_configurable_fields.amount || null,
    classification: product.product_configurable_fields.classification || null,
    total_mg_thc: product.product_configurable_fields.total_mg_thc || null,
    total_mg_cbd: product.product_configurable_fields.total_mg_cbd || null,
    subtype: product.product_configurable_fields.subtype || null,
    doses: toInteger(product.product_configurable_fields.doses),
    mg_per_dose: product.product_configurable_fields.mg_per_dose || null,
    total_flower_weight_g:
      product.product_configurable_fields.total_flower_weight_g || null,
    total_concentrate_weight_g:
      product.product_configurable_fields.total_concentrate_weight_g || null,
    price_sell: product.pricing.price_sell || null,
    discounted_price: product.pricing.discounted_price || null,
    discount_amount: product.pricing.discount_amount || null,
    discount_percent: product.pricing.discount_percent || null,
    general:
      product.attributes.general.length > 0 ? product.attributes.general : null,
    flavors:
      product.attributes.flavors.length > 0 ? product.attributes.flavors : null,
    effects:
      product.attributes.effects.length > 0 ? product.attributes.effects : null,
    image_url: product.e_commerce.primary_image || null,
    description: product.e_commerce.product_description || null,
    minimum_visible_inventory_level: toInteger(
      product.e_commerce.minimum_visible_inventory_level
    ),
    hide_from_menu: product.e_commerce.hide_from_menu,
    sellable_quantity: toInteger(product.sellable_quantity) ?? 0,
    category_type: product.category_type || null,
    slug: product.slug,
    product_status: product.product_status || null,
    above_threshold: product.above_threshold,
  };
}
