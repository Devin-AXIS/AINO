// src/helper/proxy/index.ts
var hopByHopHeaders = [
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding"
];
var buildRequestInitFromRequest = (request) => {
  if (!request) {
    return {};
  }
  const headers = new Headers(request.headers);
  hopByHopHeaders.forEach((header) => {
    headers.delete(header);
  });
  return {
    method: request.method,
    body: request.body,
    duplex: request.body ? "half" : void 0,
    headers,
    signal: request.signal
  };
};
var preprocessRequestInit = (requestInit) => {
  if (!requestInit.headers || Array.isArray(requestInit.headers) || requestInit.headers instanceof Headers) {
    return requestInit;
  }
  const headers = new Headers();
  for (const [key, value] of Object.entries(requestInit.headers)) {
    if (value == null) {
      headers.delete(key);
    } else {
      headers.set(key, value);
    }
  }
  requestInit.headers = headers;
  return requestInit;
};
var proxy = async (input, proxyInit) => {
  const { raw, customFetch, ...requestInit } = proxyInit instanceof Request ? { raw: proxyInit } : proxyInit ?? {};
  const req = new Request(input, {
    ...buildRequestInitFromRequest(raw),
    ...preprocessRequestInit(requestInit)
  });
  req.headers.delete("accept-encoding");
  const res = await (customFetch || fetch)(req);
  const resHeaders = new Headers(res.headers);
  hopByHopHeaders.forEach((header) => {
    resHeaders.delete(header);
  });
  if (resHeaders.has("content-encoding")) {
    resHeaders.delete("content-encoding");
    resHeaders.delete("content-length");
  }
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: resHeaders
  });
};
export {
  proxy
};
