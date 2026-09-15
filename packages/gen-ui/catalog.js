#!/usr/bin/env node
// Prints the gen-ui component catalog: 8 typed UI components with props.
import catalog from './catalog.json' with { type: 'json' };

for (const c of catalog.components) {
  console.log(`${c.name}`);
  console.log(`  ${c.description}`);
  for (const [prop, meta] of Object.entries(c.props)) {
    const req = meta.required ? 'required' : meta.default !== undefined ? `optional, default ${meta.default}` : 'optional';
    console.log(`  - ${prop}: ${meta.type} (${req})`);
  }
  console.log();
}
