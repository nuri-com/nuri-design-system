# nuri-com/nuri-design-system: Task-Review und Backlog-Reset

Archiv vor der Schließung: **7 Issues**, **1 offene PRs**. Quellstand `251ca3af413665fcf6a4f49da3337aee4b0838c7`; Sammlung 2026-09-07T15:51:21.904026+00:00.

## Entscheidung und Grenzen

Emin hat den gleichen sauberen Neustart wie bei nuri-expo freigegeben: alle alten Issues nach Sicherung schließen, neue Tasks später bewusst schneiden. **Schließgrund NOT_PLANNED / Backlog-Reset, nicht umgesetzt oder behoben.** Bestehende PRs bleiben unverändert. Keine neue Implementierung, keine Merge-/Deployment-Freigabe, keine Änderung von Projektrollen oder produktiven Systemen.

Funds-, Security-, Recovery- und Abnahmelücken bleiben fachlich bestehen. Die Empfehlungen unten sind die Grundlage für neue Tasks. Statische Quellen-/PR-Prüfung ist keine Laufzeit-, Geräte- oder Geldfluss-Abnahme. Historische PR-Beschreibungen und Kommentare sind Belege ihres damaligen Stands, keine aktuellen Garantien.

[Vollständige Original-Issues, Kommentare und Reviews](tasks.json) · [Alle PR-Snapshots und Zuordnungen](prs.json)

**Ausführungsstand: Archiv gesichert; Schließungen noch nicht als abgeschlossen behauptet.**

## Alle offenen PRs im Snapshot

### PR [#210](https://github.com/nuri-com/nuri-design-system/pull/210) — docs(delivery): add Nuri claim instructions

Head `d964c117bacb9fa8c0e39b501f99b4040b4ee287`; Draft: False; 2 Dateien; Mergeability: MERGEABLE; Review: REVIEW_REQUIRED.

Reiner Delivery-Dokumentations-PR, keine Zuordnung zu den sieben lokalen Design-System-Issues. Der vollständige PR-Text nennt ausschließlich nuri-com/nuri-infra#95 als Tracking-Auftrag; closingIssuesReferences ist leer. Der gelesene Diff verändert nur AGENTS.md und fügt CLAUDE.md mit @AGENTS.md-Import hinzu. Quelle: https://github.com/nuri-com/nuri-design-system/pull/210 ; geprüfter Head d964c117bacb9fa8c0e39b501f99b4040b4ee287.

PR unverändert offen lassen. Snapshot: MERGEABLE, aber BLOCKED und REVIEW_REQUIRED; fünf gespeicherte CI-Checks erfolgreich, keine abgelegte Freigabe. Vor einem späteren Merge unabhängige Exact-Head-/Sentinel-Freigabe sowie Aktualität gegenüber dem kanonischen Infra-Vertrag prüfen. Die Claim-Regeln sind eine projektfeldbasierte Koordination, keine atomare Sperre; parallele Claim-Übernahmen werden allein durch Write-plus-Readback nicht allgemein ausgeschlossen. Keine GitHub-Mutation, kein Merge und keine neue CI-, Runtime-, Visual-QA- oder Deployment-Bestätigung in diesem Audit.

Tasks: Kein eindeutiger eigener Task. Extern: https://github.com/nuri-com/nuri-infra/issues/95

## Alle Tasks zur späteren Prüfung

### Task [#199](https://github.com/nuri-com/nuri-design-system/issues/199) — Add info icon (education/info glyph)

**REASSESS_IMPLEMENTATION**

Das angeforderte info.svg fehlt im getrackten Icon-Quellbestand am eingefrorenen SHA. Der aktuelle Parser erzwingt 32×32 und erzeugt heute packages/prototype/generated/icons.js sowie packages/rn/generated/data/icons.ts; die Ausgabe-Pfade im alten Auftrag sind teilweise historisch. PR #214 erwähnt #199 nur als Vergleich für einen anderen Asset-Intake, nicht als Umsetzung.

**Nächster Review-Schritt:** Gemäß freigegebenem Reset zuerst vollständig archivieren, danach als NOT_PLANNED schließen; dies ist keine Erledigt-Bestätigung. Bei erneutem Bedarf Motiv und SVG-Geometrie prüfen, normalisieren und beide Registries regenerieren; die visuelle Glyphenabnahme ist weiterhin offen.

PRs offen: []; PRs gemergt: []; kanonischer Task: kein eindeutiger.

Quellen: https://github.com/nuri-com/nuri-design-system/issues/199; scripts/parsers/icons.js:4-15; scripts/parsers/icons.js:75-83; https://github.com/nuri-com/nuri-design-system/pull/214

