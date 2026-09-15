#!/usr/bin/env node
// Renders a gen-ui component tree to DOM HTML with nuri DS classes.
// Usage: node renderer.js --demo  (prints HTML for fixture tree + response tree)
import { toolResponseToTree } from './response-mapper.js';

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const text = (s) => escapeHtml(s ?? '');

// type -> (props, childrenHtml) -> html. onPress/onChange handlers render as data-action attributes.
// Teaser + native <details> mehr-toggle for long texts; teaser capped at 80 chars.
const collapsibleText = (s, after, cls) => {
  const full = String(s ?? '');
  const cut = Math.min(after, 80);
  if (full.length <= cut) return `<p class="${cls}">${text(full)}</p>`;
  const teaser = full.slice(0, cut).replace(/\s+\S*$/, '');
  return `<details class="nuri-toggle ${cls}"><summary>${text(teaser)}&hellip; <span class="nuri-toggle-more">mehr</span></summary><p class="${cls}">${text(full)}</p></details>`;
};

const renderers = {
  Headline: (p) => `<h2 class="nuri-headline">${text(p.text)}</h2>`,
  Paragraph: (p) => (p.collapseAfter ? collapsibleText(p.text, p.collapseAfter, 'nuri-paragraph') : `<p class="nuri-paragraph">${text(p.text)}</p>`),
  Helper: (p) => collapsibleText(p.text, p.collapseAfter ?? 80, 'nuri-helper'),
  Dropdown: (p) =>
    `<label class="nuri-field">${p.label ? `<span class="nuri-field-label">${text(p.label)}</span>` : ''}` +
    `<select class="nuri-dropdown"${p.disabled ? ' disabled' : ''}>${(p.options || []).map((o) => `<option value="${text(o.value ?? o)}"${(o.value ?? o) === p.value ? ' selected' : ''}>${text(o.label ?? o)}</option>`).join('')}</select></label>`,
  List: (p, kids) => `<ul class="nuri-list">${kids}</ul>`,
  Switch: (p) =>
    `<label class="nuri-switch">${p.label ? `<span class="nuri-field-label">${text(p.label)}</span>` : ''}` +
    `<input type="checkbox" role="switch"${p.value ? ' checked' : ''}${p.disabled ? ' disabled' : ''}/></label>`,
  Details: (p) => `<details class="nuri-details"><summary>${text(p.summary)}</summary><pre>${text(p.text)}</pre></details>`,
  ListItem: (p, kids) => `<li class="nuri-list-item">${kids}</li>`,
  Button: (p, kids) =>
    `<button class="nuri-btn nuri-btn-${p.variant || 'primary'}"${p.disabled ? ' disabled' : ''}${p.loading ? ' data-loading' : ''}>${p.loading ? '…' : text(p.label)}</button>`,
  IconButton: (p) =>
    `<button class="nuri-icon-btn" aria-label="${text(p.accessibilityLabel)}"${p.disabled ? ' disabled' : ''}>${text(p.icon)}</button>`,
  TextLink: (p) =>
    `<button class="nuri-text-link"${p.disabled ? ' disabled' : ''}>${text(p.label)}</button>`,
  InputField: (p) =>
    `<label class="nuri-field">${p.label ? `<span class="nuri-field-label">${text(p.label)}</span>` : ''}` +
    `<input class="nuri-input${p.error ? ' nuri-input-error' : ''}" type="${p.keyboardType === 'numeric' ? 'number' : p.keyboardType === 'email-address' ? 'email' : 'text'}" value="${text(p.value)}" placeholder="${text(p.placeholder)}"/>` +
    `${p.error ? `<span class="nuri-field-error">${text(p.error)}</span>` : ''}</label>`,
  AmountInput: (p) =>
    `<div class="nuri-amount"><input class="nuri-input nuri-amount-input" type="number" value="${text(p.value)}"${p.autoFocus ? ' autofocus' : ''}/><span class="nuri-amount-currency">${text(p.currency)}</span></div>`,
  Card: (p, kids) => `<div class="nuri-card nuri-p-${p.padding || 'md'}${p.bubble ? ' nuri-bubble' : ''}">${kids}</div>`,
  ModalSheet: (p, kids) =>
    p.visible
      ? `<div class="nuri-modal-backdrop"><div class="nuri-modal-sheet">${p.title ? `<div class="nuri-modal-title">${text(p.title)}</div>` : ''}${kids}</div></div>`
      : '',
  Spinner: (p) => `<div class="nuri-spinner nuri-spinner-${p.size || 'md'}" role="status">${p.label ? `<span>${text(p.label)}</span>` : ''}</div>`,
};

