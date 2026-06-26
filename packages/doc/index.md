---
title: Home
layout: default
nav_order: 0
---

# Nuri

Generated design-system documentation. Each component page is **build output** —
rendered from the frozen descriptor + token data (`@nuri/spec`) on every build by
`@nuri/doc`'s doc-gen (`pipeline/build.js`), so the docs **cannot drift** from the
spec the way the old hand-written pages did (the generation thesis · decision 66).
`@nuri/spec` emits the data; `@nuri/doc` transforms it → Markdown.

The live `<nuri-button>` in each **Example** is the build-free `<nuri-demo>`
widget (decision 10): one `<template>` → live preview + code, from a single
source, hydrated by `@nuri/prototype`'s factory.

The docs are organized in **three sections matching the cascade**:

- **[Foundations](foundations.html)** — the token vocabulary (colour · dimension ·
  typography). _Generated docs at A4c._
- **[Axes](axes.html)** — the 5 namespace axes (stack · box · palette · interactive ·
  typography). _Generated docs at A4b._
- **[Components](components.html)** — compositions of the axes. Populated now:
  - [Button](generated/components/button.html)
  - [Icon Avatar](generated/components/icon-avatar.html)
  - [Topbar](generated/components/topbar.html)
