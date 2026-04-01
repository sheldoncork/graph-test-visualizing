import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

function normalizeBasePath(pathValue) {
  if (!pathValue || pathValue === '/') {
    return '';
  }

  const withLeadingSlash = pathValue.startsWith('/') ? pathValue : `/${pathValue}`;
  return withLeadingSlash.replace(/\/+$/, '');
}

const basePath = normalizeBasePath(process.env.BASE_PATH ?? '');

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: true,
      strict: false
    }),
    paths: {
      base: basePath
    }
  }
};
