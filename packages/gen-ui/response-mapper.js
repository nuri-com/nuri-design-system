// Maps an MCP tool response to a gen-ui component tree.
// Tree node shape: { type: string, props: object, children: node[] }

const rawDetails = (data) => ({ type: 'Details', props: { summary: 'Raw JSON', text: JSON.stringify(data, null, 2) }, children: [] });

// Heuristic mapping by data shape; extend per tool as needed.
export function toolResponseToTree(name, result) {
  const text = (result?.content || [])
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('\n');

  if (result?.isError) {
    return { type: 'Card', props: { padding: 'md' }, children: [{ type: 'Paragraph', props: { text: `Error in ${name}: ${text}` }, children: [] }] };
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  // Plain text (not JSON) -> Paragraph
  if (data === null) {
    return { type: 'Paragraph', props: { text: text || '(empty response)' }, children: [] };
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
                children: Object.entries(item).map(([k, v]) => ({
                  type: 'Paragraph',
                  props: { text: `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}` },
                  children: [],
                })),
              }
            : { type: 'Paragraph', props: { text: String(item) }, children: [] },
        ],
      })),
    });
  } else {
    // Object -> Card with one Paragraph per entry
    body.push({
      type: 'Card',
      props: { padding: 'md' },
      children: Object.entries(data).map(([k, v]) => ({
        type: 'Paragraph',
        props: { text: `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}` },
        children: [],
      })),
    });
  }

  body.push(rawDetails(data));
  return { type: 'Card', props: { padding: 'md' }, children: body };
}
