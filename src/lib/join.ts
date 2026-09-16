import { writable } from 'svelte/store';
import QRCode from 'qrcode';

export const joinUrl = writable<string | null>(null);
export const joinQrDataUrl = writable<string | null>(null);

let lastJoinUrl: string | null = null;

export async function refreshSession(): Promise<void> {
	if (typeof window === 'undefined') return;
	try {
		const res = await fetch('/api/session', { cache: 'no-store' });
		if (!res.ok) return;
		const data = (await res.json()) as { joinUrl?: string | null };
		const next = data.joinUrl ?? null;
		if (!next || next === lastJoinUrl) {
			if (next) joinUrl.set(next);
			return;
		}
		lastJoinUrl = next;
		joinUrl.set(next);
		joinQrDataUrl.set(await QRCode.toDataURL(next, { width: 512, margin: 1 }));
	} catch (err) {
		console.warn('[join] Failed to load session', err);
	}
}

export function pollSession(intervalMs = 1000): () => void {
	void refreshSession();
	const timer = setInterval(() => {
		void refreshSession();
	}, intervalMs);
	return () => clearInterval(timer);
}
