// Maps an MCP tool response to a gen-ui component tree.
// Tree node shape: { type: string, props: object, children: node[] }

// Heuristic mapping by data shape; extend per tool as needed.
export function toolResponseToTree(name, result) {
  const text = (result?.content || [])
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('\n');

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  if (result?.isError) {
    return { type: 'Card', props: { padding: 'md' }, children: [{ type: 'TextLink', props: { label: `Error in ${name}` }, children: [] }] };
  }

  if (Array.isArray(data)) {
    return {
      type: 'Card',
      props: { padding: 'md' },
      children: data.map((item) => ({
        type: 'TextLink',
        props: { label: typeof item === 'object' ? item.title || item.name || JSON.stringify(item) : String(item) },
        children: [],
      })),
    };
  }

  if (data && typeof data === 'object') {
    return {
      type: 'Card',
      props: { padding: 'md' },
      children: Object.entries(data).map(([k, v]) => ({
        type: 'TextLink',
        props: { label: `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}` },
        children: [],
      })),
    };
  }

  return {
    type: 'Card',
    props: { padding: 'md' },
    children: [{ type: 'TextLink', props: { label: text || '(empty response)' }, children: [] }],
  };
}
