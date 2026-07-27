/**
 * GraphQL documents for the Storefront API.
 *
 * Field selections are checked against the schema shipped with
 * `@shopify/hydrogen-react` for the API version in `config.ts`. Notably
 * `ProductOption.values` is deprecated, so options read through `optionValues`.
 */

const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    vendor
    productType
    tags
    descriptionHtml
    availableForSale
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 12) {
      nodes {
        url
        altText
      }
    }
    options {
      name
      optionValues {
        name
      }
    }
    variants(first: 250) {
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
    metafields(identifiers: $specsIdentifiers) {
      namespace
      key
      value
      type
    }
  }
`;

/** One page of the catalog. `getProducts` follows `pageInfo` to the end. */
export const PRODUCTS_QUERY = /* GraphQL */ `
  query Products($first: Int!, $after: String, $specsIdentifiers: [HasMetafieldsIdentifier!]!) {
    products(first: $first, after: $after, sortKey: TITLE) {
      nodes {
        ...ProductFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const PRODUCT_QUERY = /* GraphQL */ `
  query Product($handle: String!, $specsIdentifiers: [HasMetafieldsIdentifier!]!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
  ${PRODUCT_FRAGMENT}
`;

/** Cheap call used to verify credentials without pulling the catalog. */
export const SHOP_QUERY = /* GraphQL */ `
  query Shop {
    shop {
      name
      primaryDomain {
        url
      }
    }
  }
`;
