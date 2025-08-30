# @hono/zod-openapi

## 1.1.0

### Minor Changes

- [#1353](https://github.com/honojs/middleware/pull/1353) [`f42a557f47f6e9cba1cbc40ad0cd8c0d798146c0`](https://github.com/honojs/middleware/commit/f42a557f47f6e9cba1cbc40ad0cd8c0d798146c0) Thanks [@yumuranaoki](https://github.com/yumuranaoki)! - Add optional generator options parameter to doc middleware

## 1.0.2

### Patch Changes

- [#1320](https://github.com/honojs/middleware/pull/1320) [`e835cf6183fb4717cfdbe156d9b3d423625a0e15`](https://github.com/honojs/middleware/commit/e835cf6183fb4717cfdbe156d9b3d423625a0e15) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: correct importing `zod`

## 1.0.1

### Patch Changes

- Updated dependencies [[`c6a16ab7aa8fba2403d4294e7673f96796020c65`](https://github.com/honojs/middleware/commit/c6a16ab7aa8fba2403d4294e7673f96796020c65)]:
  - @hono/zod-validator@0.7.2

## 1.0.0

### Major Changes

- [#1223](https://github.com/honojs/middleware/pull/1223) [`845e336ff41d29fa74ec3cf84afc16f5ac0c2c77`](https://github.com/honojs/middleware/commit/845e336ff41d29fa74ec3cf84afc16f5ac0c2c77) Thanks [@yusukebe](https://github.com/yusukebe)! - feat: support Zod v4

  Zod OpenAPI has been migrated the Zod version from v3 to v4. As a result, the `zod` in `peerDependencies` has been updated to 4.0.0 or higher.

  Although this is not a breaking change, it is a major change, so it is considered a major version upgrade.

## 0.19.10

### Patch Changes

- Updated dependencies [[`9f6278f51c846a171a9baa6335fb8fbd9b42cb1c`](https://github.com/honojs/middleware/commit/9f6278f51c846a171a9baa6335fb8fbd9b42cb1c), [`9f6278f51c846a171a9baa6335fb8fbd9b42cb1c`](https://github.com/honojs/middleware/commit/9f6278f51c846a171a9baa6335fb8fbd9b42cb1c)]:
  - @hono/zod-validator@0.7.1

## 0.19.9

### Patch Changes

- [#1217](https://github.com/honojs/middleware/pull/1217) [`9f64138406a2c513462f2a4873b2ef8be36df9d8`](https://github.com/honojs/middleware/commit/9f64138406a2c513462f2a4873b2ef8be36df9d8) Thanks [@BarryThePenguin](https://github.com/BarryThePenguin)! - Add explicit return types

## 0.19.8

### Patch Changes

- Updated dependencies [[`5c3f61f889f5d96f2ff4a79c9df89c03e25dd7f3`](https://github.com/honojs/middleware/commit/5c3f61f889f5d96f2ff4a79c9df89c03e25dd7f3)]:
  - @hono/zod-validator@0.7.0

## 0.19.7

### Patch Changes

- [#1173](https://github.com/honojs/middleware/pull/1173) [`a62b59f4505d10f41523a36ad7c02776f9e1cb01`](https://github.com/honojs/middleware/commit/a62b59f4505d10f41523a36ad7c02776f9e1cb01) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: ignore the type error from Zod Validator

- Updated dependencies [[`a62b59f4505d10f41523a36ad7c02776f9e1cb01`](https://github.com/honojs/middleware/commit/a62b59f4505d10f41523a36ad7c02776f9e1cb01)]:
  - @hono/zod-validator@0.6.0

## 0.19.6

### Patch Changes

- Updated dependencies [[`8ed99d9d791ed6bd8b897c705289b0464947e632`](https://github.com/honojs/middleware/commit/8ed99d9d791ed6bd8b897c705289b0464947e632)]:
  - @hono/zod-validator@0.5.0

## 0.19.5

### Patch Changes

- [#1127](https://github.com/honojs/middleware/pull/1127) [`63a9dff2b925a09e8597f327f954f332c3b59b14`](https://github.com/honojs/middleware/commit/63a9dff2b925a09e8597f327f954f332c3b59b14) Thanks [@sigmachirality](https://github.com/sigmachirality)! - chore: lock zod-to-openapi to `^7.3.0` to fix `z.custom`

## 0.19.4

### Patch Changes

- [#1111](https://github.com/honojs/middleware/pull/1111) [`ad4622a8536c8ef9c5feec2e447f36c2629ecbca`](https://github.com/honojs/middleware/commit/ad4622a8536c8ef9c5feec2e447f36c2629ecbca) Thanks [@BarryThePenguin](https://github.com/BarryThePenguin)! - Republish v0.19.3 without workspace reference

## 0.19.3

### Patch Changes

- [#1106](https://github.com/honojs/middleware/pull/1106) [`448a8fc687cca2bcab2353ea4237f1293706d5e2`](https://github.com/honojs/middleware/commit/448a8fc687cca2bcab2353ea4237f1293706d5e2) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: infer Env correctly if the middleware is `[]`

## 0.19.2

### Patch Changes

- [#995](https://github.com/honojs/middleware/pull/995) [`c279ba2bc5204b1b9effc92c45f129904ea67795`](https://github.com/honojs/middleware/commit/c279ba2bc5204b1b9effc92c45f129904ea67795) Thanks [@luxass](https://github.com/luxass)! - fix(zod-openapi): correctly handle path parameters in basePath

## 0.19.1

### Patch Changes

- [#992](https://github.com/honojs/middleware/pull/992) [`3c738f5ea44f5f5e5cdc14dfeaba5c04188d6373`](https://github.com/honojs/middleware/commit/3c738f5ea44f5f5e5cdc14dfeaba5c04188d6373) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: replace path param strings correctly in basePath

## 0.19.0

### Minor Changes

- [#984](https://github.com/honojs/middleware/pull/984) [`59c6356aac42d360a06cbc9357921283e455ade4`](https://github.com/honojs/middleware/commit/59c6356aac42d360a06cbc9357921283e455ade4) Thanks [@rmichalak](https://github.com/rmichalak)! - Add ability to exclude specific routes from OpenAPI docs

## 0.18.4

### Patch Changes

- [#955](https://github.com/honojs/middleware/pull/955) [`70a564e268cd6350cfb994e5b5c5626b31a3fcc9`](https://github.com/honojs/middleware/commit/70a564e268cd6350cfb994e5b5c5626b31a3fcc9) Thanks [@luxass](https://github.com/luxass)! - fix: use nested app base paths in openapi schema

## 0.18.3

### Patch Changes

- [#855](https://github.com/honojs/middleware/pull/855) [`3f63c46fa66bfb7f1d80174bfb160cccfa69f0bc`](https://github.com/honojs/middleware/commit/3f63c46fa66bfb7f1d80174bfb160cccfa69f0bc) Thanks [@jstri](https://github.com/jstri)! - fix: support default response

## 0.18.2

### Patch Changes

- [#853](https://github.com/honojs/middleware/pull/853) [`a9804afe71fe5876963b3a6f5972a3e5d50dbdca`](https://github.com/honojs/middleware/commit/a9804afe71fe5876963b3a6f5972a3e5d50dbdca) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: return `Response` if response is not text or JSON

## 0.18.1

### Patch Changes

- [#849](https://github.com/honojs/middleware/pull/849) [`4ebecc61420b6bd94b3a44b8ea58a85654f7ec5d`](https://github.com/honojs/middleware/commit/4ebecc61420b6bd94b3a44b8ea58a85654f7ec5d) Thanks [@askorupskyy](https://github.com/askorupskyy)! - Fix multi-middleware complex object type inference

## 0.18.0

### Minor Changes

- [#837](https://github.com/honojs/middleware/pull/837) [`ebd70a0e03c5bb78ba2d39613e10bdc28fe7822b`](https://github.com/honojs/middleware/commit/ebd70a0e03c5bb78ba2d39613e10bdc28fe7822b) Thanks [@yusukebe](https://github.com/yusukebe)! - feat: support `enum`

## 0.17.1

### Patch Changes

- [#828](https://github.com/honojs/middleware/pull/828) [`bbb48ef368d8277b89cb938207093462addf4be3`](https://github.com/honojs/middleware/commit/bbb48ef368d8277b89cb938207093462addf4be3) Thanks [@daniel-pedersen](https://github.com/daniel-pedersen)! - infer env type parameter from middleware

## 0.17.0

### Minor Changes

- [#807](https://github.com/honojs/middleware/pull/807) [`2eec6f6fd90b00e130db5f0b3cfeff806132d98a`](https://github.com/honojs/middleware/commit/2eec6f6fd90b00e130db5f0b3cfeff806132d98a) Thanks [@oberbeck](https://github.com/oberbeck)! - introduce routeMiddleware Env inference

## 0.16.3

### Patch Changes

- [#756](https://github.com/honojs/middleware/pull/756) [`f6d642afddb31ffb379e71398f6fef534a6621f3`](https://github.com/honojs/middleware/commit/f6d642afddb31ffb379e71398f6fef534a6621f3) Thanks [@lucaschultz](https://github.com/lucaschultz)! - fix: add target property to parameter of validation hook

## 0.16.2

### Patch Changes

- [#750](https://github.com/honojs/middleware/pull/750) [`98d4ceab9c3eef30d14a457844ce94c3da95b9e9`](https://github.com/honojs/middleware/commit/98d4ceab9c3eef30d14a457844ce94c3da95b9e9) Thanks [@yusukebe](https://github.com/yusukebe)! - chore: bump `@hono/zod-validator`

## 0.16.1

### Patch Changes

- Updated dependencies [[`eda35847916cf7f7e84289eba29a8e5517615c6b`](https://github.com/honojs/middleware/commit/eda35847916cf7f7e84289eba29a8e5517615c6b)]:
  - @hono/zod-validator@0.3.0

## 0.16.0

### Minor Changes

- [#710](https://github.com/honojs/middleware/pull/710) [`dadf5ce3c2c134b83420702ca8fe13d6fb8d9390`](https://github.com/honojs/middleware/commit/dadf5ce3c2c134b83420702ca8fe13d6fb8d9390) Thanks [@ameinhardt](https://github.com/ameinhardt)! - Allow multiple mime type response

## 0.15.3

### Patch Changes

- [#689](https://github.com/honojs/middleware/pull/689) [`c3d48868003ebd215074777a4846af208ddab123`](https://github.com/honojs/middleware/commit/c3d48868003ebd215074777a4846af208ddab123) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: supports `required` for JSON and Form body

## 0.15.2

### Patch Changes

- [#686](https://github.com/honojs/middleware/pull/686) [`a6ec008fbd8235368b796d2c0edb6adfe8c03cc5`](https://github.com/honojs/middleware/commit/a6ec008fbd8235368b796d2c0edb6adfe8c03cc5) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: don't validate the body if content-type is mismatched

## 0.15.1

### Patch Changes

- [#656](https://github.com/honojs/middleware/pull/656) [`a04ab70c2c4254eed24efd81d6e5a31553553ec9`](https://github.com/honojs/middleware/commit/a04ab70c2c4254eed24efd81d6e5a31553553ec9) Thanks [@adjsky](https://github.com/adjsky)! - fix(zod-openapi): infer OpenAPIObjectConfig

## 0.15.0

### Minor Changes

- [#645](https://github.com/honojs/middleware/pull/645) [`f38a6166f6ced37ebea3f7cfcefe91d001b0c3b3`](https://github.com/honojs/middleware/commit/f38a6166f6ced37ebea3f7cfcefe91d001b0c3b3) Thanks [@DavidHavl](https://github.com/DavidHavl)! - Support other json content-types such as application/vnd.api+json, application/problem+json, etc.

## 0.14.9

### Patch Changes

- [#632](https://github.com/honojs/middleware/pull/632) [`a405d0870998f131dbc05a44fae0e6df7ff82521`](https://github.com/honojs/middleware/commit/a405d0870998f131dbc05a44fae0e6df7ff82521) Thanks [@paolostyle](https://github.com/paolostyle)! - expose `extendZodWithOpenApi` from `zod-to-openapi`

## 0.14.8

### Patch Changes

- [#623](https://github.com/honojs/middleware/pull/623) [`834a97a7b069fe5301f305f18bf271f3842af647`](https://github.com/honojs/middleware/commit/834a97a7b069fe5301f305f18bf271f3842af647) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: support `coerce`

## 0.14.7

### Patch Changes

- [#609](https://github.com/honojs/middleware/pull/609) [`b06bde6ef59368e00c7c75f5866687df2ce47bd9`](https://github.com/honojs/middleware/commit/b06bde6ef59368e00c7c75f5866687df2ce47bd9) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: support a base path

## 0.14.6

### Patch Changes

- [#607](https://github.com/honojs/middleware/pull/607) [`375c98b145560c855f9000c523734bb2d31990c9`](https://github.com/honojs/middleware/commit/375c98b145560c855f9000c523734bb2d31990c9) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: remove the type error for the hook

## 0.14.5

### Patch Changes

- [#582](https://github.com/honojs/middleware/pull/582) [`053a85c722833b1f670fe667fb80b3cbe88f9a4d`](https://github.com/honojs/middleware/commit/053a85c722833b1f670fe667fb80b3cbe88f9a4d) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: bump `@asteasolutions/zod-to-openapi`

## 0.14.4

### Patch Changes

- [#576](https://github.com/honojs/middleware/pull/576) [`9a9de504942358be5a77236231e20f5016b6d1a9`](https://github.com/honojs/middleware/commit/9a9de504942358be5a77236231e20f5016b6d1a9) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: use `JSONParsed` for creating a response type

## 0.14.3

### Patch Changes

- [#574](https://github.com/honojs/middleware/pull/574) [`ef9f45ab692c81e1474cfb054f55a2c9fc39bdf8`](https://github.com/honojs/middleware/commit/ef9f45ab692c81e1474cfb054f55a2c9fc39bdf8) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: relax types to support `.refine()` for an object

## 0.14.2

### Patch Changes

- [#557](https://github.com/honojs/middleware/pull/557) [`69e53644647c156e5f6df0d981eabcd490c4e60b`](https://github.com/honojs/middleware/commit/69e53644647c156e5f6df0d981eabcd490c4e60b) Thanks [@arjunyel](https://github.com/arjunyel)! - Fix OpenAPI yaml with route middleware

## 0.14.1

### Patch Changes

- Updated dependencies [[`aa055494974eb911ec784e6462691aafefd98125`](https://github.com/honojs/middleware/commit/aa055494974eb911ec784e6462691aafefd98125)]:
  - @hono/zod-validator@0.2.2

## 0.14.0

### Minor Changes

- [#535](https://github.com/honojs/middleware/pull/535) [`a595e4e260040decd871e271c60c5a07c6db4086`](https://github.com/honojs/middleware/commit/a595e4e260040decd871e271c60c5a07c6db4086) Thanks [@taku-hatano](https://github.com/taku-hatano)! - extract range definitions to StatusCode

## 0.13.0

### Minor Changes

- [#532](https://github.com/honojs/middleware/pull/532) [`eeccd4fc2fd63c9d79d7a4911f80fa94d1680983`](https://github.com/honojs/middleware/commit/eeccd4fc2fd63c9d79d7a4911f80fa94d1680983) Thanks [@akineko](https://github.com/akineko)! - feat(zod-openapi): export RouteConfig type

## 0.12.2

### Patch Changes

- [#529](https://github.com/honojs/middleware/pull/529) [`0a43d2c562f5adb12009f6bdd0e7fb7c06a625e6`](https://github.com/honojs/middleware/commit/0a43d2c562f5adb12009f6bdd0e7fb7c06a625e6) Thanks [@akineko](https://github.com/akineko)! - fix(zod-openapi): update RouteHandler type to support MaybePromise

## 0.12.1

### Patch Changes

- [#522](https://github.com/honojs/middleware/pull/522) [`2d5ef8255861482cd62deee3d6616a2e21016d53`](https://github.com/honojs/middleware/commit/2d5ef8255861482cd62deee3d6616a2e21016d53) Thanks [@alexzhang1030](https://github.com/alexzhang1030)! - fix(zod-openapi): return type of handler should be MaybePromise

## 0.12.0

### Minor Changes

- [#519](https://github.com/honojs/middleware/pull/519) [`b03484ba056215f0506894f9156cb1e2963cb450`](https://github.com/honojs/middleware/commit/b03484ba056215f0506894f9156cb1e2963cb450) Thanks [@yusukebe](https://github.com/yusukebe)! - feat(zod-openapi): support "status code"

## 0.11.1

### Patch Changes

- [#510](https://github.com/honojs/middleware/pull/510) [`88113fae8b5bd5d0a7662a1cca426f522da109b7`](https://github.com/honojs/middleware/commit/88113fae8b5bd5d0a7662a1cca426f522da109b7) Thanks [@taku-hatano](https://github.com/taku-hatano)! - Add Promise<void> to Hook

## 0.11.0

### Minor Changes

- [#435](https://github.com/honojs/middleware/pull/435) [`4660092b9ae446e3a6da32628e1bead361769e8a`](https://github.com/honojs/middleware/commit/4660092b9ae446e3a6da32628e1bead361769e8a) Thanks [@RomanNabukhotnyi](https://github.com/RomanNabukhotnyi)! - Add 'middleware' property for route

## 0.10.1

### Patch Changes

- [#445](https://github.com/honojs/middleware/pull/445) [`110e27246015cac60c8a07cd078c3245b7ddbeeb`](https://github.com/honojs/middleware/commit/110e27246015cac60c8a07cd078c3245b7ddbeeb) Thanks [@fumieval](https://github.com/fumieval)! - Make getRoutingPath property of a RouteConfig non-enumerable

## 0.10.0

### Minor Changes

- [#443](https://github.com/honojs/middleware/pull/443) [`1e0d857ef9f756d1217eaccf37a028be7a107d78`](https://github.com/honojs/middleware/commit/1e0d857ef9f756d1217eaccf37a028be7a107d78) Thanks [@yusukebe](https://github.com/yusukebe)! - feat: bump `zod-to-openapi` supports ESM

## 0.9.10

### Patch Changes

- [#437](https://github.com/honojs/middleware/pull/437) [`9fc8591960ca547cb26a8d32d8f1e2c2f3568b95`](https://github.com/honojs/middleware/commit/9fc8591960ca547cb26a8d32d8f1e2c2f3568b95) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: bump `@hono/zod-validator`

## 0.9.9

### Patch Changes

- [#429](https://github.com/honojs/middleware/pull/429) [`b1f8a5325c3ad5eaa029ca5a82e7ef7adc7e6660`](https://github.com/honojs/middleware/commit/b1f8a5325c3ad5eaa029ca5a82e7ef7adc7e6660) Thanks [@hmnd](https://github.com/hmnd)! - fix: base path not included in client types

## 0.9.8

### Patch Changes

- Updated dependencies [[`4875e1c53146d2c67846b8159d3630d465c2a310`](https://github.com/honojs/middleware/commit/4875e1c53146d2c67846b8159d3630d465c2a310)]:
  - @hono/zod-validator@0.2.0

## 0.9.7

### Patch Changes

- [#408](https://github.com/honojs/middleware/pull/408) [`d4ca1ce98f33ae67100986613144e9d12fb933b3`](https://github.com/honojs/middleware/commit/d4ca1ce98f33ae67100986613144e9d12fb933b3) Thanks [@DavidHavl](https://github.com/DavidHavl)! - fix: Fix basePath method disregarding defaultHook

## 0.9.6

### Patch Changes

- [#356](https://github.com/honojs/middleware/pull/356) [`168a0a6d684a0750ab95802d6316e562061f786c`](https://github.com/honojs/middleware/commit/168a0a6d684a0750ab95802d6316e562061f786c) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: handle `Conflicting names for parameter`

## 0.9.5

### Patch Changes

- [#316](https://github.com/honojs/middleware/pull/316) [`5eeb555`](https://github.com/honojs/middleware/commit/5eeb555c8958fb890e80262e3dbf532f3c8c1e55) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: supports named params in nested routes

## 0.9.4

### Patch Changes

- [#313](https://github.com/honojs/middleware/pull/313) [`b8219d9`](https://github.com/honojs/middleware/commit/b8219d9b68e6aba7466705d0787dbdd15b808b06) Thanks [@WildEgo](https://github.com/WildEgo)! - change: Export Hook in @hono/zod-openapi

## 0.9.3

### Patch Changes

- [#292](https://github.com/honojs/middleware/pull/292) [`7ded22a`](https://github.com/honojs/middleware/commit/7ded22a57edba4d30144fd7641d9502eecefc1ac) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: bump Hono for peerDependencies and add tests

## 0.9.2

### Patch Changes

- [#286](https://github.com/honojs/middleware/pull/286) [`8178ba0`](https://github.com/honojs/middleware/commit/8178ba094f9bcc289b57f017a79fb075b08566cb) Thanks [@fahchen](https://github.com/fahchen)! - use z.input to infer input types of the request

## 0.9.1

### Patch Changes

- [#287](https://github.com/honojs/middleware/pull/287) [`1568b92`](https://github.com/honojs/middleware/commit/1568b920de1e45b963d1812c32932fad01dbe2fe) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: Strict type checking of return values

## 0.9.0

### Minor Changes

- [#272](https://github.com/honojs/middleware/pull/272) [`d4aa8ec`](https://github.com/honojs/middleware/commit/d4aa8ec5ad38942c1606642dc4676a92a7c006a8) Thanks [@Karibash](https://github.com/Karibash)! - Make context accessible in the doc route

## 0.8.6

### Patch Changes

- [#260](https://github.com/honojs/middleware/pull/260) [`ba83a26`](https://github.com/honojs/middleware/commit/ba83a268e010a7b18172e7de01e3901b58a7ec62) Thanks [@Karibash](https://github.com/Karibash)! - Make it possible to do method chaining even for doc methods

## 0.8.5

### Patch Changes

- [#258](https://github.com/honojs/middleware/pull/258) [`368c352`](https://github.com/honojs/middleware/commit/368c3520fa8a15657e8e42313bbfde3d87b0183b) Thanks [@Karibash](https://github.com/Karibash)! - Fix a bug that slashes were duplicated when mounting a path using the route method

## 0.8.4

### Patch Changes

- [#255](https://github.com/honojs/middleware/pull/255) [`129f468`](https://github.com/honojs/middleware/commit/129f4680a2c050ec49a0422d735e0d173d7b5faf) Thanks [@Karibash](https://github.com/Karibash)! - Fix incorrect specification of the exports field in package.json

## 0.8.3

### Patch Changes

- [#222](https://github.com/honojs/middleware/pull/222) [`73ab82a`](https://github.com/honojs/middleware/commit/73ab82a90253a0dbc536251787ff5713981a4075) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: import types correctly

## 0.8.2

### Patch Changes

- [#217](https://github.com/honojs/middleware/pull/217) [`a80c84b`](https://github.com/honojs/middleware/commit/a80c84ba07153f8521c1fc0286abef0623c99b5c) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: bump Hono for `peerDependencies`

## 0.8.1

### Patch Changes

- [#211](https://github.com/honojs/middleware/pull/211) [`6ca8e8d`](https://github.com/honojs/middleware/commit/6ca8e8d8de85dde7b9c25bfd5665aa32e233402e) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: relax input types

## 0.8.0

### Minor Changes

- [#206](https://github.com/honojs/middleware/pull/206) [`2d2fdd0`](https://github.com/honojs/middleware/commit/2d2fdd0379a31320b06f6d1a9e4634bfe1b7c657) Thanks [@yusukebe](https://github.com/yusukebe)! - feat: allows the response to be `Response` not just `TypedResponse`.

## 0.7.2

### Patch Changes

- [#189](https://github.com/honojs/middleware/pull/189) [`58167f3`](https://github.com/honojs/middleware/commit/58167f3b7f3c564334f5182529f0ddb29ace0af1) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: publish as cjs by default

## 0.7.1

### Patch Changes

- [#182](https://github.com/honojs/middleware/pull/182) [`9aefddc`](https://github.com/honojs/middleware/commit/9aefddc45d048e5e51eb36d81cb878c62a72ba9f) Thanks [@ZerNico](https://github.com/ZerNico)! - properly convert openapi path type to hono

## 0.7.0

### Minor Changes

- [#170](https://github.com/honojs/middleware/pull/170) [`9c45dbc`](https://github.com/honojs/middleware/commit/9c45dbc41d46ae4d04d9351757020d7ad528b400) Thanks [@msutkowski](https://github.com/msutkowski)! - Add defaultHook as an option for OpenAPIHono

### Patch Changes

- [#179](https://github.com/honojs/middleware/pull/179) [`047eca5`](https://github.com/honojs/middleware/commit/047eca5ca99085ee8c4f1581b17c8ebeae6afc82) Thanks [@yusukebe](https://github.com/yusukebe)! - fix(zod-openapi): enable `basePath()`

- [#176](https://github.com/honojs/middleware/pull/176) [`fb63ef4`](https://github.com/honojs/middleware/commit/fb63ef413cb7b843aebe756a5322bdd10ba74500) Thanks [@yusukebe](https://github.com/yusukebe)! - fix(zod-openapi): make multiple routes types correct for `hc`

- Updated dependencies [[`a9123dd`](https://github.com/honojs/middleware/commit/a9123dd9e3e90d4d73f495d6b407ebacf9ea0ad8)]:
  - @hono/zod-validator@0.1.9

## 0.6.0

### Minor Changes

- [#167](https://github.com/honojs/middleware/pull/167) [`dbebf74`](https://github.com/honojs/middleware/commit/dbebf747c9c7ca94bf22259772d8b1e0623ce68d) Thanks [@exsjabe](https://github.com/exsjabe)! - Export types that allow for separate declaratins of route handlers and hooks

## 0.5.1

### Patch Changes

- [#164](https://github.com/honojs/middleware/pull/164) [`62a97fd`](https://github.com/honojs/middleware/commit/62a97fda6a784f11549fff442978677642d2b218) Thanks [@yusukebe](https://github.com/yusukebe)! - fix(zod-openapi): use `z.output` for types after validation

## 0.5.0

### Minor Changes

- [#161](https://github.com/honojs/middleware/pull/161) [`05b8e9a`](https://github.com/honojs/middleware/commit/05b8e9a7511874f7e9dcb84b9dcfa97ca458ae4e) Thanks [@naporin0624](https://github.com/naporin0624)! - Add getRoutingPath to the return value of createRoute.

## 0.4.0

### Minor Changes

- [#153](https://github.com/honojs/middleware/pull/153) [`430088e`](https://github.com/honojs/middleware/commit/430088e17569a12e354c80c1d6da67a9ecbfdffe) Thanks [@mikestopcontinues](https://github.com/mikestopcontinues)! - Merge subapps' spec definitions into main app

- [#153](https://github.com/honojs/middleware/pull/153) [`430088e`](https://github.com/honojs/middleware/commit/430088e17569a12e354c80c1d6da67a9ecbfdffe) Thanks [@mikestopcontinues](https://github.com/mikestopcontinues)! - Support v3.1 spec output

- [#153](https://github.com/honojs/middleware/pull/153) [`430088e`](https://github.com/honojs/middleware/commit/430088e17569a12e354c80c1d6da67a9ecbfdffe) Thanks [@mikestopcontinues](https://github.com/mikestopcontinues)! - OpenAPIHono constructor supports init object

## 0.3.1

### Patch Changes

- [#155](https://github.com/honojs/middleware/pull/155) [`804caac`](https://github.com/honojs/middleware/commit/804caac19123e0b6d9a3f33b686051f1f111ee1f) Thanks [@yusukebe](https://github.com/yusukebe)! - fix(zod-openapi): support multiple params

## 0.3.0

### Minor Changes

- [#150](https://github.com/honojs/middleware/pull/150) [`1006cbc`](https://github.com/honojs/middleware/commit/1006cbca6b6636340afe10f7680511bab2046b47) Thanks [@yusukebe](https://github.com/yusukebe)! - feat(zod-openapi): make `app.openAPIRegistry` public

### Patch Changes

- [#148](https://github.com/honojs/middleware/pull/148) [`1bfd648`](https://github.com/honojs/middleware/commit/1bfd648df8dfcd659c14514b977de945d3806b7d) Thanks [@yusukebe](https://github.com/yusukebe)! - fix(zod-openapi): fix a type error

## 0.2.0

### Minor Changes

- [#141](https://github.com/honojs/middleware/pull/141) [`f334e99`](https://github.com/honojs/middleware/commit/f334e99251cdabc8be9334eec7eb7d9a450d8e35) Thanks [@yusukebe](https://github.com/yusukebe)! - feat: support `headers` and `cookies`

## 0.1.2

### Patch Changes

- [#139](https://github.com/honojs/middleware/pull/139) [`991b859`](https://github.com/honojs/middleware/commit/991b85915a63d1fd15cda52078f6401c17d3879f) Thanks [@yusukebe](https://github.com/yusukebe)! - fix: bump up Hono version

## 0.1.1

### Patch Changes

- [#132](https://github.com/honojs/middleware/pull/132) [`2dbc823`](https://github.com/honojs/middleware/commit/2dbc823b29a95e6c81bedc5416c08f15ac97288d) Thanks [@yusukebe](https://github.com/yusukebe)! - fix path param format `:id` to `{id}`

## 0.1.0

### Minor Changes

- [#124](https://github.com/honojs/middleware/pull/124) [`e6b20c6`](https://github.com/honojs/middleware/commit/e6b20c64b61654dc742b233ad09d764c71db7186) Thanks [@yusukebe](https://github.com/yusukebe)! - feat(zod-openapi): support RPC-mode

## 0.0.1

### Patch Changes

- [#121](https://github.com/honojs/middleware/pull/121) [`1233c00`](https://github.com/honojs/middleware/commit/1233c00875827749599880ade5830f8a1e7d73e8) Thanks [@yusukebe](https://github.com/yusukebe)! - docs: fixed readme

- [#118](https://github.com/honojs/middleware/pull/118) [`7b89803`](https://github.com/honojs/middleware/commit/7b898034a50c9bfa08872e28dcaa066ea55d9e3d) Thanks [@yusukebe](https://github.com/yusukebe)! - introduce Zod OpenAPI
