/*
  Fetch-based WooCommerce REST API client for Cloudflare Workers.
  This package imports types only from @woocommerce/woocommerce-rest-api to align shapes.
*/

// Re-export upstream option type for convenience (type-only; erased at runtime)
export type { IWooCommerceRestApiOptions } from "@woocommerce/woocommerce-rest-api";

export type ClientOptions = {
  url: string;
  consumerKey: string;
  consumerSecret: string;
  version?: string; // e.g. "wc/v3"
  wpAPIPrefix?: string; // default: "/wp-json/"
  queryStringAuth?: boolean; // default: false (we use HTTP Basic by default)
};

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export class WooFetchClient {
  private readonly baseUrl: string;
  private readonly consumerKey: string;
  private readonly consumerSecret: string;
  private readonly apiVersion: string;
  private readonly wpAPIPrefix: string;
  private readonly queryStringAuth: boolean;

  constructor(options: ClientOptions) {
    const {
      url,
      consumerKey,
      consumerSecret,
      version = "wc/v3",
      wpAPIPrefix = "/wp-json/",
      queryStringAuth = false,
    } = options;

    this.baseUrl = url.replace(/\/?$/, "");
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
    this.apiVersion = version.replace(/^\/+|\/+$/g, "");
    this.wpAPIPrefix = wpAPIPrefix;
    this.queryStringAuth = queryStringAuth;
  }

  private buildUrl(endpoint: string, params?: Record<string, unknown>): string {
    const endpointNormalized = endpoint.replace(/^\/+/, "");
    const url = new URL(
      `${this.baseUrl}${this.wpAPIPrefix}${this.apiVersion}/${endpointNormalized}`
    );

    if (this.queryStringAuth) {
      url.searchParams.set("consumer_key", this.consumerKey);
      url.searchParams.set("consumer_secret", this.consumerSecret);
    }

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          for (const item of value) url.searchParams.append(key, String(item));
        } else if (typeof value === "object") {
          url.searchParams.set(key, JSON.stringify(value));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  private buildAuthHeader(): string | undefined {
    if (this.queryStringAuth) return undefined;
    const token = btoa(`${this.consumerKey}:${this.consumerSecret}`);
    return `Basic ${token}`;
  }

  async request<TResponse>(
    method: HttpMethod,
    endpoint: string,
    options?: {
      params?: Record<string, unknown>;
      body?: unknown;
      headers?: Record<string, string>;
      signal?: AbortSignal;
    }
  ): Promise<TResponse> {
    const url = this.buildUrl(endpoint, options?.params);
    const headers = new Headers({ "Content-Type": "application/json" });
    const auth = this.buildAuthHeader();
    if (auth) headers.set("Authorization", auth);
    if (options?.headers)
      for (const [k, v] of Object.entries(options.headers)) headers.set(k, v);

    const response = await fetch(url, {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
      signal: options?.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `WooFetchClient request failed: ${response.status} ${response.statusText} ${text}`
      );
    }

    // Some WooCommerce endpoints return 204 on delete
    if (response.status === 204) return undefined as unknown as TResponse;

    const json = await response.json();
    return (json) as TResponse;
  }

  get<TResponse>(endpoint: string, params?: Record<string, unknown>) {
    return this.request<TResponse>("GET", endpoint, { params });
  }

  post<TResponse>(endpoint: string, body?: unknown, params?: Record<string, unknown>) {
    return this.request<TResponse>("POST", endpoint, { body, params });
  }

  put<TResponse>(endpoint: string, body?: unknown, params?: Record<string, unknown>) {
    return this.request<TResponse>("PUT", endpoint, { body, params });
  }

  delete<TResponse>(endpoint: string, params?: Record<string, unknown>) {
    return this.request<TResponse>("DELETE", endpoint, { params });
  }
}

export type WooClientLike = Pick<
  WooFetchClient,
  "get" | "post" | "put" | "delete" | "request"
>;


