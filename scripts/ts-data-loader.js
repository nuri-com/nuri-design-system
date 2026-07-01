/* ──────────────────────────────────────────────────────────────
 * NURI · TS DATA LOADER
 *
 * Build-time consumers load @nuri/spec's pure TS data files through this
 * boundary. TypeScript erases the type layer; callers keep their own runtime
 * validation so a malformed module still fails loudly at the use site.
 * ────────────────────────────────────────────────────────────── */

import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

import ts from 'typescript';

export function transpileTsData(source, fileName = 'nuri-data.ts') {
  const result = ts.transpileModule(source, {
    fileName,
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
      sourceMap: false,
      inlineSourceMap: false,
    },
    reportDiagnostics: true,
  });
  const diagnostics = result.diagnostics?.filter((d) => d.category === ts.DiagnosticCategory.Error) ?? [];
  if (diagnostics.length) {
    const message = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (f) => f,
      getCurrentDirectory: () => process.cwd(),
      getNewLine: () => '\n',
    });
    throw new Error(`[ts-data-loader] failed to transpile ${fileName}\n${message}`);
  }
  return result.outputText;
}

export async function loadTsDataFromPath(absPath) {
  const source = await readFile(absPath, 'utf8');
  const js = transpileTsData(source, absPath);
  return import(
    'data:text/javascript,' +
    encodeURIComponent(`${js}\n//# sourceURL=${pathToFileURL(absPath).href}`)
  );
}

export async function loadSpecData(subpath) {
  const url = import.meta.resolve(`@nuri/spec/${subpath}`);
  return loadTsDataFromPath(fileURLToPath(url));
}
