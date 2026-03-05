import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite config that builds the chat widget as a single self-contained JS file
 * suitable for embedding in WordPress or any HTML page.
 *
 * Usage:  npx vite build --config vite.widget.config.ts
 * Output: dist-widget/femibot-chat-widget.js
 */
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist-widget',
    emptyOutDir: true,
    // Build as a single IIFE bundle (no ES modules, works everywhere)
    lib: {
      entry: 'src/widget/widget-entry.tsx',
      name: 'FemibotChatWidget',
      formats: ['iife'],
      fileName: () => 'femibot-chat-widget.js',
    },
    rollupOptions: {
      // Bundle everything — no external dependencies
      external: [],
      output: {
        // Inline all CSS into the JS bundle
        inlineDynamicImports: true,
      },
    },
    // Inline small assets
    assetsInlineLimit: 100000,
    // Use esbuild for minification (built into Vite, no extra install needed)
    minify: 'esbuild',
  },
});
