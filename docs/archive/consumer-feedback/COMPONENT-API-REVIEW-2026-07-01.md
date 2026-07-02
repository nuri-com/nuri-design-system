> ARCHIVED — external review input, fully acted on (distilled + reconciled into `component-api-target.md` · shipped #114–#119).

# Nuri RN component API / factory architecture review

**Scope:** `nuri-com/nuri-design-system` at `main` `f8a7bfd2e296418e5926e731e5b45f3df52f0bca`  
**Files inspected:**

- `packages/rn/factory/createNuriComponent.tsx`
- `packages/rn/factory/resolve.ts`
- `packages/rn/factory/index.ts`
- `packages/spec/components/schema.ts`
- `packages/spec/components/{button,icon-avatar,icon-button,topbar,tab-bar,tab-bar-item}.ts`

---

## Executive summary

Yes — the current RN factory has crossed from “generic” into **policy soup**.

The visible smell is that every factory-built component receives the same global prop bag:

```ts
accent?: Accent;
disabled?: boolean;
onPress?: () => void;
children?: React.ReactNode;
content?: Partial<Record<Part, React.ReactNode>>;
prefix?: string;
suffix?: string;
icon?: IconName;
label?: string;
accessibilityLabel?: string;
```

That is not just a TypeScript nuisance. It points to a deeper schema issue:

> The descriptor schema describes anatomy and style composition, but it does **not** describe the component’s public content model or allowed behavioral props.

Because the descriptor does not say “this component has these slots / this prop maps to this part / this component supports onPress / this component accepts disabled”, the generic factory has accreted global heuristics:

- lone child part receives `children`,
- multi-leaf anatomy receives same-named props,
- `state` axis magically becomes `selected`,
- any component can receive `onPress`, `disabled`, `accessibilityLabel`,
- `content` can target any global `Part`,
- compound slot harvesting is inferred from `view` parts,
- open positional children are inferred from `open` root.

This is the wrong boundary. The generic renderer should render a **normalized component instance**. It should not be responsible for inventing each component’s public API from anatomy guesses.

My recommendation is **not** pure Path A and not pure Path B. I recommend a third path:

> **Path C: schema-declared public API + generated per-component adapters + small shared renderer.**

Keep the descriptor/factory idea, but split it:

1. **Descriptor schema owns the public API contract**: slots, allowed system props, behavior props, axis props, prop-to-axis mappings.
2. **Codegen emits exact per-component RN wrappers/types**: `ButtonProps`, `IconButtonProps`, `TabBarItemProps`, slots, defaults.
3. **A small shared renderer consumes a normalized internal shape**: selected axes, content map, behavior map, scoped theme.

This keeps the DS update model centralized, avoids shadcn-style consumer ejection as the primary path, and eliminates the current “every component gets every prop” failure.

---

## 1. What is actually wrong today

### 1.1 The global prop bag is the symptom

In `packages/rn/factory/createNuriComponent.tsx`, the shared `NuriBaseProps` includes both truly global concerns and component-specific content concerns:

```ts
export type NuriBaseProps = {
  accent?: Accent;
  disabled?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
  content?: Partial<Record<Part, React.ReactNode>>;
  prefix?: string;
  suffix?: string;
  icon?: IconName;
  label?: string;
  accessibilityLabel?: string;
};
```

Then every component gets:

```ts
export type NuriComponentProps<A extends Axes> = { [K in keyof A]?: A[K] } &
  NuriBaseProps &
  ('state' extends keyof A ? { selected?: boolean } : {});
```

So the type system allows nonsense such as:

```tsx
<Button icon="apple" prefix="Buy" suffix="Pay" label="Wallet" />
<Topbar onPress={() => {}} disabled accessibilityLabel="x" />
<IconAvatar prefix="foo" suffix="bar" />
<TabBarItem content={{ trailing: <X /> }} />
```

Some of these do nothing. Some route into parts if the anatomy happens to contain those names. That is the problem: **public API is inferred by accident from part names**.

---

### 1.2 The schema has no public API layer

`packages/spec/components/schema.ts` has:

```ts
Descriptor = {
  structure: { anatomy, base? };
  variants?;
  defaults?;
  decorative?;
}
```

This is good for style composition, but incomplete for component API.

The schema describes:

- anatomy,
- base namespace composition,
- variant namespace composition,
- defaults,
- decorative accessibility.

It does **not** describe:

- content slots,
- required vs optional slots,
- slot value kind: text, icon name, React node, repeated children,
- which props are accepted,
- which props are style axes vs content vs behavior,
- which behavior props are legal for which part,
- how `selected` maps to the `state` axis,
- whether `disabled` is legal,
- whether `onPress` is legal,
- whether `accessibilityLabel` is required for icon-only mode,
- whether a slot is compound, default, repeated, or positional.

Because this layer is missing, `createNuriComponent.tsx` became the missing schema.

---

### 1.3 Global `Part` union is becoming component API by stealth

`schema.ts` defines one global part vocabulary:

```ts
export type Part =
  | 'root'
  | 'leading'
  | 'prefix'
  | 'label'
  | 'icon'
  | 'center'
  | 'suffix'
  | 'trailing'
  | 'content';
```

This creates two architectural pressures:

1. Adding a component-specific part requires expanding the global schema.
2. Once a part name exists globally, the factory is tempted to expose it globally.

That is how `prefix`, `suffix`, `icon`, and `label` leaked into `NuriBaseProps`.

The schema is treating part names as if they are a fixed platform vocabulary, but most part names are component-local anatomy.

`root`, `icon`, `label`, `leading`, `trailing`, etc. are useful conventions, but they should not automatically become universal public props.

---

### 1.4 `createNuriComponent` currently owns too many policies

The file currently does all of this:

- derives default axis selection,
- bridges `selected` boolean to `state` axis,
- guesses the primary content part,
- implements compound slot marker components,
- harvests children into slots,
- implements default slot routing,
- implements open positional children,
- routes same-name props into same-name parts,
- renders RN `View` / `Text` / `Pressable` / `NuriIcon`,
- handles foreground inheritance,
- handles decorative accessibility hiding,
- handles press state and disabled state,
- handles prop-accent scoping,
- computes icon dimension from box width/height.

A generic renderer can own the last few rendering mechanics. It should not own the public API heuristics.

The bad seam is here:

```ts
for (const child of anatomy.children) {
  const provided = (props as Record<string, unknown>)[child.name];
  if (provided !== undefined && content[child.name] === undefined) {
    content[child.name] = provided as React.ReactNode;
  }
}
```

That line means:

> If a part name exists, maybe it is a prop.

That is the architectural debt in one sentence.

---

## 2. What the descriptor schema should separate

Today, anatomy is doing three jobs:

1. internal render tree,
2. style target graph,
3. public content API.

Those need to be split.

A healthier descriptor has at least these layers:

```ts
type ComponentDescriptor = {
  anatomy: Anatomy;          // internal parts and render elements
  styles: StyleRecipe;       // namespaces per part / per axis value
  publicApi: PublicApiSpec;  // props, slots, behavior affordances
};
```

Or using current names:

```ts
type Descriptor = {
  structure: {
    anatomy: PartAnatomy;
    base?: PartMap;
  };
  variants?: Variants;
  defaults?: Defaults;
  decorative?: boolean;

  api: ComponentApi;
};
```

The new `api` section is the missing piece.

---

## 3. Recommended schema direction

### 3.1 Descriptor-local parts, not global public part props

Move toward descriptor-local part inference.

Instead of the global `Part` union controlling every component, define descriptors with literal part IDs and infer them:

```ts
const iconButtonDescriptor = defineComponent({
  name: 'icon-button',
  anatomy: {
    root: { el: 'view', parts: {
      prefix: { el: 'text' },
      icon: { el: 'icon' },
      suffix: { el: 'text' },
    }},
  },
  // ...
});
```

`defineComponent()` can infer:

```ts
type Parts = 'root' | 'prefix' | 'icon' | 'suffix';
```

The emitted/generated RN wrapper can then get exact slot types.

If full TS inference is too big a step immediately, keep the current schema runtime shape but add codegen validation that the public API only references declared anatomy parts.

---

### 3.2 Add a `publicApi` / `api` section

Example shape:

```ts
type ComponentApi = {
  axes?: {
    [axisName: string]: {
      prop?: string;
      default?: string;
    };
  };

  props?: {
    accent?: { kind: 'theme-scope' };
    disabled?: { kind: 'behavior'; target: PartId; requiresInteractive?: true };
    onPress?: { kind: 'event'; target: PartId; event: 'press'; requiresInteractive?: true };
    accessibilityLabel?: { kind: 'a11y'; target: PartId };
  };

  propMaps?: {
    selected?: {
      kind: 'axis-boolean';
      axis: 'state';
      true: 'selected';
      false: 'unselected';
    };
  };

  slots?: {
    default?: SlotSpec;
    [slotName: string]: SlotSpec | undefined;
  };
};
```

Slot spec:

```ts
type SlotSpec = {
  part: PartId;
  kind: 'text' | 'icon-name' | 'node' | 'region' | 'children';
  required?: boolean;
  multiple?: boolean;
};
```

Then public types are generated from the descriptor, not guessed by the renderer.

---

## 4. Path A analysis: composition-only factory components

Your Path A:

> Components built by the factory do not accept content as props. They work only by composition. Style props like `variant` / `size` remain props. A small set of declared system props such as aria, event handler, accent can be supported, but the descriptor declares which.

I mostly agree.

### What I would keep from Path A

- No universal `prefix` / `suffix` / `icon` / `label` props.
- `variant`, `size`, `accent`, etc. remain props when they are style/theme axes.
- Behavior props only when declared: `onPress`, `disabled`, `accessibilityLabel`.
- Content enters through composition/slots, not arbitrary same-name props.
- The descriptor declares the public API, not the factory.

### Important nuance: `children` is still okay as a slot

In React, `children` is technically a prop, but architecturally it is composition.

So I would not ban `children`. I would ban **content-as-named-props** unless explicitly declared.

Good:

```tsx
<Button>Send</Button>
```

because the descriptor can declare:

```ts
slots: {
  default: { part: 'label', kind: 'text' }
}
```

Bad:

```tsx
<IconButton prefix="Buy" icon="apple" suffix="Pay" />
```

unless `prefix/icon/suffix` are deliberately declared public props. I would prefer composition for that component.

---

### Example: Button under Path A

Descriptor declares:

```ts
api: {
  axes: {
    variant: { prop: 'variant', default: 'soft' },
    size: { prop: 'size', default: 'md' },
  },
  props: {
    accent: { kind: 'theme-scope' },
    onPress: { kind: 'event', target: 'root', event: 'press', requiresInteractive: true },
    disabled: { kind: 'behavior', target: 'root', requiresInteractive: true },
    accessibilityLabel: { kind: 'a11y', target: 'root' },
  },
  slots: {
    default: { part: 'label', kind: 'text' },
  },
}
```

Public API:

```tsx
<Button variant="solid" size="md" onPress={pay}>Send</Button>
```

No `icon`, `prefix`, `suffix`, `label`, `content`.

---

### Example: IconButton under Path A

Prefer compound slots:

```tsx
<IconButton variant="soft" size="md" accessibilityLabel="Apple Pay">
  <IconButton.Prefix>Buy Bitcoin</IconButton.Prefix>
  <IconButton.Icon name="apple" />
  <IconButton.Suffix>Pay</IconButton.Suffix>
</IconButton>
```

Or flat exported slot components if dot notation is undesirable:

```tsx
<IconButton variant="soft" size="md" accessibilityLabel="Apple Pay">
  <IconButtonPrefix>Buy Bitcoin</IconButtonPrefix>
  <IconButtonIcon name="apple" />
  <IconButtonSuffix>Pay</IconButtonSuffix>
</IconButton>
```

Descriptor declares exactly these slots. The renderer no longer scans anatomy children and looks for same-name props.

---

### Example: TabBarItem under Path A

Current API:

```tsx
<TabBarItem icon="card" label="Wallet" selected={active === 'wallet'} onPress={...} />
```

Composition API:

```tsx
<TabBarItem selected={active === 'wallet'} onPress={...}>
  <TabBarItem.Icon name="card" />
  <TabBarItem.Label>Wallet</TabBarItem.Label>
</TabBarItem>
```

`selected` remains okay if declared as a prop map:

```ts
selected: {
  kind: 'axis-boolean',
  axis: 'state',
  true: 'selected',
  false: 'unselected',
}
```

The current magic rule:

```ts
'state' extends keyof A ? { selected?: boolean } : {}
```

should move into descriptor data. Not every future `state` axis necessarily means public `selected`.

---

## 5. React Slot pattern: useful, but limited

### What Radix Slot actually solves

Radix Slot is documented as:

> “Merges its props onto its immediate child” and is commonly used to implement `asChild`.

That is useful for polymorphic ownership:

```tsx
<Button asChild>
  <Link href="/pay">Pay</Link>
</Button>
```

The button contributes behavior/style props, but the child owns the actual rendered element.

### What it does not solve

It does not solve Nuri’s internal anatomy problem by itself.

Nuri needs to map:

```txt
component API → named parts → style scopes → RN render tree
```

Radix Slot maps:

```txt
parent props → one immediate child element
```

That is a smaller problem.

### React caution

React’s own docs warn that `cloneElement` and `Children` are uncommon and can lead to fragile code. They suggest alternatives like render props, context, and explicit components.

Current `Topbar` slot harvesting already uses `React.Children` and marker components. That is acceptable in a narrow compound-component layer, but I would not expand this into a generalized “inspect any children and guess their role” engine.

### Recommended use in Nuri

Use slot/compound components for declared regions:

```tsx
<Topbar>
  <TopbarLeading>...</TopbarLeading>
  <TopbarCenter>...</TopbarCenter>
  <TopbarTrailing>...</TopbarTrailing>
</Topbar>
```

Possibly support `asChild` only for components where polymorphic host ownership is explicitly needed. In RN, this is less natural than web because host component semantics differ (`Pressable`, `Text`, `View`, gesture handlers), so treat it as an advanced escape hatch, not the foundation.

---

## 6. Path B analysis: kill factory and codegen components

Your Path B:

> Kill the factory and create components through codegen from descriptors. Maybe shadcn-style: consumer adds generated component to repo and owns it.

There are two different ideas here:

1. **Codegen components inside Nuri’s RN package.**
2. **shadcn-style copy/eject into the consuming app.**

They have very different tradeoffs.

---

### 6.1 Codegen inside `@nuri/rn`

This is attractive.

Benefits:

- exact per-component props,
- readable generated wrappers,
- no universal `NuriBaseProps`,
- no generic content routing heuristics,
- code review can inspect concrete component output,
- descriptor remains the source of truth,
- consumers still get centralized DS updates.

This is essentially my recommended Path C.

---

### 6.2 shadcn-style consumer-owned generated code

shadcn’s model is useful when:

- consumers want ownership over component source,
- local app customization is more valuable than central updates,
- components are web/app-level implementation recipes rather than strict DS contracts.

But Nuri’s stated model is different:

- one agnostic source of truth,
- projected to web/RN,
- RN production target,
- generated output committed and validated,
- central update semantics matter.

If Nuri makes consumer-owned generated components the primary path, you create hard questions:

- How do consumers receive DS fixes?
- Are generated components overwritten or patched?
- How does the DS know what version/ejection state a consumer has?
- How are design token/schema migrations applied?
- How do you test web/RN parity once consumers edit their copies?

That is a real ejection model, not just codegen.

### Recommendation on shadcn-style

Do **not** make shadcn-style ejection the default.

A useful optional model could be:

```txt
@nuri/rn package components = canonical, updateable
nuri eject Button = copy generated Button into app, version-stamped, consumer owns divergence
```

But ejection should be explicit and irreversible-ish:

```txt
Ejected components no longer auto-receive DS behavior fixes.
```

That is a product decision, not an implementation detail.

---

## 7. Recommended Path C: generated adapters + shared renderer

This is the path I recommend.

### Core idea

Split the current generic factory into two layers:

```txt
Generated per-component adapter
  - exact props
  - exact slots
  - exact prop maps
  - behavior prop validation
  - normalizes input

Shared renderer
  - receives normalized descriptor instance
  - renders anatomy
  - applies resolved styles/theme/interaction
```

Current `createNuriComponent` mixes both. Separate them.

---

### 7.1 Normalized internal input

The shared renderer should consume something like:

```ts
type NormalizedInstance = {
  descriptor: Descriptor;
  selection: Record<string, string>;
  content: Record<string, React.ReactNode>;
  behavior: {
    disabled?: boolean;
    onPress?: () => void;
    accessibilityLabel?: string;
  };
  themeScope?: {
    accent?: Accent;
  };
};
```

It should not know whether `content.icon` came from:

- `<IconButtonIcon name="apple" />`,
- a `children` default slot,
- a declared shorthand prop,
- generated code.

That is adapter work.

---

### 7.2 Generated Button adapter

Generated output could look conceptually like:

```tsx
export type ButtonProps = {
  variant?: 'solid' | 'soft' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  accent?: Accent;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  children?: React.ReactNode;
};

export function Button(props: ButtonProps) {
  return renderNuriComponent({
    descriptor: buttonDescriptor,
    selection: {
      variant: props.variant ?? 'soft',
      size: props.size ?? 'md',
    },
    content: {
      label: props.children,
    },
    behavior: {
      disabled: props.disabled,
      onPress: props.onPress,
      accessibilityLabel: props.accessibilityLabel,
    },
    themeScope: {
      accent: props.accent,
    },
  });
}
```

No `prefix`, no `suffix`, no `icon`, no `label`, no `content` escape hatch.

---

### 7.3 Generated IconButton adapter

```tsx
export type IconButtonProps = {
  variant?: 'solid' | 'soft' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  accent?: Accent;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  children?: React.ReactNode;
};

export function IconButton(props: IconButtonProps) {
  const slots = collectDeclaredSlots(props.children, iconButtonSlots);

  return renderNuriComponent({
    descriptor: iconButtonDescriptor,
    selection: {
      variant: props.variant ?? 'soft',
      size: props.size ?? 'md',
    },
    content: slots,
    behavior: {
      disabled: props.disabled,
      onPress: props.onPress,
      accessibilityLabel: props.accessibilityLabel,
    },
    themeScope: { accent: props.accent },
  });
}

export const IconButtonPrefix = makeSlot('prefix');
export const IconButtonIcon = makeIconSlot('icon');
export const IconButtonSuffix = makeSlot('suffix');
```

The key is that slot collection is generated from the descriptor’s declared API, not inferred from every anatomy child.

---

### 7.4 Generated TabBarItem adapter

```tsx
export type TabBarItemProps = {
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  children?: React.ReactNode;
};

export function TabBarItem(props: TabBarItemProps) {
  const slots = collectDeclaredSlots(props.children, tabBarItemSlots);

  return renderNuriComponent({
    descriptor: tabBarItemDescriptor,
    selection: {
      state: props.selected ? 'selected' : 'unselected',
    },
    content: slots,
    behavior: {
      disabled: props.disabled,
      onPress: props.onPress,
      accessibilityLabel: props.accessibilityLabel,
    },
  });
}
```

`selected` exists because the descriptor says it exists, not because any axis named `state` gets magic treatment.

---

## 8. What to do with `content` escape hatch

Current API:

```ts
content?: Partial<Record<Part, React.ReactNode>>;
```

This is useful for tests and migration, but it is too broad for public API.

Recommended decision:

- Remove `content` from public component props.
- Keep an internal-only escape hatch if necessary:

```ts
__content?: Partial<Record<PartId, React.ReactNode>>;
```

or a dev/test helper:

```ts
renderDescriptorForTest(descriptor, { content, selection })
```

Public consumers should use declared slots/composition.

---

## 9. What to do with `onPress`, `disabled`, and a11y props

These should be descriptor-declared.

Current problem: every component gets them.

Better:

```ts
api: {
  behavior: {
    pressable: {
      target: 'root',
      props: ['onPress', 'disabled', 'accessibilityLabel'],
    },
  },
}
```

Then:

- `Button` accepts `onPress` / `disabled`.
- `IconButton` accepts `onPress` / `disabled`.
- `TabBarItem` accepts `onPress` / maybe `disabled` if declared.
- `Topbar` does not accept `onPress` unless declared.
- `IconAvatar` does not accept `onPress` or `disabled`.

Also add validation:

> If `api.behavior.pressable` targets a part, that part must have `interactive` or a deliberate pressable behavior declaration.

Right now `interactive` controls style effects, but `onPress` exists independently. That relationship should be explicit.

---

## 10. What to do with `accent`

`accent` is a legit small global-ish prop, but still worth declaring.

Two options:

### Option 1: accent universally allowed for all DS components

Then keep it in a shared `ThemeScopeProps` type.

```ts
type ThemeScopeProps = {
  accent?: Accent;
};
```

### Option 2: descriptor declares whether accent scope is allowed

```ts
api: {
  themeScope: { accent: true }
}
```

I prefer Option 2 for purity, but Option 1 is acceptable because accent scoping is semantically uniform and already established.

Even if accent is global, do not use that to justify global content props.

---

## 11. What to do with the current compound slot implementation

The current Topbar compound slot mechanism is directionally good:

```tsx
<Topbar>
  <TopbarLeading>...</TopbarLeading>
  <TopbarCenter>...</TopbarCenter>
  <TopbarTrailing>...</TopbarTrailing>
</Topbar>
```

But the trigger is wrong:

```ts
const slotParts = anatomy.children.filter((c) => c.el === 'view')
```

That says:

> Every non-root `view` child is a public slot region.

That is another anatomy-as-public-API heuristic.

Better:

```ts
api: {
  slots: {
    leading: { part: 'leading', kind: 'region' },
    center: { part: 'center', kind: 'region' },
    trailing: { part: 'trailing', kind: 'region', default: true },
  }
}
```

Now public slots are explicit. A future internal `view` wrapper does not accidentally become public API.

---

## 12. Design decision matrix

| Question | Recommendation |
|---|---|
| Should every component get all content props? | **No. Remove global content props.** |
| Should content be passed by props? | **No, default to composition/declared slots.** |
| Should `children` be allowed? | **Yes, but only as a declared default slot.** |
| Should `prefix` / `suffix` / `icon` / `label` exist globally? | **No. Component-specific only, preferably slots.** |
| Should `selected` be magic for any `state` axis? | **No. Descriptor-declared prop map.** |
| Should `onPress` / `disabled` be global? | **No. Descriptor-declared behavior.** |
| Should `accent` be global? | **Maybe. It is the only defensible shared prop, but still cleaner if declared.** |
| Should `content` remain public? | **No. Internal/test escape hatch only.** |
| Should factory be killed entirely? | **No, not yet. Split adapter from renderer first.** |
| Should generated components be copied into consumer repo by default? | **No. Keep canonical generated components inside `@nuri/rn`; optional eject later.** |

---

## 13. Migration plan

### Phase 1 — Stop the bleeding: declare public APIs in descriptors

Add an `api` section to each descriptor without changing runtime yet.

Example for Button:

```ts
api: {
  axes: ['variant', 'size'],
  themeScope: { accent: true },
  behavior: {
    pressable: { target: 'root', props: ['onPress', 'disabled', 'accessibilityLabel'] },
  },
  slots: {
    default: { part: 'label', kind: 'text' },
  },
}
```

Add a guard:

- every slot target exists in anatomy,
- every behavior target exists in anatomy,
- every prop map references an existing axis/value,
- every declared axis exists in `variants`,
- no undeclared public content prop is generated.

---

### Phase 2 — Generate exact props/types from `api`

Generate `packages/rn/generated/components/*.tsx` or `*.ts` wrappers.

Do **not** hand-write every component yet. Let codegen produce the exact adapter.

Goal:

```ts
ButtonProps       // no icon/prefix/suffix/label
IconAvatarProps   // has icon/default icon slot only, no prefix/suffix
TopbarProps       // has children/regions only, no onPress unless declared
TabBarItemProps   // has selected/onPress and declared slots only
```

---

### Phase 3 — Shrink `createNuriComponent` into `renderDescriptorInstance`

Replace the public generic factory with an internal renderer:

```ts
renderDescriptorInstance({
  descriptor,
  selection,
  content,
  behavior,
  themeScope,
})
```

Move all public prop parsing out of the renderer.

Delete from renderer:

- primaryPart guessing,
- same-name prop routing,
- selected bridge,
- compound slot inference from `view` parts,
- public `content` escape hatch handling.

Keep in renderer:

- render anatomy,
- apply style resolution/baked recipe,
- foreground scope,
- Pressable mechanics for declared behavior,
- RN `Text` / `View` / `NuriIcon` rendering.

---

### Phase 4 — Composition-first API migration

Introduce slot APIs while temporarily supporting old props behind deprecation warnings if needed.

For example:

```tsx
// preferred
<IconButton>
  <IconButtonIcon name="apple" />
</IconButton>

// deprecated bridge, if needed briefly
<IconButton icon="apple" />
```

Given the repo states `@nuri/rn` has no external consumer, you may skip deprecation and break directly.

---

### Phase 5 — Descriptor-local parts

Once API generation is in place, start removing global part pressure.

Target:

```ts
PartId = string literal inferred per descriptor
```

Global conventions may remain as helpers, but not as the universal public vocabulary.

---

## 14. How this interacts with Arc 2 geometry bake

This API cleanup pairs naturally with the geometry bake work.

Arc 2 wants generated static recipes per component. The API cleanup wants generated per-component adapters. Those can share the same codegen pass:

```txt
descriptor
  → generated static geometry recipe
  → generated public adapter/types/slots
  → shared runtime renderer
```

This is better than first baking geometry into the current spaghetti factory and then unwinding the API later.

Recommended order:

1. Add descriptor `api` section.
2. Generate exact wrappers/types.
3. Introduce baked geometry recipe.
4. Make generated wrappers call the small renderer with baked recipe + normalized content.

That avoids preserving the current factory as the center of the system.

---

## 15. Final recommendation

### The radical decision I would make

> **Nuri descriptors must declare both style anatomy and public component API. Anatomy alone is not a public API.**

Concrete decisions:

1. **Remove global content props from `NuriBaseProps`.**
   - No global `prefix`, `suffix`, `icon`, `label`.

2. **Remove public `content?: Partial<Record<Part, ReactNode>>`.**
   - Keep only internal/test escape hatch if needed.

3. **Descriptor `api` declares slots and behavior props.**
   - Default slot, named slots, repeated children, text/icon/node kind.
   - `onPress`, `disabled`, `accessibilityLabel` only where declared.

4. **Replace “part name implies prop” with generated adapters.**
   - Part names are internal style/anatomy targets unless surfaced by `api.slots`.

5. **Move `selected` bridge into descriptor data.**
   - No hardcoded `state` axis magic.

6. **Keep a shared renderer, but stop making it a public prop factory.**
   - The renderer renders normalized instances.
   - Per-component wrappers normalize public props/slots.

7. **Do not adopt shadcn-style consumer-owned generated code as default.**
   - Keep generated components canonical inside `@nuri/rn`.
   - Consider explicit eject later only as an advanced escape hatch.

### Verdict on your paths

- **Path A is directionally right**: content should be composition/slots; style axes stay props; behavior props must be declared.
- **Path B is too extreme as stated** if it means consumer-owned generated components by default.
- **Best path is C**: codegen exact component adapters from richer descriptors, keep a small shared renderer, and optionally offer shadcn-style eject later.

This addresses the real debt without throwing away the useful part of the factory: the renderer and style-resolution machinery.

The factory should stop being the place where the component API is invented. The descriptor should own that contract; codegen should make it exact; the renderer should just render.

---

## References / research notes

- Current Nuri source:
  - `packages/rn/factory/createNuriComponent.tsx`: global `NuriBaseProps`, selected bridge, slot/content routing, same-name prop routing.
  - `packages/spec/components/schema.ts`: descriptor lacks public API/content model; global `Part` union.
  - `packages/spec/components/icon-button.ts`: component-specific prefix/icon/suffix anatomy currently leaks into global props.
  - `packages/spec/components/topbar.ts`: current compound slot use case.
  - `packages/spec/components/tab-bar-item.ts`: current `state` axis → `selected` boolean bridge use case.
- Radix Slot docs: Slot “merges its props onto its immediate child” and is useful for `asChild`. This is useful for polymorphic host ownership, not as a full anatomy/content-routing system.
- React docs warn that `cloneElement` and `Children` are uncommon and can lead to fragile code; use explicit components/context/render props where possible. This supports keeping child inspection narrow and descriptor-declared.
- shadcn/ui docs/registry model: useful for distributing copy-owned components and registries, but that creates an ejection/update-propagation contract. It should not be the default for Nuri’s centralized cross-platform design-system projection.
