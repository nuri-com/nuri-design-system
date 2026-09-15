// Demo client: chat-style flow. Action list -> form in history -> submit -> response message.
// Auto fields (class 'auto') are hidden and silently filled from earlier responses.
import { schemaToTree, valuesToArgs } from '../mapper.js';
import { renderTree, renderNode } from '../renderer.js';

const actionsEl = document.querySelector('#actions');
const history = document.querySelector('#history');

let tools = [];
const autoState = {}; // captured values from earlier responses, e.g. request_id

// mapper trees use `component` + top-level field props; renderer expects `type` + `props`.
function toRenderNode(node) {
  const { component, children = [], props = {}, ...rest } = node;
  return { type: component, props: { ...rest, ...props }, children: children.map(toRenderNode) };
}

const autoKeys = (tool) => new Set(schemaToTree(tool).children.filter((n) => n.key && n.class === 'auto').map((n) => n.key));

function buildForm(tool, container) {
  const tree = schemaToTree(tool);
  tree.children = tree.children.filter((n) => !n.key || n.class !== 'auto');
  container.innerHTML = renderTree(toRenderNode(tree));
  container.querySelector('.nuri-card')?.classList.add('nuri-demo-card');
  const fields = tree.children.filter((n) => n.key);
  const controls = container.querySelectorAll('input, select');
  fields.forEach((field, i) => {
    const el = controls[i];
    if (!el) return;
    el.name = field.key;
    if (el.type === 'checkbox') el.value = 'true';
    else if (field.required) el.required = true;
    let containerLabel = el.closest('label');
    if (!containerLabel) {
      // AmountInput renders bare div: wrap with label like other fields
      containerLabel = document.createElement('label');
      containerLabel.className = 'nuri-field';
      el.closest('div').before(containerLabel);
      containerLabel.append(el.closest('div'));
    }
    if (!containerLabel.querySelector('.nuri-field-label') && field.label) {
      const span = document.createElement('span');
      span.className = 'nuri-field-label';
      span.textContent = field.label + (field.required ? ' *' : '');
      containerLabel.prepend(span);
    }
    // Helper text via renderer: long text collapses to teaser + mehr-toggle.
    if (field.helper) containerLabel.insertAdjacentHTML('beforeend', renderNode({ type: 'Helper', props: { text: field.helper } }));
  });
}

function addMessage(html) {
  const msg = document.createElement('div');
  msg.className = 'nuri-demo-msg';
  msg.innerHTML = html;
  history.append(msg);
  msg.scrollIntoView({ behavior: 'smooth', block: 'end' });
  return msg;
}

function openTool(tool) {
  const msg = addMessage('');
  const form = document.createElement('form');
  msg.append(form);
  buildForm(tool, form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const args = valuesToArgs(Object.fromEntries(new FormData(form)), tool?.inputSchema);
    // Silently attach auto values from earlier responses.
    for (const key of autoKeys(tool)) if (autoState[key] !== undefined) args[key] = autoState[key];
    form.querySelectorAll('input, select, button').forEach((el) => (el.disabled = true));
    const pending = addMessage('<div class="nuri-spinner nuri-spinner-md" role="status" aria-label="Loading"></div>');
    try {
      const res = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tool.name, arguments: args }),
      });
      const html = await res.text();
      pending.innerHTML = res.ok ? html : `<div class="nuri-card nuri-card-error nuri-p-md" role="alert">${html}</div>`;
      // Capture auto values from this response for later calls.
      try {
        const data = JSON.parse(pending.querySelector('.nuri-details pre')?.textContent || '{}');
        const wanted = new Set(tools.flatMap((t) => [...autoKeys(t)]));
        const scan = (v) => {
          if (v && typeof v === 'object')
            for (const [k, val] of Object.entries(v)) {
              if (wanted.has(k) && typeof val !== 'object') autoState[k] = val;
              scan(val);
            }
        };
        scan(data);
      } catch { /* no JSON in response, nothing to capture */ }
    } catch (err) {
      pending.innerHTML = `<div class="nuri-card nuri-card-error nuri-p-md" role="alert">${err.message}</div>`;
    }
    pending.scrollIntoView({ behavior: 'smooth', block: 'end' });
  });
}

const res = await fetch('/api/tools');
tools = await res.json();
actionsEl.innerHTML = tools
  .map((t, i) => `<button class="nuri-btn nuri-btn-secondary" data-tool="${i}">${t.title || t.name}</button>`)
  .join('');
actionsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-tool]');
  if (btn) openTool(tools[btn.dataset.tool]);
});
