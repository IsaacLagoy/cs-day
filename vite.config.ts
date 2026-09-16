import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { gameServerPlugin } from './server/vite-plugin-game';

export default defineConfig({
	plugins: [sveltekit(), gameServerPlugin()],
	server: {
		host: '127.0.0.1',
		port: 5173,
		strictPort: true,
		allowedHosts: ['.trycloudflare.com']
	},
	preview: {
		host: '127.0.0.1',
		port: 4173,
		strictPort: true,
		allowedHosts: ['.trycloudflare.com']
	}
});
