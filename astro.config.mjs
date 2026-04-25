// @ts-check
import { defineConfig } from 'astro/config';
import { EventEmitter } from 'node:events';
import node from '@astrojs/node';

import svelte from '@astrojs/svelte';

import tailwindcss from '@tailwindcss/vite';

EventEmitter.defaultMaxListeners = 30;

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [svelte()],

  vite: {
    plugins: [tailwindcss()]
  }
});