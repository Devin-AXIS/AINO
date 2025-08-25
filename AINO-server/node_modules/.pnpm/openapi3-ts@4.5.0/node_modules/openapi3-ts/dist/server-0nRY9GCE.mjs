class r {
  static isValidExtension(i) {
    return /^x-/.test(i);
  }
  getExtension(i) {
    if (!r.isValidExtension(i))
      throw new Error(
        `Invalid specification extension: '${i}'. Extensions must start with prefix 'x-`
      );
    return this[i] ? this[i] : null;
  }
  addExtension(i, s) {
    if (!r.isValidExtension(i))
      throw new Error(
        `Invalid specification extension: '${i}'. Extensions must start with prefix 'x-`
      );
    this[i] = s;
  }
  listExtensions() {
    const i = [];
    for (const s in this)
      Object.prototype.hasOwnProperty.call(this, s) && r.isValidExtension(s) && i.push(s);
    return i;
  }
}
function a(t, i) {
  if (t && r.isValidExtension(i))
    return t[i];
}
function e(t, i, s) {
  t && r.isValidExtension(i) && (t[i] = s);
}
class o {
  constructor(i, s) {
    this.url = i, this.description = s, this.variables = {};
  }
  addVariable(i, s) {
    this.variables[i] = s;
  }
}
class l {
  constructor(i, s, n) {
    this.default = i, this.enum = s, this.description = n;
  }
}
export {
  o as S,
  l as a,
  r as b,
  e as c,
  a as g
};
//# sourceMappingURL=server-0nRY9GCE.mjs.map
