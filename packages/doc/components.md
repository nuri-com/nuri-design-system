---
title: Components
layout: default
nav_order: 3
has_children: true
---

# Components

The frozen descriptor components, **generated** from `@nuri/spec` on every build
by `@nuri/doc`'s doc-gen (`pipeline/build.js`) — each page is build output,
rendered from the component's descriptor + token data, so it **cannot drift** from
the spec the way the old hand-written pages did (the generation thesis · decision 66).

Each **Example** is a live `<nuri-demo>` (decision 10): one `<template>` → live
preview + code, hydrated by `@nuri/prototype`'s build-free factory.

> The active set is exactly **{ the 3 descriptor recipes }** (button · icon-avatar ·
> topbar · the convergence coherence line). The pre-axes hand component pages are
> frozen under `archive/` (the rebuild-as-descriptor regen spec); new components
> land here as descriptors, one at a time (convergence phase 6).
