// Demo client: tool select -> form from inputSchema -> POST /api/call -> render response tree HTML.
const toolSelect = document.querySelector('#tool');
const form = document.querySelector('#form');
const result = document.querySelector('#result');

let tools = [];

function buildForm(tool) {
  form.innerHTML = '';
  const schema = tool?.inputSchema || {};
  const required = new Set(schema.required || []);
  for (const [name, prop] of Object.entries(schema.properties || {})) {
    const label = document.createElement('label');
    label.className = 'nuri-field';
    const span = document.createElement('span');
    span.className = 'nuri-field-label';
    span.textContent = (prop.title || prop.description || name) + (required.has(name) ? ' *' : '');
    const input = document.createElement('input');
    input.className = 'nuri-input';
    input.name = name;
    input.type = prop.type === 'number' || prop.type === 'integer' ? 'number' : 'text';
    label.append(span, input);
    form.append(label);
  }
  if (tool) {
    const btn = document.createElement('button');
    btn.className = 'nuri-btn nuri-btn-primary';
    btn.type = 'submit';
    btn.textContent = tool.title || tool.name;
    form.append(btn);
  }
}

toolSelect.addEventListener('change', () => {
  buildForm(tools.find((t) => t.name === toolSelect.value));
  result.innerHTML = '';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const tool = tools.find((t) => t.name === toolSelect.value);
  const props = tool?.inputSchema?.properties || {};
  const args = {};
  for (const [name, raw] of new FormData(form)) {
    if (raw === '') continue;
    const type = props[name]?.type;
    args[name] = type === 'number' || type === 'integer' ? Number(raw) : type === 'boolean' ? raw === 'true' : raw;
  }
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
