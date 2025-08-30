# Zod validator middleware for Hono

[![codecov](https://codecov.io/github/honojs/middleware/graph/badge.svg?flag=zod-validator)](https://codecov.io/github/honojs/middleware)

The validator middleware using [Zod](https://zod.dev) for [Hono](https://honojs.dev) applications. You can write a schema with Zod and validate the incoming values.

## Usage

```ts
import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'

const schema = z.object({
  name: z.string(),
  age: z.number(),
})

app.post('/author', zValidator('json', schema), (c) => {
  const data = c.req.valid('json')
  return c.json({
    success: true,
    message: `${data.name} is ${data.age}`,
  })
})
```

Hook:

```ts
app.post(
  '/post',
  zValidator('json', schema, (result, c) => {
    if (!result.success) {
      return c.text('Invalid!', 400)
    }
  })
  //...
)
```

Throw Error:

throw a zod validate error instead of directly returning an error response.

```ts
// file: validator-wrapper.ts
import { ZodSchema } from 'zod'
import type { ValidationTargets } from 'hono'
import { zValidator as zv } from '@hono/zod-validator'

export const zValidator = <T extends ZodSchema, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T
) =>
  zv(target, schema, (result, c) => {
    if (!result.success) {
      throw new HTTPException(400, { cause: result.error })
    }
  })

// usage
import { zValidator } from './validator-wrapper'
app.post(
  '/post',
  zValidator('json', schema)
  //...
)
```

### Custom validation function

By default, this Validator validates values using `.safeParseAsync`.

```ts
await schema.safeParseAsync(value)
```

But, if you want to use the [`.passthrough`](https://zod.dev/?id=passthrough), you can specify your own function in `validationFunction`.

```ts
app.post(
  '/',
  zValidator('json', schema, undefined, {
    validationFunction: async (schema, value) => {
      return await schema.passthrough().safeParseAsync(value)
    },
  }),
  (c) => {
    // ...
  }
)
```

## Author

Yusuke Wada <https://github.com/yusukebe>

## License

MIT
