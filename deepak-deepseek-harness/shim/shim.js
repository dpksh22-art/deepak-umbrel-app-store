#!/usr/bin/env node
// DeepSeek Harness (dsh) Umbrel shim.
//
// dsh web only binds 127.0.0.1 and protects the UI with a per-process random
// launch token (there is no option to disable or fix it). This shim:
//   1. loads optional KEY=VALUE secrets from $DSH_SECRETS_FILE (never logged),
//   2. starts `dsh web` on 127.0.0.1:$DSH_PORT and reads the launch token from its stdout,
//   3. reverse-proxies HTTP + WebSocket from 0.0.0.0:$SHIM_PORT (Umbrel app_proxy target),
//      presenting a constant loopback authority to dsh's Host/Origin fence,
//   4. when a browser navigation gets 401, exchanges the launch token server-side for
//      dsh's signed session cookie and hands that cookie to the browser, so opening the
//      app from the Umbrel home screen (already behind Umbrel login) just works.
// The token never appears in the browser URL or in the logs.
'use strict';
const http = require('node:http');
const net = require('node:net');
const fs = require('node:fs');
const { spawn } = require('node:child_process');

const SHIM_PORT = Number(process.env.SHIM_PORT || 3080);
const DSH_PORT = Number(process.env.DSH_PORT || 3081);
const UPSTREAM = `127.0.0.1:${DSH_PORT}`;
const SECRETS_FILE = process.env.DSH_SECRETS_FILE || '/run/dsh-secrets/dsh.env';
const MARK = 'dsh-shim-login';

function log(...a) { console.log('[dsh-shim]', ...a); }

function loadSecrets() {
  const out = {};
  let text;
  try { text = fs.readFileSync(SECRETS_FILE, 'utf8'); } catch { return out; }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (v !== '') out[m[1]] = v;
  }
  return out;
}

// `shim.js exec <cmd> [args...]`: run a command with the secrets loaded (for CLI/headless use).
if (process.argv[2] === 'exec') {
  const env = { ...process.env, ...loadSecrets() };
  const c = spawn(process.argv[3], process.argv.slice(4), { stdio: 'inherit', env });
  c.on('exit', (code, sig) => process.exit(sig ? 1 : code ?? 1));
  c.on('error', (e) => { console.error(e.message); process.exit(127); });
  return;
}

const secrets = loadSecrets();
log(`loaded ${Object.keys(secrets).length} secret variable(s) from ${SECRETS_FILE}: ${Object.keys(secrets).join(', ') || '-'}`);

