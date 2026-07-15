import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
for (const key of ['window', 'document', 'customElements', 'HTMLElement', 'MutationObserver', 'Node', 'CustomEvent']) {
  globalThis[key] = key === 'window' ? dom.window : dom.window[key];
}

await import('../primitives/header.js');

test('<nuri-header> paints safe-area chrome through the existing chrome channel', () => {
  const header = document.createElement('nuri-header');
  header.setAttribute('safe-area-top', '');
  header.setAttribute('chrome', 'transparent');
  header.setAttribute('safe-area-chrome', 'canvas');
  header.textContent = 'Search';
  document.body.appendChild(header);

  const inner = header.firstElementChild;
  assert.equal(inner?.getAttribute('data-chrome'), 'transparent');
  const safeAreaChrome = inner?.querySelector('.nuri-header__safe-area-chrome');
  assert.ok(safeAreaChrome);
  assert.equal(safeAreaChrome.getAttribute('data-chrome'), 'canvas');
  assert.ok(safeAreaChrome.classList.contains('nuri-palette'));
  assert.equal(safeAreaChrome.getAttribute('aria-hidden'), 'true');

  header.removeAttribute('safe-area-chrome');
  assert.equal(inner?.querySelector('.nuri-header__safe-area-chrome'), null);
});
