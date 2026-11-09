'use strict';
// Runs every redirect in static/_redirects (with and without trailing slash)
// through the generated function and checks the 301 target, plus index.html rewrites.
const fs = require('fs');
const path = require('path');
const { generate, MAX_BYTES } = require('../lib/redirect-function');

const redirects = fs.readFileSync(path.join(__dirname, '../../static/_redirects'), 'utf8');
const { code, bytes, count } = generate(redirects);
const handler = new Function(`${code}\nreturn handler;`)();
const ev = (uri) => ({ request: { uri, method: 'GET', headers: {}, querystring: {}, cookies: {} } });

let ok = 0;
const fail = [];
for (const line of redirects.split('\n')) {
  const p = line.trim().split(/\s+/);
  if (p.length !== 3) continue;
  const expected = encodeURI(decodeURI(p[1]));
  const res = handler(ev(p[0]));
  if (res.statusCode === 301 && res.headers.location.value === expected) ok++;
  else fail.push(`${p[0]} -> ${res.statusCode === 301 ? res.headers.location.value : res.uri} (expected ${expected})`);
}
for (const [uri, expected] of [
  ['/', '/index.html'],
  ['/omics-on-aws/', '/omics-on-aws/index.html'],
  ['/omics-on-aws', '/omics-on-aws/index.html'],
  ['/assets/js/main.123.js', '/assets/js/main.123.js'],
  ['/books/no-such-book', '/books/no-such-book/index.html'],
]) {
  const r = handler(ev(uri));
  if (r.uri === expected) ok++;
  else fail.push(`rewrite ${uri} -> ${r.uri || r.statusCode} (expected ${expected})`);
}
// Fail in CI while there is still room to act, instead of at deploy time when
// generate() throws on the hard 10 KB quota.
const HEADROOM_BYTES = Math.floor(MAX_BYTES * 0.9);
if (bytes > HEADROOM_BYTES) {
  fail.push(`function is ${bytes} bytes, over the ${HEADROOM_BYTES}-byte (90%) headroom limit; ` +
    'compact static/_redirects or move the table to CloudFront KeyValueStore');
}
// Hangul targets must reach the edge decoded so encodeURI() can expand them.
if (/%[0-9A-F]{2}/i.test(code.split('\n')[0])) {
  fail.push('redirect tables contain percent-encoded targets; store them decoded');
}
console.log(`redirects=${count} functionBytes=${bytes}/${MAX_BYTES} ok=${ok} failed=${fail.length}`);
fail.slice(0, 20).forEach((f) => console.log('  FAIL', f));
process.exit(fail.length ? 1 : 0);
