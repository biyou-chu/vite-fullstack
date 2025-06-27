import type { Plugin } from 'vite';

export default function injectChuPatch(): Plugin {
  const patchCode = (envProjectId: string) => `
(() => {
  const envProjectId = ${JSON.stringify(envProjectId)};
  const pattern = /^[a-zA-Z0-9]{8}_[a-zA-Z0-9]{5,7}-[1-9]\\d{5,}$/;

  function extractProjectId() {
    const path = window.location.pathname.split('/')[1];
    return pattern.test(path) ? path : null;
  }

  const projectId = pattern.test(envProjectId) ? envProjectId : extractProjectId();

  if (!projectId) {
    console.warn('[chu-patch] projectId not detected, fetch/axios patch skipped');
    return;
  }

  function shouldPatch(url) {
    if (!url.startsWith('/')) return false;
    const firstSegment = url.split('/')[1];
    return !pattern.test(firstSegment);
  }

  const originalFetch = window.fetch;
  window.fetch = async function(input, init) {
    let url = typeof input === 'string' ? input : input.url;
    if (shouldPatch(url)) {
      url = '/' + projectId + url;
    }
    input = typeof input === 'string' ? url : new Request(url, input);
    return originalFetch.call(this, input, init);
  };

  if (window.axios && window.axios.interceptors) {
    window.axios.interceptors.request.use(config => {
      if (config.url && shouldPatch(config.url)) {
        config.url = '/' + projectId + config.url;
      }
      return config;
    });
  }
})();
`.trim();

  return {
    name: 'inject-chu-fetch-and-axios-patch',
    enforce: 'post',
    transform(code, id) {
      if (id.includes('/src/') && /main\.(ts|tsx|js|jsx)$/.test(id)) {
        const envProjectId = process.env.VITE_PROJECT_ID || '';
        return {
          code: patchCode(envProjectId) + '\n\n' + code,
          map: null,
        };
      }
    }
  };
}