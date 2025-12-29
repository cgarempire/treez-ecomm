import { getMostRecentTreezAccessToken } from "@/lib/supabase/queries/get-token";
import { toSearchParams } from "@/lib/utils";
import { TreezProduct, TreezProductsResponse } from "./type";

type TreezProductsFilters = {
  page?: number;
  per_page?: number;
  category_type?: string;
  active?: boolean;
  id?: string;
  sellable_quantity_in_location?: string;
  sellable_quantity_in_type?: string;
  above_threshold?: boolean;
};

export type TreezProductsResult = {
  products: TreezProduct[];
  page: number;
  per_page: number;
  total_count: number;
  has_more: boolean;
};

/**
 * Fetches products from the Treez API with pagination support
 * @param filters - Filter options including page and per_page (defaults to 1000)
 * @returns Products and pagination metadata
 */
export async function getTreezProducts(
  filters?: TreezProductsFilters
): Promise<TreezProductsResult> {
  const TREEZ_CLIENT_ID = process.env.TREEZ_CLIENT_ID;
  const TREEZ_API_KEY = process.env.TREEZ_API_KEY;
  const TREEZ_DISPENSARY = process.env.TREEZ_DISPENSARY;

  if (!TREEZ_CLIENT_ID || !TREEZ_API_KEY || !TREEZ_DISPENSARY) {
    throw new Error(
      "TREEZ_CLIENT_ID, TREEZ_API_KEY, or TREEZ_DISPENSARY is not set"
    );
  }

  const perPage = filters?.per_page ?? 1000;
  const page = filters?.page ?? 1;

  const searchParams = toSearchParams({
    ...filters,
    page,
    per_page: perPage,
  });
  const accessToken = await getMostRecentTreezAccessToken();
  const response = await fetch(
    `https://api.treez.io/v2.0/dispensary/${TREEZ_DISPENSARY}/product/product_list?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        authorization: accessToken,
        client_id: TREEZ_CLIENT_ID,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get Treez products: ${response.statusText}`);
  }
  const treezData: TreezProductsResponse = await response.json();
  if (treezData.resultCode !== "SUCCESS" || !treezData.data) {
    throw new Error(`Failed to get Treez products: ${treezData.resultReason}`);
  }

  const { product_list, total_count } = treezData.data;
  const hasMore = page * perPage < total_count;

  return {
    products: product_list,
    page,
    per_page: perPage,
    total_count,
    has_more: hasMore,
  };
}

/**
 * Fetches all products from the Treez API by automatically paginating through all pages
 * @param filters - Filter options (per_page defaults to 1000)
 * @returns All products across all pages
 */
export async function getAllTreezProducts(
  filters?: Omit<TreezProductsFilters, "page">
): Promise<TreezProduct[]> {
  const perPage = filters?.per_page ?? 1000;
  const allProducts: TreezProduct[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const result = await getTreezProducts({
      ...filters,
      page,
      per_page: perPage,
    });
    allProducts.push(...result.products);
    hasMore = result.has_more;
    page++;
  }

  return allProducts;
}