### Task [#200](https://github.com/nuri-com/nuri-design-system/issues/200) — Correction: NuriRoot clips long RN-web Scroll content

**VERIFY**

Die DS-Korrektur ist in #214 gemergt und im aktuellen NuriRoot samt flexShrink-Test vorhanden. Der vollständige Kommentar lässt das Issue ausdrücklich wegen ausstehender Business-App-Abnahme offen: Pin übernehmen, temporäre Root-Höhenbegrenzung entfernen und bis zum Inhaltsende scrollen. Das vorliegende DS-Repository beweist diese Consumer-Schritte nicht.

**Nächster Review-Schritt:** Gemäß freigegebenem Reset zuerst vollständig archivieren, danach als NOT_PLANNED schließen; dies ist keine Erledigt-Bestätigung. Nur den verbleibenden Consumer-Nachweis bei Bedarf neu erfassen: RN-web Desktop 1280×720 und Mobil 390×844, feststehender Header, entfernte Höhenbegrenzung sowie Downstream-Gates. Native Layoutwirkung nicht aus Render-Tests ableiten.

PRs offen: []; PRs gemergt: [214]; kanonischer Task: kein eindeutiger.

Quellen: https://github.com/nuri-com/nuri-design-system/issues/200; packages/rn/root.tsx:48-54; packages/rn/__tests__/root.test.tsx:89-98; https://github.com/nuri-com/nuri-design-system/issues/200#issuecomment-5318059792; https://github.com/nuri-com/nuri-design-system/pull/214

### Task [#201](https://github.com/nuri-com/nuri-design-system/issues/201) — Refactor UI List component

**REASSESS_IMPLEMENTATION**

Der Auftrag besteht nur aus dem Titel, ohne Beschreibung oder Kommentare. #212 konkretisiert einen separaten List-Gutter-Follow-up, ist aber kein Duplikat: Bleed wurde in #213 bereitgestellt, die List besitzt weiterhin paddingX=sm und ListAction verschiebt pressed bleed ausdrücklich in eine zukünftige Gruppenstruktur. Historische List-Fixes sind kein Abschluss dieses unbestimmten Refactors.

**Nächster Review-Schritt:** Gemäß freigegebenem Reset zuerst vollständig archivieren, danach als NOT_PLANNED schließen; dies ist keine Erledigt-Bestätigung. Bei Wiederaufnahme einen abgegrenzten List-Gutter-Auftrag mit Kanten-, Pressflächen-, Textausrichtungs- und Plattformkriterien erstellen; #212 als Architekturgrundlage erhalten, nicht als kanonischen Ersatz ausgeben.

PRs offen: []; PRs gemergt: [213]; kanonischer Task: kein eindeutiger.

Quellen: https://github.com/nuri-com/nuri-design-system/issues/201; packages/spec/components/list.ts:21-25; packages/spec/components/list-action.ts:10-12; packages/spec/components/list-action.ts:38-46; https://github.com/nuri-com/nuri-design-system/issues/212; https://github.com/nuri-com/nuri-design-system/pull/213

### Task [#202](https://github.com/nuri-com/nuri-design-system/issues/202) — UI Components for polished support chat

**PRODUCT_BACKLOG**

Nur ein Produkttitel, kein Task-Text und keine Kommentare: Welche Support-Chat-Komponenten, Zustände und Qualitätskriterien gemeint sind, bleibt unbestimmt. Die aktive Descriptor-/Primitive-Sichtung liefert keinen belastbaren Nachweis einer abgeschlossenen Chat-Komponentenfamilie; vorhandene allgemeine UI-Bausteine reichen dafür nicht.

**Nächster Review-Schritt:** Gemäß freigegebenem Reset zuerst vollständig archivieren, danach als NOT_PLANNED schließen; dies ist keine Erledigt-Bestätigung. Nur bei bestätigtem Produktbedarf konkrete Chat-Zustände, benötigte Komponenten, Accessibility und Web/iOS/Android-Abnahme neu spezifizieren; keine Umsetzung oder Duplikatbeziehung behaupten.

PRs offen: []; PRs gemergt: []; kanonischer Task: kein eindeutiger.

Quellen: https://github.com/nuri-com/nuri-design-system/issues/202; packages/spec/components/list-action.ts:4-12

### Task [#203](https://github.com/nuri-com/nuri-design-system/issues/203) — Pick Emins Brain about one screen solution, get existing solutions from Emins head into frontend concept for the app

**PRODUCT_BACKLOG**

Ein Gesprächs-/Konzeptauftrag ohne Beschreibung und Kommentare, nicht eindeutig aus Code abschließbar. Gemergte Unified-Balance- und Cards-Arbeiten liefern verwandte Exploration; Cards bezeichnet sich ausdrücklich als Ein-Screen-Carousel-Prototyp. Das beweist weder das angefragte Gespräch mit Emin noch eine abgenommene App-Integration. Der geschlossene Carousel-Admission-Record #216 ist enger und kein kanonischer Nachfolger des Gesamtauftrags.

