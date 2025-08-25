// src/utils/jwt/jwt.ts
import { decodeBase64Url, encodeBase64Url } from "../../utils/encode.js";
import { AlgorithmTypes } from "./jwa.js";
import { signing, verifying } from "./jws.js";
import {
  JwtHeaderInvalid,
  JwtHeaderRequiresKid,
  JwtTokenExpired,
  JwtTokenInvalid,
  JwtTokenIssuedAt,
  JwtTokenIssuer,
  JwtTokenNotBefore,
  JwtTokenSignatureMismatched
} from "./types.js";
import { utf8Decoder, utf8Encoder } from "./utf8.js";
var encodeJwtPart = (part) => encodeBase64Url(utf8Encoder.encode(JSON.stringify(part)).buffer).replace(/=/g, "");
var encodeSignaturePart = (buf) => encodeBase64Url(buf).replace(/=/g, "");
var decodeJwtPart = (part) => JSON.parse(utf8Decoder.decode(decodeBase64Url(part)));
function isTokenHeader(obj) {
  if (typeof obj === "object" && obj !== null) {
    const objWithAlg = obj;
    return "alg" in objWithAlg && Object.values(AlgorithmTypes).includes(objWithAlg.alg) && (!("typ" in objWithAlg) || objWithAlg.typ === "JWT");
  }
  return false;
}
var sign = async (payload, privateKey, alg = "HS256") => {
  const encodedPayload = encodeJwtPart(payload);
  let encodedHeader;
  if (typeof privateKey === "object" && "alg" in privateKey) {
    alg = privateKey.alg;
    encodedHeader = encodeJwtPart({ alg, typ: "JWT", kid: privateKey.kid });
  } else {
    encodedHeader = encodeJwtPart({ alg, typ: "JWT" });
  }
  const partialToken = `${encodedHeader}.${encodedPayload}`;
  const signaturePart = await signing(privateKey, alg, utf8Encoder.encode(partialToken));
  const signature = encodeSignaturePart(signaturePart);
  return `${partialToken}.${signature}`;
};
var verify = async (token, publicKey, algOrOptions) => {
  const optsIn = typeof algOrOptions === "string" ? { alg: algOrOptions } : algOrOptions || {};
  const opts = {
    alg: optsIn.alg ?? "HS256",
    iss: optsIn.iss,
    nbf: optsIn.nbf ?? true,
    exp: optsIn.exp ?? true,
    iat: optsIn.iat ?? true
  };
  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) {
    throw new JwtTokenInvalid(token);
  }
  const { header, payload } = decode(token);
  if (!isTokenHeader(header)) {
    throw new JwtHeaderInvalid(header);
  }
  const now = Date.now() / 1e3 | 0;
  if (opts.nbf && payload.nbf && payload.nbf > now) {
    throw new JwtTokenNotBefore(token);
  }
  if (opts.exp && payload.exp && payload.exp <= now) {
    throw new JwtTokenExpired(token);
  }
  if (opts.iat && payload.iat && now < payload.iat) {
    throw new JwtTokenIssuedAt(now, payload.iat);
  }
  if (opts.iss) {
    if (!payload.iss) {
      throw new JwtTokenIssuer(opts.iss, null);
    }
    if (typeof opts.iss === "string" && payload.iss !== opts.iss) {
      throw new JwtTokenIssuer(opts.iss, payload.iss);
    }
    if (opts.iss instanceof RegExp && !opts.iss.test(payload.iss)) {
      throw new JwtTokenIssuer(opts.iss, payload.iss);
    }
  }
  const headerPayload = token.substring(0, token.lastIndexOf("."));
  const verified = await verifying(
    publicKey,
    opts.alg,
    decodeBase64Url(tokenParts[2]),
    utf8Encoder.encode(headerPayload)
  );
  if (!verified) {
    throw new JwtTokenSignatureMismatched(token);
  }
  return payload;
};
var verifyWithJwks = async (token, options, init) => {
  const verifyOpts = options.verification || {};
  const header = decodeHeader(token);
  if (!isTokenHeader(header)) {
    throw new JwtHeaderInvalid(header);
  }
  if (!header.kid) {
    throw new JwtHeaderRequiresKid(header);
  }
  if (options.jwks_uri) {
    const response = await fetch(options.jwks_uri, init);
    if (!response.ok) {
      throw new Error(`failed to fetch JWKS from ${options.jwks_uri}`);
    }
    const data = await response.json();
    if (!data.keys) {
      throw new Error('invalid JWKS response. "keys" field is missing');
    }
    if (!Array.isArray(data.keys)) {
      throw new Error('invalid JWKS response. "keys" field is not an array');
    }
    if (options.keys) {
      options.keys.push(...data.keys);
    } else {
      options.keys = data.keys;
    }
  } else if (!options.keys) {
    throw new Error('verifyWithJwks requires options for either "keys" or "jwks_uri" or both');
  }
  const matchingKey = options.keys.find((key) => key.kid === header.kid);
  if (!matchingKey) {
    throw new JwtTokenInvalid(token);
  }
  return await verify(token, matchingKey, {
    alg: matchingKey.alg || header.alg,
    ...verifyOpts
  });
};
var decode = (token) => {
  try {
    const [h, p] = token.split(".");
    const header = decodeJwtPart(h);
    const payload = decodeJwtPart(p);
    return {
      header,
      payload
    };
  } catch {
    throw new JwtTokenInvalid(token);
  }
};
var decodeHeader = (token) => {
  try {
    const [h] = token.split(".");
    return decodeJwtPart(h);
  } catch {
    throw new JwtTokenInvalid(token);
  }
};
export {
  decode,
  decodeHeader,
  isTokenHeader,
  sign,
  verify,
  verifyWithJwks
};
