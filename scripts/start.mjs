#!/usr/bin/env node
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, preview } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 4173);
const HOST = '127.0.0.1';
const TRY_CLOUDFLARE_RE = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/i;

function whichSync(bin) {
	const pathEnv = process.env.PATH ?? '';
	const sep = process.platform === 'win32' ? ';' : ':';
	for (const dir of pathEnv.split(sep)) {
		if (!dir) continue;
		const full = path.join(dir, bin);
		if (fs.existsSync(full)) return full;
	}
	return null;
}

function resolveCloudflared() {
	const name = process.platform === 'win32' ? 'cloudflared.exe' : 'cloudflared';
	const local = path.join(ROOT, 'bin', name);
	if (fs.existsSync(local)) return local;
	return whichSync(name);
}

async function ensureCloudflared() {
	const existing = resolveCloudflared();
	if (existing) return existing;

	const script = path.join(ROOT, 'scripts', 'fetch-cloudflared.sh');
	if (!fs.existsSync(script)) {
		throw new Error('cloudflared not found and fetch script is missing.');
	}

	console.log('[cs-day] cloudflared not found; downloading…');
	await new Promise((resolve, reject) => {
		const child = spawn('bash', [script], { cwd: ROOT, stdio: 'inherit' });
		child.on('error', reject);
		child.on('exit', (code) => {
			if (code === 0) resolve();
			else reject(new Error(`fetch-cloudflared.sh exited with ${code}`));
		});
	});

	const after = resolveCloudflared();
	if (!after) {
		throw new Error(
			'cloudflared not found. Install with: brew install cloudflared\nOr run: npm run cloudflared:fetch'
		);
	}
	return after;
}

function extractPublicUrl(chunk) {
	const match = chunk.match(TRY_CLOUDFLARE_RE);
	return match ? match[0].replace(/\/$/, '') : null;
}

function startTunnel(bin, origin, timeoutMs = 45_000) {
	return new Promise((resolve, reject) => {
		let settled = false;
		const logBuf = [];
		const child = spawn(bin, ['tunnel', '--url', origin, '--no-autoupdate'], {
			stdio: ['ignore', 'pipe', 'pipe'],
			detached: process.platform !== 'win32',
			env: { ...process.env }
		});

		const finishOk = (url) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			console.log(`[cs-day] Public URL: ${url}`);
			resolve({ child, publicBaseUrl: url });
		};

		const finishErr = (err) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			stopTunnel(child);
			reject(err);
		};

		const onData = (buf) => {
			const text = buf.toString();
			process.stderr.write(`[tunnel] ${text}`);
			logBuf.push(text);
			if (logBuf.length > 40) logBuf.shift();
			const url = extractPublicUrl(text);
			if (url) finishOk(url);
		};

		child.stdout?.on('data', onData);
		child.stderr?.on('data', onData);
		child.on('error', (err) => {
			finishErr(new Error(`Failed to start cloudflared (${bin}): ${err.message}`));
		});
		child.on('exit', (code, signal) => {
			if (settled) return;
			finishErr(
				new Error(
					`cloudflared exited before publishing a URL (code=${code}, signal=${signal}).\n` +
						logBuf.join('').slice(-2000)
				)
			);
		});

		const timer = setTimeout(() => {
			finishErr(
				new Error(
					`Timed out waiting for trycloudflare.com URL after ${timeoutMs}ms.\n` +
						logBuf.join('').slice(-2000)
				)
			);
		}, timeoutMs);
		timer.unref?.();
	});
}

function stopTunnel(child) {
	if (!child?.pid) return;
	const pid = child.pid;
	if (process.platform === 'win32') {
		try {
			spawn('taskkill', ['/pid', String(pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
		} catch {
			try {
				child.kill();
			} catch {
				/* ignore */
			}
		}
		return;
	}
	try {
		process.kill(-pid, 'SIGTERM');
	} catch {
		try {
			child.kill('SIGTERM');
		} catch {
			/* ignore */
		}
	}
}

function postSession(publicBaseUrl) {
	const body = JSON.stringify({ publicBaseUrl });
	return new Promise((resolve, reject) => {
		const req = http.request(
			{
				hostname: HOST,
				port: PORT,
				path: '/api/session',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': Buffer.byteLength(body)
				}
			},
			(res) => {
				const chunks = [];
				res.on('data', (c) => chunks.push(c));
				res.on('end', () => {
					if (res.statusCode && res.statusCode >= 400) {
						reject(new Error(`POST /api/session failed: ${res.statusCode} ${Buffer.concat(chunks)}`));
						return;
					}
					resolve();
				});
			}
		);
		req.on('error', reject);
		req.write(body);
		req.end();
	});
}

function openUrl(url) {
	const args =
		process.platform === 'darwin'
			? ['open', [url]]
			: process.platform === 'win32'
				? ['cmd', ['/c', 'start', '', url]]
				: ['xdg-open', [url]];
	try {
		spawn(args[0], args[1], { stdio: 'ignore', detached: true }).unref();
	} catch {
		/* ignore */
	}
}

async function main() {
	const bin = await ensureCloudflared();

	console.log('[cs-day] Building…');
	await build({ root: ROOT });

	const server = await preview({
		root: ROOT,
		preview: { host: HOST, port: PORT, strictPort: true }
	});

	const origin = `http://${HOST}:${PORT}`;
	console.log(`[cs-day] Local server ${origin}`);
	console.log('[cs-day] Starting Cloudflare quick tunnel…');

	const tunnel = await startTunnel(bin, origin);
	await postSession(tunnel.publicBaseUrl);

	const joinUrl = `${tunnel.publicBaseUrl}/controller`;
	console.log('');
	console.log('  Host:       ' + origin + '/host');
	console.log('  View:       ' + origin + '/view');
	console.log('  Controller: ' + joinUrl);
	console.log('');
	console.log('Open /host and /view on this laptop. Phones should scan the QR (cellular preferred).');
	console.log('Quit with Ctrl+C.');

	openUrl(origin + '/host');
	openUrl(origin + '/view');

	const shutdown = () => {
		stopTunnel(tunnel.child);
		Promise.resolve(server.close()).finally(() => process.exit(0));
	};
	process.on('SIGINT', shutdown);
	process.on('SIGTERM', shutdown);
}

main().catch((err) => {
	console.error(err instanceof Error ? err.message : err);
	process.exit(1);
});
