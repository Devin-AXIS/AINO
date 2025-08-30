# Zod to OpenAPI

[![npm version](https://img.shields.io/npm/v/@asteasolutions/zod-to-openapi)](https://www.npmjs.com/package/@asteasolutions/zod-to-openapi)
[![npm downloads](https://img.shields.io/npm/dm/@asteasolutions/zod-to-openapi)](https://www.npmjs.com/package/@asteasolutions/zod-to-openapi)

> [!IMPORTANT]
> **For Zod v3 support, please use the v7.3.4 version. However keep in mind that we do not intend to actively support that version going forward** Install with: `npm install @asteasolutions/zod-to-openapi@7.3.4`

A library that uses [zod schemas](https://github.com/colinhacks/zod) to generate an Open API Swagger documentation.

1. [Purpose and quick example](#purpose-and-quick-example)
2. [Usage](#usage)
   1. [Installation](#installation)
   2. [The `openapi` method](#the-openapi-method)
   3. [The Registry](#the-registry)
   4. [The Generator](#the-generator)
   5. [Defining schemas](#defining-schemas)
   6. [Defining routes & webhooks](#defining-routes--webhooks)
   7. [Defining custom components](#defining-custom-components)
   8. [A full example](#a-full-example)
   9. [Adding it as part of your build](#adding-it-as-part-of-your-build)
   10. [Using schemas vs a registry](#using-schemas-vs-a-registry)
   11. [Generation options](#generation-options)
3. [Zod schema types](#zod-schema-types)
   1. [Supported types](#supported-types)
   2. [Unsupported types](#unsupported-types)
4. [Technologies](#technologies)

We keep a changelog as part of the [GitHub releases](https://github.com/asteasolutions/zod-to-openapi/releases).

## Purpose and quick example

We at [Astea Solutions](https://asteasolutions.com/) made this library because we use [zod](https://github.com/colinhacks/zod) for validation in our APIs and are tired of the duplication to also support a separate OpenAPI definition that must be kept in sync. Using `zod-to-openapi`, we generate OpenAPI definitions directly from our zod schemas, thus having a single source of truth.

Simply put, it turns this:

```ts
const UserSchema = z
  .object({
    id: z.string().openapi({ example: '1212121' }),
    name: z.string().openapi({ example: 'John Doe' }),
    age: z.number().openapi({ example: 42 }),
  })
  .openapi('User');

registry.registerPath({
  method: 'get',
  path: '/users/{id}',
  summary: 'Get a single user',
  request: {
    params: z.object({ id: z.string() }),
  },

  responses: {
    200: {
      description: 'Object with user data.',
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
    },
  },
});
```

into this:

```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          example: '1212121'
        name:
          type: string
          example: John Doe
        age:
          type: number
          example: 42
      required:
        - id
        - name
        - age

/users/{id}:
  get:
    summary: Get a single user
    parameters:
      - in: path
        name: id
        schema:
          type: string
        required: true
    responses:
      '200':
        description: Object with user data
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
```

and you can still use `UserSchema` and the `request.params` object to validate the input of your API.

## Usage

### Installation

```shell
npm install @asteasolutions/zod-to-openapi
# or
yarn add @asteasolutions/zod-to-openapi
```

### The `openapi` method

To keep openapi definitions natural, we add an `openapi` method to all Zod objects. Its idea is to provide a convenient way to provide OpenApi specific data.
It has three overloads:

1. `.openapi({ [key]: value })` - this way we can specify any OpenApi fields. For example `z.number().openapi({ example: 3 })` would add `example: 3` to the generated schema.
2. `.openapi("<schema-name>")` - this way we specify that the underlying zod schema should be "registered" i.e added into `components/schemas` with the provided `<schema-name>`
3. `.openapi("<schema-name>", { [key]: value })` - this unites the two use cases above so that we can specify both a registration `<schema-name>` and additional metadata

For this to work, you need to call `extendZodWithOpenApi` once in your project.

This should be done only once in a common-entrypoint file of your project (for example an `index.ts`/`app.ts`). If you're using tree-shaking with Webpack, mark that file as having side-effects.

It can be bit tricky to achieve this in your codebase, because *require* is synchronous and *import* is a async.

#### Using zod's .meta
Starting from v8 (and zod v4) you can also use zod's .meta to provide metadata and we will read it accordingly.

With zod's new option for generating JSON schemas and maintaining registries we've added a pretty much seamless support for all metadata information coming from `.meta` calls as if that was metadata passed into `.openapi`.

So the following 2 schemas produce exactly the same results:
```ts
const schema = z
  .string()
  .openapi('Schema', { description: 'Name of the user', example: 'Test' });

const schema2 = z
  .string()
  .meta({ id: 'Schema2', description: 'Name of the user', example: 'Test' });
```

> Note: This also means that you unless you are using some of our more complicated scenarios you could even generate a schema without using `extendZodWithOpenApi` in your codebase and only rely on `.meta` to provide additional metadata information and schema names (using the `id` property).

#### Scenarios that require using `extendZodWithOpenApi` and `.openapi`
1. When extending registered schemas that are both registered and want the extended one to use `anyOf` i.e:

```ts
const schema = z.object({ name: z.string() }).openapi('Schema');

const schema2 = schema.extend({ age: z.number() }).openapi('Schema2'); // this one would have anyOf and a reference to the first one
```
2. Defining parameter metadata. So for example when doing:
```ts
registry.registerPath({
  // ...
  request: {
    query: z.object({
      name: z.string().openapi({
        description: 'Schema level description',
        param: { description: 'Param level description' },
      }),
    }),
  },
});
```

the result would be:
```ts
  "parameters": [
      {
        "schema": {
          "type": "string",
          "description": "Schema level description" // comes directly from description
        },
        "required": true,
        "description": "Param level description", // comes from param.description
        "name": "name",
        "in": "query"
      }
  ],
```


### The basic idea

```ts
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

// We can now use `.openapi()` to specify OpenAPI metadata
z.string().openapi({ description: 'Some string' });
```

### Example 1: Calling the openapi-extension using tsx

```
//zod-extend.ts

import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

// package.json

  "scripts": {
    "start": "tsx --import ./zod-extend.ts ./index.ts",
```

### Example 2 - require-syntax

```
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

const { startServer } = require('./server/start');
startServer();
```


### The Registry

The `OpenAPIRegistry` is a utility that can be used to collect definitions which would later be passed to a `OpenApiGeneratorV3` or `OpenApiGeneratorV31` instance.

```ts
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';

const registry = new OpenAPIRegistry();

// Register definitions here

const generator = new OpenApiGeneratorV3(registry.definitions);

return generator.generateComponents();
```

### The Generator

There are two generators that can be used - `OpenApiGeneratorV3` and `OpenApiGeneratorV31`. They share the same interface but internally generate schemas that correctly follow the data format for the specific Open API version - `3.0.x` or `3.1.x`. The Open API version affects how some components are generated.

For example: changing the generator from `OpenApiGeneratorV3` to `OpenApiGeneratorV31` would result in following differences:

```ts
z.string().nullable().openapi({refId: 'name'});
```

```yml
# 3.1.0
# nullable is invalid in 3.1.0 but type arrays are invalid in previous versions
name:
  type:
    - 'string'
    - 'null'

# 3.0.0
name:
  type: 'string'
  nullable: true
```

Both generators take a single argument in their constructors - an array of definitions - i.e results from the registry or regular zod schemas.

The public methods of both generators are as follows:

`generateComponents` will generate only the `/components` section of an OpenAPI document (e.g. only `schemas` and `parameters`), not generating actual routes.

`generateDocument` will generate the whole OpenAPI document.

### Defining schemas

An OpenApi schema should be registered by using the `.openapi` method and providing a name:

```ts
const UserSchema = z
  .object({
    id: z.string().openapi({ example: '1212121' }),
    name: z.string().openapi({ example: 'John Doe' }),
    age: z.number().openapi({ example: 42 }),
  })
  .openapi('User');

const generator = new OpenApiGeneratorV3([UserSchema]);
```

The same can be achieved by using the `register` method of an `OpenAPIRegistry` instance. For more check the ["Using schemas vs a registry"](#using-schemas-vs-a-registry) section

```ts
const UserSchema = registry.register(
  'User',
  z.object({
    id: z.string().openapi({ example: '1212121' }),
    name: z.string().openapi({ example: 'John Doe' }),
    age: z.number().openapi({ example: 42 }),
  })
);

const generator = new OpenApiGeneratorV3(registry.definitions);
```

If run now, `generator.generateComponents()` will generate the following structure:

```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          example: '1212121'
        name:
          type: string
          example: John Doe
        age:
          type: number
          example: 42
      required:
        - id
        - name
        - age
```

The key for the schema in the output is the first argument passed to `.openapi` method (or the `.register`) - in this case: `User`.

Note that `generateComponents` does not return YAML but a JS object - you can then serialize that object into YAML or JSON depending on your use-case.

The resulting schema can then be referenced by using `$ref: #/components/schemas/User` in an existing OpenAPI JSON. This will be done automatically for Routes defined through the registry.

Note by default a Zod object will result in `"additionalProperties": true` as per the Open API spec unless using `strict` or `catchall`, this is in contrast to normal Zod object usage where `zod.parse` is used.

### Defining routes & webhooks

#### Registering a path or webhook

An OpenAPI path is registered using the `registerPath` method of an `OpenAPIRegistry` instance. An OpenAPI webhook is registered using the `registerWebhook` method and takes the same parameters as `registerPath`.

```ts
registry.registerPath({
  method: 'get',
  path: '/users/{id}',
  description: 'Get user data by its id',
  summary: 'Get a single user',
  request: {
    params: z.object({
      id: z.string().openapi({ example: '1212121' }),
    }),
  },
  responses: {
    200: {
      description: 'Object with user data.',
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
    },
    204: {
      description: 'No content - successful operation',
    },
  },
});
```

The YAML equivalent of the schema above would be:

```yaml
'/users/{id}':
  get:
    description: Get user data by its id
    summary: Get a single user
    parameters:
      - in: path
        name: id
        schema:
          type: string
          example: '1212121'
        required: true
    responses:
      '200':
        description: Object with user data.
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
      '204':
        description: No content - successful operation
```

The library specific properties for `registerPath` are `method`, `path`, `request` and `responses`. Everything else gets directly appended to the path definition.

- `method` - One of `get`, `post`, `put`, `delete` and `patch`;
- `path` - a string - being the path of the endpoint;
- `request` - an optional object with optional `body`, `params`, `query` and `headers` keys,
  - `query`, `params` - being instances of `ZodObject`
  - `body` - an object with a `description` and a `content` record where:
    - the key is a `mediaType` string like `application/json`
    - and the value is an object with a `schema` of any `zod` type
  - `headers` - instances of `ZodObject` or an array of any `zod` instances
- `responses` - an object where the key is the status code or `default` and the value is an object with a `description` and a `content` record where:
  - the key is a `mediaType` string like `application/json`
  - and the value is an object with a `schema` of any `zod` type

#### Defining route parameters

If you don't want to inline all parameter definitions, you can define them separately with `registerParameter` and then reference them:

```ts
const UserIdParam = registry.registerParameter(
  'UserId',
  z.string().openapi({
    param: {
      name: 'id',
      in: 'path',
    },
    example: '1212121',
  })
);

registry.registerPath({
  ...
  request: {
    params: z.object({
      id: UserIdParam
    }),
  },
  responses: ...
});
```

The YAML equivalent would be:

```yaml
components:
  parameters:
    UserId:
      in: path
      name: id
      schema:
        type: string
        example: '1212121'
      required: true

'/users/{id}':
  get:
    ...
    parameters:
      - $ref: '#/components/parameters/UserId'
    responses: ...
```

Note: In order to define properties that apply to the parameter itself, use the `param` property of `.openapi`. Any properties provided outside of `param` would be applied to the schema for this parameter.

#### Generating the full document

A full OpenAPI document can be generated using the `generateDocument` method of an `OpenApiGeneratorV3` or `OpenApiGeneratorV31` instance. It takes one argument - the document config. It may look something like this:

```ts
return generator.generateDocument({
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'My API',
    description: 'This is the API',
  },
  servers: [{ url: 'v1' }],
});
```

### Defining custom components

You can define components that are not OpenAPI schemas, including security schemes, response headers and others. See [this test file](spec/custom-components.spec.ts) for examples.

### A full example

A full example code can be found [here](./example/index.ts). And the YAML representation of its result - [here](./example/openapi-docs.yml)

### Using schemas vs a registry

Schemas are automatically being registered when referenced. That means that if you have a schema like:

```ts
const schema = z.object({ key: z.string().openapi('Test') }).openapi('Object');
```

you'd have the following resulting structure:

```yaml
components:
  schemas:
    Test:
      type: 'string',
    Object:
      type: 'object',
      properties:
        key:
          $ref: '#/components/schemas/Test'
      required: ['key']
```

This does not require any usages of an `OpenAPIRegistry` instance.

However the same output can be achieved with the following code:

```ts
const registry = new OpenAPIRegistry();
const schema = registry.register(
  'Object',
  z.object({ key: z.string().openapi('Test') })
);
```

The main benefit of the `.registry` method is that you can use the registry as a "collection" where you would put all such schemas.

With `.openapi`:

```ts
// file1.ts
export const Schema1 = ...

// file2.ts
export const Schema2 = ...

new OpenApiGeneratorV3([Schema1, Schema2])
```

Adding a `NewSchema` into `file3.ts` would require you to pass that schema manually into the array of the generator constructor.
Note: If a `NewSchema` is referenced by any other schemas or a route/webhook definition it would still appear in the resulting document.

With `registry.register`:

```ts
// registry.ts
export const registry = new OpenAPIRegistry()

// file1.ts
export const Schema1 = registry.register(...)

// file2.ts
export const Schema2 = registry.register(...)

new OpenApiGeneratorV3(registry.definitions)
```

Adding a `NewSchema` into `file3.ts` and using `registry.register` would NOT require you to do any changes to the generator constructor.

#### Conclusion

Using an `OpenAPIRegistry` instance is mostly useful if you would want your resulting document to contain unreferenced schemas.
That can sometimes be useful - for example when you are slowly integrating an already existing documentation with `@asteasolutions/zod-to-openapi` and you are migrating small pieces at a time. Those pieces can then be referenced directly from an existing documentation.

#### Adding it as part of your build

In a file inside your project you can have a file like so:

```ts
export const registry = new OpenAPIRegistry();

export function generateOpenAPI() {
  const config = {...}; // your config comes here

  return new OpenApiGeneratorV3(registry.definitions).generateDocument(config);
}
```

You then use the exported `registry` object to register all schemas, parameters and routes where appropriate.

Then you can create a script that executes the exported `generateOpenAPI` function. This script can be executed as a part of your build step so that it can write the result to some file like `openapi-docs.json`.

### Generation options

Schema generation can be altered in certain scenarios. This can be done by either:

#### Passing a global configuration as second argument for the generator:

```ts
const generator = new OpenApiGeneratorV3(registry.definitions, options);
```


There list of currently supported global options is:
```ts
const options = {
  unionPreferredType: 'oneOf' | 'anyOf' // configures whether oneOf or anyOf is used when generating a schema for a zod union
  sortComponents?: 'alphabetically'; // if sortComponents is passed with the value 'alphabetically' it would sort all schemas and parameters.
                                     // If not - they would appear in the order they were defined
}
```


#### Passing options for a one-off usage for a single schema:

```ts
// Note it is valid for metadata to be undefined in both of the bellow cases:

schema.openapi('Schema', metadata, options); // when registering a schema or
schema.openapi(metadata, options) // when simply adding some metadata to it
```

There list of currently supported one-off options is:
```ts
const options = {
  unionPreferredType: 'oneOf' | 'anyOf' // configures whether oneOf or anyOf is used when generating a schema for a zod union
}
```

## Zod schema types

### Supported types

The list of all supported types as of now is:

- `ZodAny`
- `ZodArray`
- `ZodBigInt`
- `ZodBoolean`
- `ZodDate`
- `ZodDefault`
- `ZodDiscriminatedUnion`
  - including `discriminator` mapping when all Zod objects in the union are registered with `.register()` or contain a `refId`.
- `ZodEffects`
- `ZodEnum`
- `ZodIntersection`
- `ZodLiteral`
- `ZodNativeEnum`
- `ZodNullable`
- `ZodNumber`
  - including `z.number().int()` being inferred as `type: 'integer'`
- `ZodObject`
  - including `.catchall` resulting in the respective `additionalProperties` schema
  - also including `strict` resulting in the respective `additionalProperties` schema
- `ZodOptional`
- `ZodPipeline`
- `ZodReadonly`
- `ZodRecord`
- `ZodString`
  - adding `format` for:
    - `.emoji()`
    - `.cuid()`
    - `.cuid2()`
    - `.ulid()`
    - `.ip()`
    - `.date()`
    - `.datetime()`
    - `.uuid()`
    - `.email()`
    - `.url()`
  - adding `pattern` for `.regex()` is also supported


    ${'emoji'}    | ${z.string().emoji()}    | ${'emoji'}
    ${'cuid'}     | ${z.string().cuid()}     | ${'cuid'}
    ${'cuid2'}    | ${z.string().cuid2()}    | ${'cuid2'}
    ${'ulid'}     | ${z.string().ulid()}     | ${'ulid'}
    ${'ip'}       | ${z.string().ip()}       | ${'ip'}

- `ZodTuple`
- `ZodUnion`
- `ZodUnknown`

Extending an instance of `ZodObject` is also supported and results in an OpenApi definition with `allOf`

### Unsupported types

In case you try to create an OpenAPI schema from a zod schema that is not one of the aforementioned types then you'd receive an `UnknownZodTypeError`.

You can still register such schemas on your own by providing a `type` via the `.openapi` method. In case you think that the desired behavior can be achieved automatically do not hesitate to reach out to us by describing your case via Github Issues.

#### Known issues

1. `z.nullable(schema)` [does not generate a $ref for underlying registered schemas](https://github.com/asteasolutions/zod-to-openapi/issues/141).
  - This is an implementation limitation.
  - However you can simply use `schema.nullable()` which has the exact same effect `zod` wise but it is also fully supported on our end.

## Technologies

- [Typescript](https://www.typescriptlang.org/)
- [Zod 4.x](https://github.com/colinhacks/zod)
- [OpenAPI 3.x TS](https://github.com/metadevpro/openapi3-ts)
