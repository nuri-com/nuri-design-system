import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
for (const key of ['window', 'document', 'customElements', 'HTMLElement', 'MutationObserver', 'Node', 'CustomEvent']) {
  globalThis[key] = key === 'window' ? dom.window : dom.window[key];
}

let observerConstructions = 0;
class ResizeObserverStub {
  constructor() {
    observerConstructions += 1;
  }
  observe() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub;
dom.window.ResizeObserver = ResizeObserverStub;

await import('../primitives/screen.js');
await import('../primitives/header.js');
await import('../primitives/scroll.js');
await import('../primitives/footer.js');
await import('../primitives/dock.js');
await import('../recipes/modal.js');

const { modalPanelDescriptor } = await import('../generated/descriptors/modal-panel.js');
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

async function source(relativePath) {
  return readFile(new URL(relativePath, import.meta.url), 'utf8');
}

test('Header and Footer stay dynamic without constructing measurement observers', () => {
  const header = document.createElement('nuri-header');
  header.setAttribute('padding-y', 'sm');
  header.textContent = 'Header one';
  const footer = document.createElement('nuri-footer');
  footer.setAttribute('safe-area-bottom', '');
  footer.textContent = 'Footer one';
  document.body.append(header, footer);

  assert.equal(observerConstructions, 0);
  assert.match(header.firstElementChild?.textContent ?? '', /Header one/);
  assert.match(footer.firstElementChild?.textContent ?? '', /Footer one/);

  header.firstElementChild?.append(' plus');
  footer.firstElementChild?.append(' plus');
  assert.match(header.textContent, /Header one plus/);
  assert.match(footer.textContent, /Footer one plus/);
  assert.equal(observerConstructions, 0);
});

test('Dock remains the only measured fixed-region primitive', () => {
  const screen = document.createElement('nuri-screen');
  const dock = document.createElement('nuri-dock');
  dock.setAttribute('edge', 'bottom');
  dock.textContent = 'Dock';
  screen.append(dock);
  document.body.append(screen);

  assert.ok(observerConstructions > 0);
});

test('Modal mode updates geometry without replacing authored composition', async () => {
  const modal = document.createElement('nuri-modal');
  modal.setAttribute('open', '');
  modal.setAttribute('mode', 'sheet');
  modal.innerHTML = `
    <nuri-modal-panel>
      <nuri-header>Header</nuri-header>
      <nuri-scroll>Body</nuri-scroll>
      <nuri-footer>Footer</nuri-footer>
    </nuri-modal-panel>
  `;
  document.body.append(modal);
  await tick();

  const panel = modal.querySelector(':scope > nuri-modal-panel');
  const children = [...panel.children];
  assert.equal(panel.getAttribute('mode'), 'sheet');

  modal.setAttribute('mode', 'full');
  await tick();
  assert.equal(panel.getAttribute('mode'), 'full');
  assert.equal(panel.getAttribute('data-fill'), 'grow-shrink');
  assert.equal(panel.hasAttribute('data-radius-top'), false);
  assert.equal(panel.hasAttribute('data-elevation'), false);
  assert.equal(panel.children.length, children.length);
  for (const [index, child] of children.entries()) {
    assert.strictEqual(panel.children[index], child);
    assert.equal(child.isConnected, true);
  }

  modal.setAttribute('mode', 'sheet');
  await tick();
  assert.equal(panel.getAttribute('data-fill'), null);
  assert.equal(panel.getAttribute('data-radius-top'), 'lg');
  assert.equal(panel.getAttribute('data-elevation'), 'raised');
  for (const [index, child] of children.entries()) {
    assert.strictEqual(panel.children[index], child);
  }
});

test('modal descriptor keeps sheets intrinsic and makes only full panels grow-shrink', () => {
  assert.equal(modalPanelDescriptor.structure.base.root.stack.fill, undefined);
  assert.equal(modalPanelDescriptor.variants.mode.sheet.root.stack?.fill, undefined);
  assert.equal(modalPanelDescriptor.variants.mode.full.root.stack.fill, 'grow-shrink');
});

test('fixed-region sources encode one-pass flow and no obsolete web handshake', async () => {
  const [screenCss, headerCss, scrollCss, footerCss, modalCss, headerJs, footerJs, dockJs, modalJs, bottomSheetJs] = await Promise.all([
    source('../primitives/screen.css'),
    source('../primitives/header.css'),
    source('../primitives/scroll.css'),
    source('../primitives/footer.css'),
    source('../recipes/modal.css'),
    source('../primitives/header.js'),
    source('../primitives/footer.js'),
    source('../primitives/dock.js'),
    source('../recipes/modal.js'),
    source('../recipes/bottom-sheet.js'),
  ]);
  const fixedVar = ['--nuri', 'fixed', '(?:header|footer)', 'block'].join('-');
  const refreshHook = ['refresh', 'Region', 'Layout'].join('');
  const obsolete = new RegExp(`${fixedVar}|${refreshHook}`);

  for (const text of [screenCss, headerCss, scrollCss, footerCss, modalCss, headerJs, footerJs, modalJs, bottomSheetJs]) {
    assert.doesNotMatch(text, obsolete);
  }
  assert.doesNotMatch(headerJs, /ResizeObserver/);
  assert.doesNotMatch(footerJs, /ResizeObserver/);
  assert.match(dockJs, /ResizeObserver/);
  assert.match(headerCss, /position:\s*relative/);
  assert.match(headerCss, /flex-shrink:\s*0/);
  assert.match(footerCss, /flex-shrink:\s*0/);
  assert.match(scrollCss, /flex-shrink:\s*1/);
  assert.match(modalCss, /--nuri-scroll-flex-grow:\s*0/);
  assert.match(modalCss, /\[mode="full"\][^{]*\{[^}]*--nuri-scroll-flex-grow:\s*1/s);
});
