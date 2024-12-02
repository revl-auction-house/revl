import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type ViteDevServer, type PreviewServer, type PluginOption } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import houdini from 'houdini/vite';

function crossOriginIsolationPlugin() {
	return {
		name: 'cross-origin-isolation',
		configureServer: (server: ViteDevServer) => {
			server.middlewares.use((_, response, next) => {
				response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
				response.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
				next();
			});
		},
		configurePreviewServer: (server: PreviewServer) => {
			server.middlewares.use((_, response, next) => {
				response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
				response.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
				next();
			});
		}
	} as PluginOption;
}

export default defineConfig({
	plugins: [
		houdini(),
		sveltekit(),
		topLevelAwait({
			promiseExportName: '__tla',
			promiseImportName: (i) => `__tla_${i}`
		}),
		nodePolyfills(),
		crossOriginIsolationPlugin()
	],
	build: {
		target: 'esnext'
	},
	worker: {
		format: 'es',
		plugins: () => [sveltekit(), crossOriginIsolationPlugin()]
	},
	optimizeDeps: { esbuildOptions: { target: 'esnext' } }
});
