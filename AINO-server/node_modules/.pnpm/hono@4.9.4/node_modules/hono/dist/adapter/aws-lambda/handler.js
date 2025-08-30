// src/adapter/aws-lambda/handler.ts
import { decodeBase64, encodeBase64 } from "../../utils/encode.js";
var getRequestContext = (event) => {
  return event.requestContext;
};
var streamToNodeStream = async (reader, writer) => {
  let readResult = await reader.read();
  while (!readResult.done) {
    writer.write(readResult.value);
    readResult = await reader.read();
  }
  writer.end();
};
var streamHandle = (app) => {
  return awslambda.streamifyResponse(
    async (event, responseStream, context) => {
      const processor = getProcessor(event);
      try {
        const req = processor.createRequest(event);
        const requestContext = getRequestContext(event);
        const res = await app.fetch(req, {
          event,
          requestContext,
          context
        });
        const headers = {};
        const cookies = [];
        res.headers.forEach((value, name) => {
          if (name === "set-cookie") {
            cookies.push(value);
          } else {
            headers[name] = value;
          }
        });
        const httpResponseMetadata = {
          statusCode: res.status,
          headers,
          cookies
        };
        responseStream = awslambda.HttpResponseStream.from(responseStream, httpResponseMetadata);
        if (res.body) {
          await streamToNodeStream(res.body.getReader(), responseStream);
        } else {
          responseStream.write("");
        }
      } catch (error) {
        console.error("Error processing request:", error);
        responseStream.write("Internal Server Error");
      } finally {
        responseStream.end();
      }
    }
  );
};
var handle = (app, { isContentTypeBinary } = { isContentTypeBinary: void 0 }) => {
  return async (event, lambdaContext) => {
    const processor = getProcessor(event);
    const req = processor.createRequest(event);
    const requestContext = getRequestContext(event);
    const res = await app.fetch(req, {
      event,
      requestContext,
      lambdaContext
    });
    return processor.createResult(event, res, { isContentTypeBinary });
  };
};
var EventProcessor = class {
  createRequest(event) {
    const queryString = this.getQueryString(event);
    const domainName = event.requestContext && "domainName" in event.requestContext ? event.requestContext.domainName : event.headers?.["host"] ?? event.multiValueHeaders?.["host"]?.[0];
    const path = this.getPath(event);
    const urlPath = `https://${domainName}${path}`;
    const url = queryString ? `${urlPath}?${queryString}` : urlPath;
    const headers = this.getHeaders(event);
    const method = this.getMethod(event);
    const requestInit = {
      headers,
      method
    };
    if (event.body) {
      requestInit.body = event.isBase64Encoded ? decodeBase64(event.body) : event.body;
    }
    return new Request(url, requestInit);
  }
  async createResult(event, res, options) {
    const contentType = res.headers.get("content-type");
    const isContentTypeBinary = options.isContentTypeBinary ?? defaultIsContentTypeBinary;
    let isBase64Encoded = contentType && isContentTypeBinary(contentType) ? true : false;
    if (!isBase64Encoded) {
      const contentEncoding = res.headers.get("content-encoding");
      isBase64Encoded = isContentEncodingBinary(contentEncoding);
    }
    const body = isBase64Encoded ? encodeBase64(await res.arrayBuffer()) : await res.text();
    const result = {
      body,
      statusCode: res.status,
      isBase64Encoded,
      ...event.multiValueHeaders ? {
        multiValueHeaders: {}
      } : {
        headers: {}
      }
    };
    this.setCookies(event, res, result);
    if (result.multiValueHeaders) {
      res.headers.forEach((value, key) => {
        result.multiValueHeaders[key] = [value];
      });
    } else {
      res.headers.forEach((value, key) => {
        result.headers[key] = value;
      });
    }
    return result;
  }
  setCookies(event, res, result) {
    if (res.headers.has("set-cookie")) {
      const cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : Array.from(res.headers.entries()).filter(([k]) => k === "set-cookie").map(([, v]) => v);
      if (Array.isArray(cookies)) {
        this.setCookiesToResult(result, cookies);
        res.headers.delete("set-cookie");
      }
    }
  }
};
var EventV2Processor = class extends EventProcessor {
  getPath(event) {
    return event.rawPath;
  }
  getMethod(event) {
    return event.requestContext.http.method;
  }
  getQueryString(event) {
    return event.rawQueryString;
  }
  getCookies(event, headers) {
    if (Array.isArray(event.cookies)) {
      headers.set("Cookie", event.cookies.join("; "));
    }
  }
  setCookiesToResult(result, cookies) {
    result.cookies = cookies;
  }
  getHeaders(event) {
    const headers = new Headers();
    this.getCookies(event, headers);
    if (event.headers) {
      for (const [k, v] of Object.entries(event.headers)) {
        if (v) {
          headers.set(k, v);
        }
      }
    }
    return headers;
  }
};
var v2Processor = new EventV2Processor();
var EventV1Processor = class extends EventProcessor {
  getPath(event) {
    return event.path;
  }
  getMethod(event) {
    return event.httpMethod;
  }
  getQueryString(event) {
    if (event.multiValueQueryStringParameters) {
      return Object.entries(event.multiValueQueryStringParameters || {}).filter(([, value]) => value).map(([key, value]) => `${key}=${value.join(`&${key}=`)}`).join("&");
    } else {
      return Object.entries(event.queryStringParameters || {}).filter(([, value]) => value).map(([key, value]) => `${key}=${value}`).join("&");
    }
  }
  getCookies(event, headers) {
  }
  getHeaders(event) {
    const headers = new Headers();
    this.getCookies(event, headers);
    if (event.headers) {
      for (const [k, v] of Object.entries(event.headers)) {
        if (v) {
          headers.set(k, v);
        }
      }
    }
    if (event.multiValueHeaders) {
      for (const [k, values] of Object.entries(event.multiValueHeaders)) {
        if (values) {
          const foundK = headers.get(k);
          values.forEach((v) => (!foundK || !foundK.includes(v)) && headers.append(k, v));
        }
      }
    }
    return headers;
  }
  setCookiesToResult(result, cookies) {
    result.multiValueHeaders = {
      "set-cookie": cookies
    };
  }
};
var v1Processor = new EventV1Processor();
var ALBProcessor = class extends EventProcessor {
  getHeaders(event) {
    const headers = new Headers();
    if (event.multiValueHeaders) {
      for (const [key, values] of Object.entries(event.multiValueHeaders)) {
        if (values && Array.isArray(values)) {
          headers.set(key, values.join("; "));
        }
      }
    } else {
      for (const [key, value] of Object.entries(event.headers ?? {})) {
        if (value) {
          headers.set(key, value);
        }
      }
    }
    return headers;
  }
  getPath(event) {
    return event.path;
  }
  getMethod(event) {
    return event.httpMethod;
  }
  getQueryString(event) {
    if (event.multiValueQueryStringParameters) {
      return Object.entries(event.multiValueQueryStringParameters || {}).filter(([, value]) => value).map(([key, value]) => `${key}=${value.join(`&${key}=`)}`).join("&");
    } else {
      return Object.entries(event.queryStringParameters || {}).filter(([, value]) => value).map(([key, value]) => `${key}=${value}`).join("&");
    }
  }
  getCookies(event, headers) {
    let cookie;
    if (event.multiValueHeaders) {
      cookie = event.multiValueHeaders["cookie"]?.join("; ");
    } else {
      cookie = event.headers ? event.headers["cookie"] : void 0;
    }
    if (cookie) {
      headers.append("Cookie", cookie);
    }
  }
  setCookiesToResult(result, cookies) {
    if (result.multiValueHeaders) {
      result.multiValueHeaders["set-cookie"] = cookies;
    } else {
      result.headers["set-cookie"] = cookies.join(", ");
    }
  }
};
var albProcessor = new ALBProcessor();
var getProcessor = (event) => {
  if (isProxyEventALB(event)) {
    return albProcessor;
  }
  if (isProxyEventV2(event)) {
    return v2Processor;
  }
  return v1Processor;
};
var isProxyEventALB = (event) => {
  if (event.requestContext) {
    return Object.hasOwn(event.requestContext, "elb");
  }
  return false;
};
var isProxyEventV2 = (event) => {
  return Object.hasOwn(event, "rawPath");
};
var defaultIsContentTypeBinary = (contentType) => {
  return !/^(text\/(plain|html|css|javascript|csv).*|application\/(.*json|.*xml).*|image\/svg\+xml.*)$/.test(
    contentType
  );
};
var isContentEncodingBinary = (contentEncoding) => {
  if (contentEncoding === null) {
    return false;
  }
  return /^(gzip|deflate|compress|br)/.test(contentEncoding);
};
export {
  ALBProcessor,
  EventProcessor,
  EventV1Processor,
  EventV2Processor,
  defaultIsContentTypeBinary,
  getProcessor,
  handle,
  isContentEncodingBinary,
  streamHandle
};
