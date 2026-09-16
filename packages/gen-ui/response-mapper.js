// Maps an MCP tool response to a gen-ui component tree.
// Tree node shape: { type: string, props: object, children: node[] }

// Long texts (> 80 chars) get collapseAfter so the renderer shows a teaser + mehr-toggle.
const COLLAPSE_AFTER = 80;
const para = (text) => ({ type: 'Paragraph', props: { text, ...(String(text).length > COLLAPSE_AFTER ? { collapseAfter: COLLAPSE_AFTER } : {}) }, children: [] });

const rawDetails = (data) => ({ type: 'Details', props: { summary: 'Developer', text: JSON.stringify(data, null, 2) }, children: [] });

// snake_case key -> human label
const human = (k) => k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// status enum -> { variant, icon, humanized label }; raw enum never rendered
const STATUS_MAP = [
  [/^(completed|success|succeeded|done|settled|active)$/i, ['success', 'check']],
  [/^(pending|processing|in_progress|scheduled|waiting)$/i, ['warn', 'clock']],
  [/^(failed|error|declined|rejected|cancelled|canceled)$/i, ['error', 'x']],
  [/^(warning|attention|review)$/i, ['warn', 'alert']],
];
const badge = (v) => {
  const raw = String(v);
  const m = STATUS_MAP.find(([re]) => re.test(raw));
  const [variant, icon] = m ? m[1] : ['info', 'info'];
  return { type: 'Badge', props: { variant, icon, label: human(raw.toLowerCase()) }, children: [] };
};

const isStatusKey = (k) => /^(status|state|transfer_status|payment_status)$/i.test(k);
const isAmountKey = (k) => /^(amount|total|sum)$/i.test(k);

const field = (k, v, ctx) => {
  if (isStatusKey(k)) return badge(v);
  if (isAmountKey(k) && typeof v === 'number') {
    ctx.amount = { type: 'AmountInput', props: { value: String(v), currency: ctx.currency || 'EUR', autoFocus: true }, children: [] };
    return null;
  }
  if (/^currency$/i.test(k)) {
    ctx.currency = String(v);
    return null;
  }
  return para(`${human(k)}: ${typeof v === 'object' ? JSON.stringify(v) : v}`);
};
const kv = (k, v) => para(`${human(k)}: ${typeof v === 'object' ? JSON.stringify(v) : v}`);
const bubble = (children) => ({ type: 'Card', props: { padding: 'md', bubble: true }, children });

// Heuristic mapping by data shape; extend per tool as needed.
export function toolResponseToTree(name, result) {
  const text = (result?.content || [])
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('\n');

  if (result?.isError) {
    return bubble([para(`Error in ${name}: ${text}`)]);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  // Plain text (not JSON) -> Paragraph
  if (data === null) {
    return bubble([para(text || '(empty response)')]);
  }

  const body = [];

  // Array -> List of Cards
  if (Array.isArray(data)) {
    body.push({
      type: 'List',
      props: {},
      children: data.map((item) => ({
        type: 'ListItem',
        props: {},
        children: [
          typeof item === 'object' && item !== null
            ? {
                type: 'Card',
                props: { padding: 'sm' },
                children: Object.entries(item).map(([k, v]) => kv(k, v)),
              }
            : para(String(item)),
        ],
      })),
    });
  } else {
    // Object -> Card; status becomes Badge, amount+currency becomes hero AmountInput
    const ctx = { currency: Object.keys(data).find((k) => /^currency$/i.test(k)) ? String(data[Object.keys(data).find((k) => /^currency$/i.test(k))]) : undefined, amount: undefined };
    const kids = Object.entries(data).map(([k, v]) => field(k, v, ctx)).filter(Boolean);
    body.push({
      type: 'Card',
      props: { padding: 'md' },
      children: ctx.amount ? [ctx.amount, ...kids] : kids,
    });
  }

  body.push(rawDetails(data));
  return bubble(body);
}
