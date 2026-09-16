#!/usr/bin/env node
// Flow definitions: multi-step user journeys built from the curated tools.
// Each field carries `arg`: the exact tool argument it maps to (field -> tool-argument mapping).
import { tools, common } from './content.js';

export const flows = {
  account_setup: {
    title: 'Set up your account',
    tool: 'create_account',
    steps: [
      {
        title: 'Your email',
        fields: [
          { key: 'email', arg: 'email', ...tools.create_account.fields.email, required: true },
        ],
      },
      {
        title: 'Your country',
        fields: [
          { key: 'country', arg: 'country', ...tools.create_account.fields.country, required: true },
        ],
      },
    ],
    cta: tools.create_account.cta,
  },

  card_and_euro_account: {
    title: 'Get your card and euro account',
    tool: 'provision_virtual_card_and_bank_account',
    oneTap: true,
    progress: [
      { key: 'check', label: 'Checking your account' },
      { key: 'card', label: 'Creating your virtual card' },
      { key: 'euro', label: 'Opening your euro account' },
      { key: 'done', label: 'All set' },
    ],
    cta: tools.provision_virtual_card_and_bank_account.cta,
    steps: [],
  },

  send_money: {
    title: 'Send money',
    tool: 'payouts',
    steps: [
      {
        title: 'Who and how much',
        fields: [
          { key: 'amount', arg: 'amount', ...tools.payouts.fields.amount, required: true },
          { key: 'iban', arg: 'iban', ...tools.payouts.fields.iban, required: true },
          { key: 'recipient_name', arg: 'recipient_name', ...tools.payouts.fields.recipient_name, required: true },
        ],
      },
      {
        title: 'Your quote',
        kind: 'quote',
        lines: [
          { key: 'you_send', label: 'You send' },
          { key: 'they_get', label: 'They receive' },
          { key: 'fee', label: 'Our fee' },
          { key: 'arrival', label: 'Arrives' },
        ],
      },
      {
        title: 'Confirm',
        kind: 'confirm',
        cta: 'Confirm and send',
        cancel: common.cancel,
      },
    ],
    cta: tools.payouts.cta,
  },
};

function printFlow(key, flow) {
  console.log(`\n=== ${flow.title} (${key}) -> tool: ${flow.tool}${flow.oneTap ? ' [one-tap]' : ''}`);
  if (flow.progress) {
    console.log('  progress:');
    for (const p of flow.progress) console.log(`    ${p.key}: "${p.label}"`);
  }
  for (const [i, step] of (flow.steps || []).entries()) {
    console.log(`  step ${i + 1}: "${step.title}"${step.kind ? ` (${step.kind})` : ''}`);
    for (const f of step.fields || []) {
      console.log(`    field "${f.label}" -> ${flow.tool}.${f.arg}`);
      console.log(`      placeholder: "${f.placeholder || ''}"${f.help ? `  help: "${f.help}"` : ''}`);
    }
    for (const l of step.lines || []) console.log(`    line "${l.label}" (${l.key})`);
    if (step.cta) console.log(`    cta: "${step.cta}"`);
  }
  console.log(`  cta: "${flow.cta}"`);
}

if (process.argv.includes('--demo')) {
  console.log('Nuri gen-ui flows');
  for (const [key, flow] of Object.entries(flows)) printFlow(key, flow);
}