export function renderNode(node) {
  const r = renderers[node.type];
  if (!r) return `<!-- unknown component: ${text(node.type)} -->`;
  if (node.props?.class === 'auto') return '';
  const kids = (node.children || []).filter((c) => c.props?.class !== 'auto');
  const normal = kids.filter((c) => c.props?.class !== 'advanced');
  const advanced = kids.filter((c) => c.props?.class === 'advanced');
  let kidsHtml = normal.map(renderNode).join('');
  if (advanced.length) kidsHtml += `<details class="nuri-details"><summary>Erweitert</summary>${advanced.map(renderNode).join('')}</details>`;
  return r(node.props || {}, kidsHtml);
}

export function renderTree(node) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<link rel="stylesheet" href="./gen-ui.css"/>
<title>nuri gen-ui</title>
</head>
<body class="nuri-root">${renderNode(node)}</body>
</html>`;
}

if (typeof process !== 'undefined' && process.argv?.[2] === '--demo') {
  const fixture = {
    type: 'Card',
    props: { padding: 'md' },
    children: [
      { type: 'Headline', props: { text: 'Send money' }, children: [] },
      { type: 'Paragraph', props: { text: 'Fast SEPA transfer.' }, children: [] },
      { type: 'Helper', props: { text: 'SEPA transfers are free of charge within the EU and usually arrive within one business day. Instant transfers cost 0.50 EUR and arrive in seconds. Daily limit: 10,000 EUR per account.', collapseAfter: 80 }, children: [] },
      { type: 'Dropdown', props: { label: 'Account', value: 'main', options: [{ value: 'main', label: 'Main' }, { value: 'savings', label: 'Savings' }] }, children: [] },
      { type: 'List', props: {}, children: [{ type: 'ListItem', props: {}, children: [{ type: 'Card', props: { padding: 'sm' }, children: [{ type: 'Paragraph', props: { text: 'Fee: 0.00 EUR' }, children: [] }] }] }] },
      { type: 'Switch', props: { label: 'Instant', value: true }, children: [] },
      { type: 'TextLink', props: { label: 'Balance: 1,234.56 EUR' }, children: [] },
      { type: 'AmountInput', props: { value: '50', currency: 'EUR' }, children: [] },
      { type: 'InputField', props: { label: 'Recipient', value: '', placeholder: 'IBAN', error: 'Required' }, children: [] },
      { type: 'InputField', props: { label: 'Recipient ID (auto)', value: 'rec_42', class: 'auto' }, children: [] },
      { type: 'Switch', props: { label: 'Urgent', value: false, class: 'advanced' }, children: [] },
      { type: 'InputField', props: { label: 'Note for recipient', value: '', class: 'advanced' }, children: [] },
      { type: 'Button', props: { label: 'Send', variant: 'primary' }, children: [] },
      { type: 'Button', props: { label: 'Cancel', variant: 'secondary' }, children: [] },
      { type: 'Spinner', props: { size: 'sm', label: 'Loading rates' }, children: [] },
      { type: 'IconButton', props: { icon: '?', accessibilityLabel: 'Help' }, children: [] },
      { type: 'ModalSheet', props: { visible: true, title: 'Confirm' }, children: [{ type: 'Paragraph', props: { text: 'Send 50 EUR?' }, children: [] }] },
    ],
  };

  const toolResponse = {
    content: [
      {
        type: 'text',
        text: JSON.stringify([
          { title: 'Groceries -42.10 EUR' },
          { title: 'Salary +2,500.00 EUR' },
        ]),
      },
    ],
  };
  const longToolResponse = {
    content: [
      {
        type: 'text',
        text: 'Your account balance is healthy. Over the last 30 days you spent 1,240.55 EUR on groceries, rent, and subscriptions, while receiving 2,500.00 EUR in salary. Your savings rate is roughly 50 percent, well above the recommended 20 percent.',
      },
    ],
  };
  const longResponseTree = toolResponseToTree('account_summary', longToolResponse);

  const responseTree = toolResponseToTree('list_transactions', toolResponse);
  const textResponseTree = toolResponseToTree('account_summary', { content: [{ type: 'text', text: 'Balance looks fine.' }] });

  console.log(renderTree(fixture));
  console.log('\n<!-- tool response tree: list_transactions -->');
  console.log(renderNode(responseTree));
  console.log('\n<!-- tool response tree: account_summary (long text) -->');
  console.log(renderNode(longResponseTree));
  console.log('\n<!-- tool response tree: account_summary (short text) -->');
  console.log(renderNode(textResponseTree));
}
