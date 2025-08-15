@edunorm/woocommerce-client

Usage:

```ts
import { WooFetchClient } from '@edunorm/woocommerce-client'

const client = new WooFetchClient({
  url: 'https://yourstore.example',
  consumerKey: 'ck_...',
  consumerSecret: 'cs_...'
})

const products = await client.get('products', { per_page: 10 })
```

