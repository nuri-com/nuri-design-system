// Maps an MCP tool response to a gen-ui component tree.
// Tree node shape: { type: string, props: object, children: node[] }

// Long texts (> 80 chars) get collapseAfter so the renderer shows a teaser + mehr-toggle.
const COLLAPSE_AFTER = 80;
const para = (text) => ({ type: 'Paragraph', props: { text, ...(String(text).length > COLLAPSE_AFTER ? { collapseAfter: COLLAPSE_AFTER } : {}) }, children: [] });

const rawDetails = (data) => ({ type: 'Details', props: { summary: 'Raw JSON', text: JSON.stringify(data, null, 2) }, children: [] });

// Heuristic mapping by data shape; extend per tool as needed.
export function toolResponseToTree(name, result) {
  const text = (result?.content || [])
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('\n');

  if (result?.isError) {
    return { type: 'Card', props: { padding: 'md' }, children: [para(`Error in ${name}: ${text}`)] };
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  // Plain text (not JSON) -> Paragraph
  if (data === null) {
    return para(text || '(empty response)');
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
                children: Object.entries(item).map(([k, v]) => para(`${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)),
              }
            : para(String(item)),
        ],
      })),
    });
  } else {
    // Object -> Card with one Paragraph per entry
    body.push({
      type: 'Card',
      props: { padding: 'md' },
      children: Object.entries(data).map(([k, v]) => para(`${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)),
    });
  }

  body.push(rawDetails(data));
  return { type: 'Card', props: { padding: 'md' }, children: body };
}
