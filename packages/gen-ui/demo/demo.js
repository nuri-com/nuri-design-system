// Demo client: chat-style flow. Action list -> form in history -> submit -> response message.
// Auto fields (class 'auto') are hidden and silently filled from earlier responses.
import { schemaToTree, valuesToArgs } from '../mapper.js';
import { renderTree, renderNode } from '../renderer.js';
import { icons } from '../icons.js';

const actionsEl = document.querySelector('#actions');
const history = document.querySelector('#history');
const promptForm = document.querySelector('#prompt');
const promptInput = document.querySelector('#prompt-input');

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
  const card = container.querySelector('.nuri-card');
  card?.classList.add('nuri-demo-card');
  // Tool title as headline + description once as teaser + mehr.
  if (card) {
    card.insertAdjacentHTML('afterbegin',
      renderNode({ type: 'Headline', props: { text: tool.title || tool.name } })
      + (tool.description ? renderNode({ type: 'Helper', props: { text: tool.description } }) : ''));
  }
  const fields = tree.children.filter((n) => n.key);
  const controls = container.querySelectorAll('input, select');
  const seenHelpers = new Set();
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
    // Helper text via renderer: long text collapses to teaser + mehr-toggle. Render each text once.
    if (field.helper && !seenHelpers.has(field.helper)) {
      seenHelpers.add(field.helper);
      containerLabel.insertAdjacentHTML('beforeend', renderNode({ type: 'Helper', props: { text: field.helper } }));
    }
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
// Action list: full-width cards with icon + title + one muted subtitle line.
const iconFor = (t) => (/send|pay|transfer/i.test(t.name) ? 'check' : /history|list|pending/i.test(t.name) ? 'clock' : 'info');
actionsEl.innerHTML = tools
  .map((t, i) => `<button class="nuri-card nuri-p-md nuri-demo-action" data-tool="${i}" style="flex-direction:row;align-items:center;gap:16px;width:100%;text-align:left;color:inherit;font:inherit;cursor:pointer">
    <span style="display:inline-flex;padding:10px;border:1px solid var(--nuri-border);border-radius:12px;color:var(--nuri-primary)">${icons[iconFor(t)]}</span>
    <span style="display:flex;flex-direction:column;gap:2px;min-width:0">
      <span style="font-weight:600">${t.title || t.name}</span>
      <span class="nuri-helper" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.description || ''}</span>
    </span>
  </button>`)
  .join('');

// Prompt: echoes into history and opens a matching tool.
promptForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = promptInput.value.trim();
  if (!q) return;
  promptInput.value = '';
  addMessage(`<div class="nuri-card nuri-bubble nuri-p-md">${q}</div>`);
  const hit = tools.find((t) => (t.title || t.name).toLowerCase().includes(q.toLowerCase())
    || q.toLowerCase().includes((t.title || t.name).toLowerCase()));
  if (hit) openTool(hit);
});
actionsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-tool]');
  if (btn) openTool(tools[btn.dataset.tool]);
});
