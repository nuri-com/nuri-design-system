// Demo client: tool select -> schemaToTree -> renderTree -> POST /api/call -> render response HTML.
import { schemaToTree, valuesToArgs } from '../mapper.js';
import { renderTree } from '../renderer.js';

const toolSelect = document.querySelector('#tool');
const form = document.querySelector('#form');
const result = document.querySelector('#result');

let tools = [];

// mapper trees use `component` + top-level field props; renderer expects `type` + `props`.
function toRenderNode(node) {
  const { component, children = [], props = {}, ...rest } = node;
  return { type: component, props: { ...rest, ...props }, children: children.map(toRenderNode) };
}

function helperRow(text) {
  const span = document.createElement('span');
  span.className = 'nuri-helper nuri-field-helper';
  span.textContent = text;
  return span;
}

function buildForm(tool) {
  form.innerHTML = '';
  if (!tool) return;
  const tree = schemaToTree(tool);
  form.innerHTML = renderTree(toRenderNode(tree));
  form.querySelector('.nuri-card')?.classList.add('nuri-demo-card');
  const fields = tree.children.filter((n) => n.key);
  const controls = form.querySelectorAll('input, select');
  fields.forEach((field, i) => {
    const el = controls[i];
    if (!el) return;
    el.name = field.key;
    if (el.type === 'checkbox') el.value = 'true';
    else if (field.required) el.required = true;
    let container = el.closest('label');
    if (!container) {
      // AmountInput renders bare div: wrap with label like other fields
      container = document.createElement('label');
      container.className = 'nuri-field';
      el.closest('div').before(container);
      container.append(el.closest('div'));
    }
    if (!container.querySelector('.nuri-field-label') && field.label) {
      const span = document.createElement('span');
      span.className = 'nuri-field-label';
      span.textContent = field.label + (field.required ? ' *' : '');
      container.prepend(span);
    }
    if (field.helper) container.append(helperRow(field.helper));
  });
}

toolSelect.addEventListener('change', () => {
  buildForm(tools.find((t) => t.name === toolSelect.value));
  result.innerHTML = '';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const tool = tools.find((t) => t.name === toolSelect.value);
  const args = valuesToArgs(Object.fromEntries(new FormData(form)), tool?.inputSchema);
  result.innerHTML = '<div class="nuri-spinner nuri-spinner-md" role="status" aria-label="Loading"></div>';
  try {
    const res = await fetch('/api/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: tool.name, arguments: args }),
    });
    const html = await res.text();
    result.innerHTML = res.ok ? html : `<div class="nuri-card nuri-card-error nuri-p-md" role="alert">${html}</div>`;
  } catch (err) {
    result.innerHTML = `<div class="nuri-card nuri-card-error nuri-p-md" role="alert">${err.message}</div>`;
  }
});

const res = await fetch('/api/tools');
tools = await res.json();
toolSelect.innerHTML = tools.map((t) => `<option value="${t.name}">${t.title || t.name}</option>`).join('');
buildForm(tools[0]);
