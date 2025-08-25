import * as r from "yaml";
import { b as n, S as c, a as i, c as h, g as a } from "./server-0nRY9GCE.mjs";
class e {
  static create(o) {
    return new e(o);
  }
  constructor(o) {
    this.rootDoc = o || {
      openapi: "3.1.0",
      info: {
        title: "app",
        version: "version"
      },
      paths: {},
      components: {
        schemas: {},
        responses: {},
        parameters: {},
        examples: {},
        requestBodies: {},
        headers: {},
        securitySchemes: {},
        links: {},
        callbacks: {}
      },
      tags: [],
      servers: []
    };
  }
  getSpec() {
    return this.rootDoc;
  }
  getSpecAsJson(o, t) {
    return JSON.stringify(this.rootDoc, o, t);
  }
  getSpecAsYaml(o, t) {
    return r.stringify(this.rootDoc, o, t);
  }
  static isValidOpenApiVersion(o) {
    o = o || "";
    const t = /(\d+)\.(\d+).(\d+)/.exec(o);
    return !!(t && parseInt(t[1], 10) >= 3);
  }
  addOpenApiVersion(o) {
    if (!e.isValidOpenApiVersion(o))
      throw new Error(
        "Invalid OpenApi version: " + o + ". Follow convention: 3.x.y"
      );
    return this.rootDoc.openapi = o, this;
  }
  addInfo(o) {
    return this.rootDoc.info = o, this;
  }
  addContact(o) {
    return this.rootDoc.info.contact = o, this;
  }
  addLicense(o) {
    return this.rootDoc.info.license = o, this;
  }
  addTitle(o) {
    return this.rootDoc.info.title = o, this;
  }
  addDescription(o) {
    return this.rootDoc.info.description = o, this;
  }
  addTermsOfService(o) {
    return this.rootDoc.info.termsOfService = o, this;
  }
  addVersion(o) {
    return this.rootDoc.info.version = o, this;
  }
  addPath(o, t) {
    return this.rootDoc.paths = this.rootDoc.paths || {}, this.rootDoc.paths[o] = { ...this.rootDoc.paths[o] || {}, ...t }, this;
  }
  addSchema(o, t) {
    return this.rootDoc.components = this.rootDoc.components || {}, this.rootDoc.components.schemas = this.rootDoc.components.schemas || {}, this.rootDoc.components.schemas[o] = t, this;
  }
  addResponse(o, t) {
    return this.rootDoc.components = this.rootDoc.components || {}, this.rootDoc.components.responses = this.rootDoc.components.responses || {}, this.rootDoc.components.responses[o] = t, this;
  }
  addParameter(o, t) {
    return this.rootDoc.components = this.rootDoc.components || {}, this.rootDoc.components.parameters = this.rootDoc.components.parameters || {}, this.rootDoc.components.parameters[o] = t, this;
  }
  addExample(o, t) {
    return this.rootDoc.components = this.rootDoc.components || {}, this.rootDoc.components.examples = this.rootDoc.components.examples || {}, this.rootDoc.components.examples[o] = t, this;
  }
  addRequestBody(o, t) {
    return this.rootDoc.components = this.rootDoc.components || {}, this.rootDoc.components.requestBodies = this.rootDoc.components.requestBodies || {}, this.rootDoc.components.requestBodies[o] = t, this;
  }
  addHeader(o, t) {
    return this.rootDoc.components = this.rootDoc.components || {}, this.rootDoc.components.headers = this.rootDoc.components.headers || {}, this.rootDoc.components.headers[o] = t, this;
  }
  addSecurityScheme(o, t) {
    return this.rootDoc.components = this.rootDoc.components || {}, this.rootDoc.components.securitySchemes = this.rootDoc.components.securitySchemes || {}, this.rootDoc.components.securitySchemes[o] = t, this;
  }
  addLink(o, t) {
    return this.rootDoc.components = this.rootDoc.components || {}, this.rootDoc.components.links = this.rootDoc.components.links || {}, this.rootDoc.components.links[o] = t, this;
  }
  addCallback(o, t) {
    return this.rootDoc.components = this.rootDoc.components || {}, this.rootDoc.components.callbacks = this.rootDoc.components.callbacks || {}, this.rootDoc.components.callbacks[o] = t, this;
  }
  addServer(o) {
    return this.rootDoc.servers = this.rootDoc.servers || [], this.rootDoc.servers.push(o), this;
  }
  addTag(o) {
    return this.rootDoc.tags = this.rootDoc.tags || [], this.rootDoc.tags.push(o), this;
  }
  addExternalDocs(o) {
    return this.rootDoc.externalDocs = o, this;
  }
  addWebhook(o, t) {
    return this.rootDoc.webhooks ??= {}, this.rootDoc.webhooks[o] = t, this;
  }
}
function p(s, o) {
  if (!n.isValidExtension(o))
    return s ? s[o] : void 0;
}
function m(s) {
  return Object.prototype.hasOwnProperty.call(s, "$ref");
}
function D(s) {
  return !Object.prototype.hasOwnProperty.call(s, "$ref");
}
const l = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  OpenApiBuilder: e,
  Server: c,
  ServerVariable: i,
  addExtension: h,
  getExtension: a,
  getPath: p,
  isReferenceObject: m,
  isSchemaObject: D
}, Symbol.toStringTag, { value: "Module" }));
export {
  e as O,
  D as a,
  p as g,
  m as i,
  l as o
};
//# sourceMappingURL=oas31-BgS8RJBM.mjs.map
