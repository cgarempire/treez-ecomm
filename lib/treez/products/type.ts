export interface SellableQuantityDetail {
  inventory_type: string;
  location: string;
  location_id: string;
  sellable_quantity: number;
}

export interface ProductConfigurableFields {
  name: string;
  uom: string;
  brand: string;
  size: string;
  amount: number;
  classification: string;
  total_mg_thc: number;
  total_mg_cbd: number;
  subtype: string;
  doses: number;
  mg_per_dose: number;
  total_flower_weight_g: number;
  external_id: string;
  total_concentrate_weight_g: number;
}

export interface Pricing {
  price_type: string;
  price_sell: number;
  discounted_price: number | null;
  discount_amount: number;
  discount_percent: number;
  tier_name: string | null;
}

export interface Attributes {
  general: string[];
  flavors: string[];
  effects: string[];
  ingredients: string[];
  internal_tags: string[];
}

export interface ECommerce {
  all_images: string[];
  primary_image: string;
  menu_title: string;
  product_description: string;
  minimum_visible_inventory_level: number;
  hide_from_menu: boolean;
}

export interface LabResultAmount {
  minimum_value: string;
  maximum_value: string;
}

export interface LabResult {
  result_type: string;
  amount: LabResultAmount;
  amount_type: string;
}

export interface TreezProduct {
  product_id: string;
  catalog_parent_id: string;
  product_status: string;
  last_updated_at: string;
  sellable_quantity: number;
  sellable_quantity_detail: SellableQuantityDetail[];
  category_type: string;
  slug: string;
  product_configurable_fields: ProductConfigurableFields;
  pricing: Pricing;
  discounts: unknown | null;
  attributes: Attributes;
  product_barcodes: unknown[];
  e_commerce: ECommerce;
  autoupdate_lab_results: boolean;
  lab_results: LabResult[];
  above_threshold: boolean;
  merged_from_product_ids: string[];
  external_references: unknown[];
}

export interface TreezProductsResponse {
  resultCode: "SUCCESS" | "FAIL";
  resultReason: string | null;
  resultDetail: string | null;
  data: {
    page_count: number; // number of products on the current page
    total_count: number; // total number of products
    product_list: TreezProduct[];
  } | null;
}
