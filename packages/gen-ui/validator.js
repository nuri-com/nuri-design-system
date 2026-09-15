// Validates a gen-ui tree against the component catalog.
// Tree node shape: { type: 'ComponentName', props: { ... }, children: [node | string] }
// Rejects unknown components, unknown props, and missing required props.
import catalog from './catalog.json' with { type: 'json' };

const components = new Map(catalog.components.map((c) => [c.name, c]));

function validateNode(node, path) {
  const errors = [];
  if (typeof node === 'string') return errors; // text leaf
  if (!node || typeof node !== 'object' || typeof node.type !== 'string') {
    errors.push(`${path}: invalid node (expected { type, props?, children? })`);
    return errors;
  }
  const component = components.get(node.type);
  if (!component) {
    errors.push(`${path}: unknown component "${node.type}"`);
  } else {
    const knownProps = component.props;
    const props = node.props ?? {};
    for (const key of Object.keys(props)) {
      if (!(key in knownProps)) {
        errors.push(`${path} <${node.type}>: unknown prop "${key}"`);
      }
    }
    for (const [key, meta] of Object.entries(knownProps)) {
      if (meta.required && meta.type !== 'ReactNode' && !(key in props)) {
        errors.push(`${path} <${node.type}>: missing required prop "${key}"`);
      }
    }
  }
  const children = node.children ?? [];
  if (!Array.isArray(children)) {
    errors.push(`${path} <${node.type}>: children must be an array`);
    return errors;
  }
  children.forEach((child, i) => {
    errors.push(...validateNode(child, `${path} <${node.type}>.children[${i}]`));
  });
  return errors;
}

export function validate(tree) {
  return validateNode(tree, 'root');
}

// CLI: node validator.js '<json-tree>'  → prints errors, exit 1 if invalid
if (import.meta.url === `file://${process.argv[1]}`) {
  const input = process.argv[2];
  if (!input) {
    console.error('usage: node validator.js \'<json-tree>\'');
    process.exit(2);
  }
  const errors = validate(JSON.parse(input));
  if (errors.length) {
    for (const e of errors) console.error(e);
    process.exit(1);
  }
  console.log('valid');
}