let token = null;
const extra = (process.env.DSH_EXTRA_ARGS || '').split(/\s+/).filter(Boolean);
const child = spawn('dsh', ['web', '--no-open', '--port', String(DSH_PORT), ...extra], {
  env: { ...process.env, ...secrets, BROWSER: 'true' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
const TOKEN_RE = /https?:\/\/127\.0\.0\.1:\d+\/?\?token=([A-Za-z0-9._~%-]+)/;
function relay(stream, dest) {
  let buf = '';
  stream.setEncoding('utf8');
  stream.on('data', (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i); buf = buf.slice(i + 1);
      const m = line.match(TOKEN_RE);
      if (m) { token = decodeURIComponent(m[1]); log('dsh web is up; launch token captured'); }
      dest.write(line.replace(/token=[A-Za-z0-9._~%-]+/g, 'token=<redacted>') + '\n');
    }
  });
}
relay(child.stdout, process.stdout);
relay(child.stderr, process.stderr);
let stopping = false;
child.on('exit', (code, sig) => {
  log(`dsh exited (code=${code}, signal=${sig})`);
  process.exit(stopping ? 0 : (code || 1));
});
for (const s of ['SIGTERM', 'SIGINT']) process.on(s, () => {
  stopping = true; child.kill(s);
  setTimeout(() => process.exit(0), 15000).unref();
});

// Rewrite request headers so dsh always sees its own loopback authority. A
// same-origin Origin is rewritten to match; a cross-origin Origin is kept so
// dsh's CSRF fence still rejects it.
function upstreamHeaders(req) {
  const h = { ...req.headers };
  const host = req.headers.host;
  if (h.origin) {
    try { if (new URL(h.origin).host === host) h.origin = `http://${UPSTREAM}`; } catch {}
  }
  if (h.referer) {
    try { const r = new URL(h.referer); if (r.host === host) h.referer = `http://${UPSTREAM}${r.pathname}${r.search}`; } catch {}
  }
  h.host = UPSTREAM;
  return h;
}

function fixLocation(loc) {
  if (!loc) return loc;
  for (const p of [`http://${UPSTREAM}`, `http://localhost:${DSH_PORT}`]) if (loc.startsWith(p)) return loc.slice(p.length) || '/';
  return loc;
}

function hasCookie(req, name) {
  return (req.headers.cookie || '').split(';').some((c) => c.trim().startsWith(name + '='));
}

function page(res, status, title, body, extraHeaders = {}) {
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', ...extraHeaders });
  res.end(`<!doctype html><meta charset="utf-8"><title>${title}</title><body style="font-family:system-ui;padding:2em">${body}</body>`);
}

// Exchange the launch token for dsh's signed session cookie (server-side).
function exchange(cb) {
  const r = http.request({ host: '127.0.0.1', port: DSH_PORT, method: 'GET', path: '/?token=' + encodeURIComponent(token), headers: { host: UPSTREAM, accept: 'text/html' } }, (up) => {
    up.resume();
    const sc = up.headers['set-cookie'];
    cb(up.statusCode >= 300 && up.statusCode < 400 && sc ? sc : null);
  });
  r.on('error', () => cb(null));
  r.end();
}

const server = http.createServer((req, res) => {
  if (!token) return page(res, 503, 'Starting…', '<meta http-equiv="refresh" content="2">DeepSeek Harness is starting…', {});
  const isNav = (req.method === 'GET' || req.method === 'HEAD') && /text\/html/.test(req.headers.accept || '') && !/[?&]token=/.test(req.url);
  const up = http.request({ host: '127.0.0.1', port: DSH_PORT, method: req.method, path: req.url, headers: upstreamHeaders(req) }, (pr) => {
    if (pr.statusCode === 401 && isNav) {
      pr.resume();
      if (hasCookie(req, MARK)) {
        return page(res, 401, 'Login failed', 'DeepSeek Harness rejected the session cookie. Check that your browser accepts cookies for this address, then <a href="/">reload</a>.', { 'set-cookie': `${MARK}=; Path=/; Max-Age=0` });
      }
      return exchange((cookies) => {
        if (!cookies) return page(res, 502, 'Login error', 'Could not obtain a DeepSeek Harness session. <a href="/">Retry</a>.');
        // 200 page + same-origin reload so the SameSite=Strict cookie is sent
        // even when the app was opened from another site.
        const target = JSON.stringify(req.url).replace(/</g, '\\u003c');
        page(res, 200, 'Signing in…', `Signing in to DeepSeek Harness…<script>location.replace(${target})</script><noscript><a href="${req.url.replace(/"/g, '%22')}">Continue</a></noscript>`,
          { 'set-cookie': [...cookies, `${MARK}=1; Path=/; Max-Age=20; SameSite=Lax; HttpOnly`] });
      });
    }
    const headers = { ...pr.headers };
    delete headers.connection; delete headers['keep-alive'];
    if (headers.location) headers.location = fixLocation(headers.location);
    if (pr.statusCode < 400 && isNav && hasCookie(req, MARK)) {
      const sc = headers['set-cookie'] ? [].concat(headers['set-cookie']) : [];
      headers['set-cookie'] = [...sc, `${MARK}=; Path=/; Max-Age=0`];
    }
    res.writeHead(pr.statusCode, pr.statusMessage, headers);
    res.flushHeaders();
    pr.pipe(res);
  });
  up.on('error', (e) => { if (!res.headersSent) page(res, 502, 'Upstream error', 'DeepSeek Harness is not reachable yet. <a href="/">Retry</a>.'); else res.destroy(); });
  req.pipe(up);
});

server.on('upgrade', (req, sock, head) => {
  const h = upstreamHeaders(req);
  const upSock = net.connect(DSH_PORT, '127.0.0.1', () => {
    let s = `${req.method} ${req.url} HTTP/1.1\r\n`;
    for (const [k, v] of Object.entries(h)) for (const vv of [].concat(v)) s += `${k}: ${vv}\r\n`;
    upSock.write(s + '\r\n');
    if (head && head.length) upSock.write(head);
    upSock.pipe(sock); sock.pipe(upSock);
  });
  const kill = () => { sock.destroy(); upSock.destroy(); };
  upSock.on('error', kill); sock.on('error', kill);
});

server.keepAliveTimeout = 65000;
server.listen(SHIM_PORT, '0.0.0.0', () => log(`listening on 0.0.0.0:${SHIM_PORT} -> ${UPSTREAM}`));
