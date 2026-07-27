import { getShopifyConfig, getRevalidateSeconds, type ShopifyConfig } from "@/lib/shopify/config";

type GraphQLError = {
  message: string;
  path?: (string | number)[];
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

export class ShopifyError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ShopifyError";
  }
}

/**
 * Runs a GraphQL operation against the Storefront API.
 *
 * Responses are stored in Next's data cache (`force-cache` plus `revalidate`),
 * which applies to these POST requests because the caching options are set
 * explicitly. `tags` lets the webhook route drop specific entries the moment a
 * product changes in Shopify.
 *
 * Throws on transport, HTTP, and GraphQL errors rather than falling back to
 * placeholder data — a live store showing stale mock prices is worse than a
 * visible failure.
 */
export async function storefrontFetch<T>({
  query,
  variables = {},
  tags = [],
  config = getShopifyConfig(),
}: {
  query: string;
  variables?: Record<string, unknown>;
  tags?: string[];
  config?: ShopifyConfig | null;
}): Promise<T> {
  if (!config) {
    throw new ShopifyError(
      "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN.",
    );
  }

  let response: Response;
  try {
    response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": config.accessToken,
      },
      body: JSON.stringify({ query, variables }),
      cache: "force-cache",
      next: { revalidate: getRevalidateSeconds(), tags },
    });
  } catch (cause) {
    throw new ShopifyError(`Could not reach the Shopify Storefront API at ${config.endpoint}.`, {
      cause,
    });
  }

  if (!response.ok) {
    // 401/403 almost always means a bad or unpublished storefront token;
    // 404 means the domain or API version is wrong.
    const body = await response.text().catch(() => "");
    throw new ShopifyError(
      `Shopify Storefront API returned ${response.status} ${response.statusText}. ${body.slice(0, 500)}`,
    );
  }

  const payload = (await response.json()) as GraphQLResponse<T>;

  if (payload.errors?.length) {
    const details = payload.errors.map((error) => error.message).join("; ");
    throw new ShopifyError(`Shopify Storefront API error: ${details}`);
  }

  if (!payload.data) {
    throw new ShopifyError("Shopify Storefront API returned no data.");
  }

  return payload.data;
}