**Nächster Review-Schritt:** Gemäß freigegebenem Reset zuerst vollständig archivieren, danach als NOT_PLANNED schließen; dies ist keine Erledigt-Bestätigung. Bei weiterem Bedarf Emin mit den vorhandenen Boards eine konkrete Produktentscheidung treffen lassen und ausschließlich verbleibende App-Anforderungen neu erfassen; Prototyp nicht als ausgelieferte App markieren.

PRs offen: []; PRs gemergt: [204, 215]; kanonischer Task: kein eindeutiger.

Quellen: https://github.com/nuri-com/nuri-design-system/issues/203; packages/expo-demo/src/screens/Cards.tsx:36-54; https://github.com/nuri-com/nuri-design-system/pull/204; https://github.com/nuri-com/nuri-design-system/pull/215; https://github.com/nuri-com/nuri-design-system/issues/216

### Task [#211](https://github.com/nuri-com/nuri-design-system/issues/211) — Admission record — SelectTrigger (inline select trigger) + satellites [retroactive]

**REASSESS_IMPLEMENTATION**

SelectTrigger und die späteren Größen-/Gap-Anpassungen sind über #209/#213 im aktuellen Descriptor vorhanden; die ursprünglichen Klauseln wurden mehrfach explizit ersetzt. Eine konkrete Restabweichung bleibt: Die generierte Dokumentation verspricht Ghost-Wash, während Descriptor und Render-Test Ghost nur skalieren lassen. Dazu sind die historischen iOS-/Seam-Nachweise nicht vollständig, und der retroaktive Admission-Verstoß wird durch implementierten Code nicht geheilt.

**Nächster Review-Schritt:** Gemäß freigegebenem Reset zuerst vollständig archivieren, danach als NOT_PLANNED schließen; dies ist keine Erledigt-Bestätigung. Admission inklusive sämtlicher Addenda dauerhaft erhalten. Falls neu priorisiert, Ghost-Wash-Prosa im Doc-Quellmodell korrigieren und regenerieren; verbleibende iOS-/Touch-Abnahme separat nachweisen. Keine erneute Implementierung des bereits vorhandenen SelectTrigger.

PRs offen: []; PRs gemergt: [209, 213]; kanonischer Task: kein eindeutiger.

Quellen: https://github.com/nuri-com/nuri-design-system/issues/211; packages/spec/components/select-trigger.ts:36-44; packages/spec/components/select-trigger.ts:60-83; packages/spec/components/icon-avatar.ts:84-87; packages/doc/generated/components/select-trigger.md:12; packages/rn/__tests__/render-smoke.test.tsx:1162-1167; https://github.com/nuri-com/nuri-design-system/issues/211#issuecomment-5315027850; https://github.com/nuri-com/nuri-design-system/pull/209; https://github.com/nuri-com/nuri-design-system/pull/213

### Task [#212](https://github.com/nuri-com/nuri-design-system/issues/212) — Admission record — Bleed (controlled negative space)

**VERIFY**

Bleed wurde in #213 implementiert; RN besitzt Ein-Kind-Prüfung, feste Anhebung und box-none, Web die passende negative-Margin-/Pointer-Events-Projektion. Move konsumiert Bleed statt des alten Overlays; die aktuelle Dokumentation enthält das supersedierende xs-/6px-Muster. Der PR nennt die iOS-Seam-/native Touch-Abnahme ausdrücklich als Rest; diese lässt sich statisch nicht nachholen. Der List-Gutter-Refactor bleibt ein separater Auftrag (#201).

**Nächster Review-Schritt:** Gemäß freigegebenem Reset zuerst vollständig archivieren, danach als NOT_PLANNED schließen; dies ist keine Erledigt-Bestätigung. Entscheidungsrecord mit Addendum archivieren; bei Bedarf nur die verbleibende native Vollflächen-/Hit-Transparency-Prüfung und den getrennten List-Gutter-Auftrag neu priorisieren. Keine vollständige Plattformabnahme behaupten.

PRs offen: []; PRs gemergt: [213]; kanonischer Task: kein eindeutiger.

Quellen: https://github.com/nuri-com/nuri-design-system/issues/212; packages/rn/primitives/Bleed.tsx:42-58; packages/prototype/primitives/bleed.js:12-22; packages/prototype/styles/bleed.css:24-51; packages/doc/generated/components/bleed.md:24-34; packages/expo-demo/src/screens/Move.tsx:117-130; https://github.com/nuri-com/nuri-design-system/pull/213
