import { Hono } from 'hono'
import { WooFetchClient } from '@edunorm/woocommerce-client'

type CloudflareBindings = {
  WOO_URL: string
  WOO_CONSUMER_KEY: string
  WOO_CONSUMER_SECRET: string
}

const app = new Hono<{ Bindings: CloudflareBindings }>()
const api = new Hono<{ Bindings: CloudflareBindings }>()

api.get('/', (c) => c.text('Hello Hono!'))

api.get('/products', async (c) => {
  const client = new WooFetchClient({
    url: c.env.WOO_URL,
    consumerKey: c.env.WOO_CONSUMER_KEY,
    consumerSecret: c.env.WOO_CONSUMER_SECRET,
  })

  const products = await client.get<unknown[]>('products', { per_page: 5 })
  return c.json(products)
})

app.route('/woo-api', api)

export default app
