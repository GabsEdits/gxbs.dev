// @ts-check
import { defineConfig } from 'astro/config';
import { EventEmitter } from 'node:events';

import svelte from '@astrojs/svelte';

import tailwindcss from '@tailwindcss/vite';

// Avoid noisy FSWatcher listener warnings from vite-plugin-svelte in dev.
EventEmitter.defaultMaxListeners = 30;

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],

  vite: {
    plugins: [tailwindcss()]
  }
});