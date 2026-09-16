export type SessionInfo = {
	publicBaseUrl: string | null;
	joinUrl: string | null;
};

let publicBaseUrl: string | null = null;

export function setPublicBaseUrl(url: string | null): void {
	if (!url) {
		publicBaseUrl = null;
		return;
	}
	publicBaseUrl = url.replace(/\/$/, '');
}

export function getSessionInfo(fallbackOrigin?: string | null): SessionInfo {
	const joinFromPublic = publicBaseUrl ? `${publicBaseUrl}/controller` : null;
	const joinFromLocal = fallbackOrigin ? `${fallbackOrigin.replace(/\/$/, '')}/controller` : null;
	return {
		publicBaseUrl,
		joinUrl: joinFromPublic ?? joinFromLocal
	};
}
