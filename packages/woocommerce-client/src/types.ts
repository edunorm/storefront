export type WooCommerceRestApiVersion =
  | 'wc/v3'
  | 'wc/v2'
  | 'wc/v1'
  | 'wc-api/v3'
  | 'wc-api/v2'
  | 'wc-api/v1'

export interface IWooCommerceRestApiOptions {
  url: string
  consumerKey: string
  consumerSecret: string
  wpAPIPrefix?: string
  version?: WooCommerceRestApiVersion
  queryStringAuth?: boolean
  port?: number
  timeout?: number
}


