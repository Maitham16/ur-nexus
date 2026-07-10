import {
  buildRepoEditIndex,
  formatRenamePlan,
  formatSearchHits,
  init_reliableRepoEdit,
  loadRepoEditIndex,
  planRename,
  repoEditIndexPath,
  require_typescript,
  searchRepoEditIndex
} from "./index-713f4ee4.js";
import {
  createLSPServerManager,
  init_LSPServerManager,
  init_loadPluginLanguageAdapters,
  loadPluginLanguageAdapters
} from "./index-qv8mzsdh.js";
import"./index-by2vmtsd.js";
import"./index-kkermbsd.js";
import"./index-v2hw7r4c.js";
import"./index-xy62w38z.js";
import"./index-cqtb7hz4.js";
import {
  createTwoFilesPatch,
  init_lib
} from "./index-r9gwtga0.js";
import"./index-s87snjmt.js";
import"./index-ked7nkp4.js";
import"./index-xa1t0yjk.js";
import"./index-g9g95te9.js";
import"./index-e7zhbfbk.js";
import"./index-czqwk9v1.js";
import"./index-43251g5q.js";
import"./index-1n2jp292.js";
import"./index-wxp81q89.js";
import"./index-0g63027x.js";
import"./index-na6pcvfj.js";
import"./index-8ssmkf1y.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-ke69cyc7.js";
import"./index-4k4gpxwy.js";
import"./index-1t11s6r8.js";
import"./index-j9j0h3gp.js";
import"./index-mpvjr5hg.js";
import"./index-ce74agn1.js";
import"./index-gtvyh4ft.js";
import"./index-vw0tpbas.js";
import"./index-ce1yxg5m.js";
import"./index-m1cwhfvd.js";
import"./index-a38sm3ww.js";
import"./index-t5r7sy2d.js";
import"./index-kkhap9s1.js";
import"./index-1f511qkg.js";
import"./index-kq80n9z5.js";
import"./index-c2g52y43.js";
import"./index-cmw2ae5x.js";
import"./index-v9qevprk.js";
import"./index-nds05g02.js";
import"./index-f7bfe40r.js";
import"./index-3stg8t86.js";
import"./index-5jmh1e0k.js";
import"./index-mwn5bkf6.js";
import"./index-a9y6sg4d.js";
import"./index-dsy9thtk.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-abak5acd.js";
import"./index-0x08e9n5.js";
import"./index-2g4gegqj.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-egwqqnxn.js";
import"./index-m9qhxms7.js";
import"./index-bdb5pzbm.js";
import"./index-nhjg91p1.js";
import {
  __esm,
  __require,
  __toESM
} from "./index-8rxa073f.js";

// ../../src/services/repoEditing/ast/engineRouter.ts
import { extname } from "path";
function isBuiltinLanguage(language) {
  return builtinLanguages.includes(language);
}
function selectionFromAdapter(adapter, reason) {
  return {
    engine: adapter.engine,
    reason,
    grammarPackage: adapter.grammarPackage,
    lspServerName: adapter.lspServerName
  };
}
async function resolveEngine(language, options) {
  if (options.preferTreeSitter) {
    return { engine: "treesitter", reason: "explicit --treesitter flag" };
  }
  if (options.preferLsp) {
    return { engine: "lsp", reason: "explicit --lsp flag" };
  }
  if (!isBuiltinLanguage(language)) {
    const adapters = await loadPluginLanguageAdapters();
    const adapter = adapters.find((a) => a.language === language);
    if (adapter) {
      return selectionFromAdapter(adapter, `plugin language adapter for ${language}`);
    }
  }
  if (language === "ts" || language === "js" || language === "tsx" || language === "jsx") {
    return { engine: "typescript", reason: "TypeScript compiler API is primary for TS/JS" };
  }
  return { engine: "lsp", reason: "LSP is primary for Python/Rust/Go" };
}
function languageFromPath(file) {
  const ext = file.toLowerCase();
  if (ext.endsWith(".ts"))
    return "ts";
  if (ext.endsWith(".tsx"))
    return "tsx";
  if (ext.endsWith(".js"))
    return "js";
  if (ext.endsWith(".jsx"))
    return "jsx";
  if (ext.endsWith(".py"))
    return "python";
  if (ext.endsWith(".rs"))
    return "rust";
  if (ext.endsWith(".go"))
    return "go";
  return;
}
async function languageFromPathWithAdapters(file) {
  const builtin = languageFromPath(file);
  if (builtin)
    return builtin;
  const ext = extname(file).toLowerCase();
  if (!ext)
    return;
  const adapters = await loadPluginLanguageAdapters();
  const adapter = adapters.find((a) => a.extensions.map((e) => e.toLowerCase()).includes(ext));
  return adapter?.language;
}
var builtinLanguages;
var init_engineRouter = __esm(() => {
  init_loadPluginLanguageAdapters();
  builtinLanguages = [
    "ts",
    "js",
    "tsx",
    "jsx",
    "python",
    "rust",
    "go"
  ];
});

// ../../src/services/repoEditing/ast/diagnostics.ts
import { exec } from "node:child_process";
import { join } from "node:path";
import { promisify } from "node:util";
function emptySnapshot(source = "none") {
  return { files: {}, collectedAt: new Date().toISOString(), source };
}
async function collectDiagnostics(root, files, options = {}) {
  if (options.source === "none")
    return emptySnapshot("none");
  if (options.externalCommand) {
    return runExternalCommand(root, files, options.externalCommand);
  }
  const snapshots = [];
  const tsFiles = files.filter(isTypeScriptPath);
  if (tsFiles.length > 0) {
    snapshots.push(collectTsDiagnostics(root, tsFiles));
  }
  const externalByLanguage = new Map;
  for (const file of files.filter((file2) => !isTypeScriptPath(file2))) {
    const language = await languageFromPathWithAdapters(file);
    if (!language)
      continue;
    externalByLanguage.set(language, [
      ...externalByLanguage.get(language) ?? [],
      file
    ]);
  }
  for (const [language, languageFiles] of externalByLanguage) {
    const command = resolveDefaultExternalCommand(language);
    if (!command)
      continue;
    snapshots.push(await runExternalCommand(root, languageFiles, command));
  }
  if (snapshots.length === 1) {
    return snapshots[0];
  }
  if (snapshots.length > 1) {
    return mergeSnapshots(snapshots);
  }
  return emptySnapshot("none");
}
function diagnosticsDiff(before, after) {
  const key = (d) => `${d.file}:${d.line}:${d.column}:${d.severity}:${d.message}`;
  const beforeKeys = new Set((before.files ? Object.values(before.files).flat() : []).map(key));
  const afterFiles = after.files ? Object.values(after.files).flat() : [];
  return afterFiles.filter((d) => !beforeKeys.has(key(d)));
}
function isTypeScriptPath(file) {
  const ext = file.toLowerCase();
  return ext.endsWith(".ts") || ext.endsWith(".tsx") || ext.endsWith(".js") || ext.endsWith(".jsx");
}
function mergeSnapshots(snapshots) {
  const files = {};
  for (const snapshot of snapshots) {
    for (const [file, diagnostics] of Object.entries(snapshot.files)) {
      files[file] = [...files[file] ?? [], ...diagnostics];
    }
  }
  return {
    files,
    collectedAt: new Date().toISOString(),
    source: snapshots.some((s) => s.source === "external") ? "external" : "tsc"
  };
}
function loadTsConfig(root) {
  const configPath = import_typescript.default.findConfigFile(root, import_typescript.default.sys.fileExists, "tsconfig.json");
  if (!configPath)
    return {};
  const read = import_typescript.default.readConfigFile(configPath, import_typescript.default.sys.readFile);
  if (read.error) {
    return { error: import_typescript.default.flattenDiagnosticMessageText(read.error.messageText, `
`) };
  }
  const parsed = import_typescript.default.parseJsonConfigFileContent(read.config, import_typescript.default.sys, root);
  return { config: parsed };
}
function createSyntheticProgram(root, files) {
  const compilerOptions = {
    target: import_typescript.default.ScriptTarget.Latest,
    module: import_typescript.default.ModuleKind.CommonJS,
    allowJs: true,
    checkJs: true,
    noEmit: true,
    strict: false
  };
  const host = import_typescript.default.createCompilerHost(compilerOptions);
  const fileNames = files.map((f) => join(root, f));
  return import_typescript.default.createProgram(fileNames, compilerOptions, host);
}
function collectTsDiagnostics(root, files) {
  const tsConfig = loadTsConfig(root);
  let program;
  if (tsConfig.config?.fileNames?.length) {
    const host = import_typescript.default.createCompilerHost(tsConfig.config.options);
    program = import_typescript.default.createProgram(tsConfig.config.fileNames, tsConfig.config.options, host);
  } else {
    program = createSyntheticProgram(root, files);
  }
  const diagnostics = import_typescript.default.getPreEmitDiagnostics(program);
  const snapshot = {
    files: {},
    collectedAt: new Date().toISOString(),
    source: "tsc"
  };
  for (const diagnostic of diagnostics) {
    if (!diagnostic.file || diagnostic.start === undefined)
      continue;
    const fileName = diagnostic.file.fileName;
    const rel = fileName.startsWith(root) ? fileName.slice(root.length + 1) : fileName;
    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    const entry = {
      file: rel,
      line: line + 1,
      column: character + 1,
      severity: diagnostic.category === import_typescript.default.DiagnosticCategory.Error ? "error" : "warning",
      message: import_typescript.default.flattenDiagnosticMessageText(diagnostic.messageText, `
`),
      code: typeof diagnostic.code === "number" ? diagnostic.code : undefined
    };
    snapshot.files[rel] = snapshot.files[rel] ?? [];
    snapshot.files[rel].push(entry);
  }
  return snapshot;
}
async function runExternalCommand(root, _files, command) {
  try {
    const { stdout } = await execAsync(command, {
      cwd: root,
      timeout: 10 * 60 * 1000,
      maxBuffer: 10 * 1024 * 1024
    });
    const parsed = parseExternalOutput(stdout);
    return {
      files: parsed,
      collectedAt: new Date().toISOString(),
      source: "external"
    };
  } catch (error) {
    const e = error;
    const parsed = parseExternalOutput(e.stdout ?? "");
    return {
      files: parsed,
      collectedAt: new Date().toISOString(),
      source: "external"
    };
  }
}
function parseExternalOutput(stdout) {
  const files = {};
  const add = (entry) => {
    files[entry.file] = files[entry.file] ?? [];
    files[entry.file].push(entry);
  };
  try {
    const parsed = JSON.parse(stdout);
    for (const entry of diagnosticsFromJsonObject(parsed)) {
      add(entry);
    }
    if (Object.keys(files).length > 0)
      return files;
  } catch {}
  for (const line of stdout.split(`
`)) {
    if (!line.trim())
      continue;
    let parsed;
    try {
      parsed = JSON.parse(line);
    } catch {
      const plain = parsePlainDiagnosticLine(line);
      if (plain)
        add(plain);
      continue;
    }
    if (!parsed || typeof parsed !== "object")
      continue;
    const jsonEntries = diagnosticsFromJsonObject(parsed);
    if (jsonEntries.length > 0) {
      for (const entry of jsonEntries)
        add(entry);
      continue;
    }
    const asRecord = parsed;
    const file = typeof asRecord.file === "string" ? asRecord.file : typeof asRecord.fileName === "string" ? asRecord.fileName : undefined;
    const message = typeof asRecord.message === "string" ? asRecord.message : typeof asRecord.messageText === "string" ? asRecord.messageText : undefined;
    if (!file || !message)
      continue;
    const lineNum = Number(asRecord.line ?? 0);
    const columnNum = Number(asRecord.column ?? 0);
    const severity = asRecord.severity === "error" ? "error" : asRecord.severity === "warning" ? "warning" : "error";
    add({
      file,
      line: lineNum || 1,
      column: columnNum || 1,
      severity,
      message,
      code: typeof asRecord.code === "string" || typeof asRecord.code === "number" ? asRecord.code : undefined
    });
  }
  return files;
}
function diagnosticsFromJsonObject(value) {
  if (!value || typeof value !== "object")
    return [];
  const record = value;
  if (Array.isArray(record.generalDiagnostics)) {
    return record.generalDiagnostics.flatMap((diagnostic) => {
      if (!diagnostic || typeof diagnostic !== "object")
        return [];
      const diag = diagnostic;
      const file = typeof diag.file === "string" ? diag.file : undefined;
      const message = typeof diag.message === "string" ? diag.message : undefined;
      const range = diag.range;
      if (!file || !message)
        return [];
      return [{
        file,
        line: Number(range?.start?.line ?? 0) + 1,
        column: Number(range?.start?.character ?? 0) + 1,
        severity: toSeverity(diag.severity),
        message,
        code: typeof diag.rule === "string" ? diag.rule : undefined
      }];
    });
  }
  if (record.reason === "compiler-message" && record.message && typeof record.message === "object") {
    const messageRecord = record.message;
    const spans = Array.isArray(messageRecord.spans) ? messageRecord.spans : [];
    const span = spans.find((span2) => span2 && typeof span2 === "object" && span2.is_primary === true) ?? spans[0];
    if (span && typeof span === "object") {
      const spanRecord = span;
      const file = typeof spanRecord.file_name === "string" ? spanRecord.file_name : undefined;
      const message = typeof messageRecord.message === "string" ? messageRecord.message : undefined;
      if (file && message) {
        const code = messageRecord.code && typeof messageRecord.code === "object" ? messageRecord.code.code : undefined;
        return [{
          file,
          line: Number(spanRecord.line_start ?? 1),
          column: Number(spanRecord.column_start ?? 1),
          severity: toSeverity(messageRecord.level),
          message,
          code: typeof code === "string" || typeof code === "number" ? code : undefined
        }];
      }
    }
  }
  return [];
}
function parsePlainDiagnosticLine(line) {
  const match = /^(.*?):(\d+):(?:(\d+):)?\s*(.+)$/.exec(line.trim());
  if (!match)
    return null;
  return {
    file: match[1],
    line: Number(match[2]),
    column: Number(match[3] ?? 1),
    severity: "error",
    message: match[4]
  };
}
function toSeverity(value) {
  if (value === "warning" || value === "information" || value === "hint") {
    return value;
  }
  return "error";
}
function resolveDefaultExternalCommand(language) {
  return DEFAULT_COMMANDS[language];
}
var import_typescript, execAsync, DEFAULT_COMMANDS;
var init_diagnostics = __esm(() => {
  init_engineRouter();
  import_typescript = __toESM(require_typescript(), 1);
  execAsync = promisify(exec);
  DEFAULT_COMMANDS = {
    python: "pyright --outputjson",
    rust: "cargo check --message-format=json",
    go: "go vet ./..."
  };
});

// ../../src/services/repoEditing/ast/workspaceEdit.ts
import { dirname, join as join2 } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
function groupByFile(edits) {
  const groups = new Map;
  for (const edit of edits) {
    const list = groups.get(edit.file) ?? [];
    list.push(edit);
    groups.set(edit.file, list);
  }
  return groups;
}
function normalizeFileEdits(file, edits) {
  const sorted = [...edits].sort((a, b) => b.start - a.start);
  for (let i = 1;i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (curr.end > prev.start) {
      throw new OverlappingEditError(file);
    }
  }
  return sorted;
}
function applyFileEdits(content, edits) {
  let result = content;
  for (const edit of edits) {
    result = `${result.slice(0, edit.start)}${edit.newText}${result.slice(edit.end)}`;
  }
  return result;
}
function applyWorkspaceEdit(root, edit) {
  const snapshots = new Map;
  const writtenFiles = [];
  const byFile = groupByFile(edit.edits);
  for (const [file, rawEdits] of byFile) {
    const edits = normalizeFileEdits(file, rawEdits);
    const abs = join2(root, file);
    const oldContent = existsSync(abs) ? readFileSync(abs, "utf-8") : "";
    const newContent = applyFileEdits(oldContent, edits);
    snapshots.set(file, oldContent);
    if (!existsSync(abs)) {
      mkdirSync(dirname(abs), { recursive: true });
    }
    writeFileSync(abs, newContent);
    writtenFiles.push(file);
  }
  return { writtenFiles, snapshots };
}
function rollbackWorkspaceEdit(root, snapshots) {
  for (const [file, content] of snapshots) {
    writeFileSync(join2(root, file), content);
  }
}
function formatWorkspaceEditAsPatch(root, edit) {
  const byFile = groupByFile(edit.edits);
  const pieces = [];
  for (const [file] of byFile) {
    const abs = join2(root, file);
    const oldContent = readFileSync(abs, "utf-8");
    const sorted = [...byFile.get(file) ?? []].sort((a, b) => b.start - a.start);
    const newContent = applyFileEdits(oldContent, sorted);
    pieces.push(createTwoFilesPatch(`a/${file}`, `b/${file}`, oldContent, newContent, undefined, undefined, { context: 3 }));
  }
  return pieces.join(`
`);
}
function workspaceEditFromLsp(root, lspEdit) {
  if (!lspEdit || typeof lspEdit !== "object")
    return { edits: [] };
  const edits = [];
  const docChanges = "documentChanges" in lspEdit && Array.isArray(lspEdit.documentChanges) ? lspEdit.documentChanges : [];
  const changes = "changes" in lspEdit && lspEdit.changes && typeof lspEdit.changes === "object" ? lspEdit.changes : {};
  for (const [uri, textEdits] of Object.entries(changes)) {
    const abs = uriToAbsolutePath(root, uri);
    const content = readFileSync(abs, "utf-8");
    const file = absoluteToRelative(root, abs);
    for (const raw of Array.isArray(textEdits) ? textEdits : []) {
      const converted = lspTextEditToEdit(file, content, raw);
      if (converted)
        edits.push(converted);
    }
  }
  for (const change of docChanges) {
    if (!change || typeof change !== "object")
      continue;
    const uri = "textDocument" in change && change.textDocument && typeof change.textDocument === "object" ? change.textDocument.uri : undefined;
    if (!uri)
      continue;
    const abs = uriToAbsolutePath(root, uri);
    const content = readFileSync(abs, "utf-8");
    const file = absoluteToRelative(root, abs);
    const textEdits = "edits" in change && Array.isArray(change.edits) ? change.edits : [];
    for (const raw of textEdits) {
      const converted = lspTextEditToEdit(file, content, raw);
      if (converted)
        edits.push(converted);
    }
  }
  return { edits };
}
function uriToAbsolutePath(root, uri) {
  let path = uri.replace(/^file:\/\//, "");
  if (/^\/[A-Za-z]:/.test(path))
    path = path.slice(1);
  try {
    path = decodeURIComponent(path);
  } catch {}
  return path.startsWith("/") ? path : join2(root, path);
}
function absoluteToRelative(root, abs) {
  return abs.replace(root, "").replace(/^\//, "");
}
function lspTextEditToEdit(file, content, raw) {
  if (!raw || typeof raw !== "object")
    return null;
  const range = "range" in raw ? raw.range : undefined;
  if (!range || typeof range !== "object")
    return null;
  const start = range.start;
  const end = range.end;
  if (!start || !end)
    return null;
  const newText = "newText" in raw ? String(raw.newText) : "";
  return {
    file,
    start: lineCharToOffset(content, start.line ?? 0, start.character ?? 0),
    end: lineCharToOffset(content, end.line ?? 0, end.character ?? 0),
    newText
  };
}
function lineCharToOffset(content, line, character) {
  const lines = content.split(`
`);
  let offset = 0;
  for (let i = 0;i < line && i < lines.length; i++) {
    offset += lines[i].length + 1;
  }
  const targetLine = lines[line];
  if (!targetLine)
    return offset;
  return offset + Math.min(character, targetLine.length);
}
var OverlappingEditError;
var init_workspaceEdit = __esm(() => {
  init_lib();
  OverlappingEditError = class OverlappingEditError extends Error {
    constructor(file) {
      super(`Overlapping edits detected in ${file}`);
      this.name = "OverlappingEditError";
    }
  };
});

// ../../src/services/repoEditing/ast/lspEditEngine.ts
import { readFileSync as readFileSync2 } from "node:fs";
import { pathToFileURL } from "node:url";
async function getManager() {
  if (!manager) {
    manager = createLSPServerManager();
    await manager.initialize();
  }
  return manager;
}
async function shutdownLspManager() {
  if (manager) {
    await manager.shutdown();
    manager = undefined;
  }
}
async function lspRename(root, file, line, column, newName) {
  const mgr = await getManager();
  const abs = file.startsWith("/") ? file : `${root}/${file}`;
  const content = readFileSync2(abs, "utf-8");
  await mgr.openFile(abs, content);
  const prepare = await mgr.sendRequest(abs, "textDocument/prepareRename", {
    textDocument: { uri: pathToFileURL(abs).href },
    position: { line: line - 1, character: column - 1 }
  });
  if (!prepare)
    return null;
  const result = await mgr.sendRequest(abs, "textDocument/rename", {
    textDocument: { uri: pathToFileURL(abs).href },
    position: { line: line - 1, character: column - 1 },
    newName
  });
  if (!result)
    return null;
  return workspaceEditFromLsp(root, result);
}
var manager;
var init_lspEditEngine = __esm(() => {
  init_LSPServerManager();
  init_workspaceEdit();
});

// ../../src/services/repoEditing/ast/typescriptEngine.ts
import { dirname as dirname2, join as join3, relative } from "node:path";
function loadProgram(root, files) {
  const configPath = import_typescript2.default.findConfigFile(root, import_typescript2.default.sys.fileExists, "tsconfig.json");
  let program;
  if (configPath) {
    const read = import_typescript2.default.readConfigFile(configPath, import_typescript2.default.sys.readFile);
    if (read.error)
      throw new Error(import_typescript2.default.flattenDiagnosticMessageText(read.error.messageText, `
`));
    const parsed = import_typescript2.default.parseJsonConfigFileContent(read.config, import_typescript2.default.sys, root);
    const host = import_typescript2.default.createCompilerHost(parsed.options);
    program = import_typescript2.default.createProgram(parsed.fileNames, parsed.options, host);
  } else {
    const compilerOptions = {
      target: import_typescript2.default.ScriptTarget.Latest,
      module: import_typescript2.default.ModuleKind.CommonJS,
      allowJs: true,
      checkJs: true,
      noEmit: true,
      strict: false,
      jsx: import_typescript2.default.JsxEmit.React
    };
    const host = import_typescript2.default.createCompilerHost(compilerOptions);
    const fileNames = files?.length ? files.map((f) => join3(root, f)) : [];
    program = import_typescript2.default.createProgram(fileNames, compilerOptions, host);
  }
  return { program, checker: program.getTypeChecker() };
}
function nodeAtPosition(sourceFile, line, column) {
  const pos = sourceFile.getPositionOfLineAndCharacter(line - 1, column - 1);
  return findNodeAtPosition(sourceFile, pos);
}
function findNodeAtPosition(sourceFile, pos) {
  function visit(node) {
    if (pos >= node.getStart(sourceFile) && pos < node.getEnd()) {
      let deepest = node;
      import_typescript2.default.forEachChild(node, (child) => {
        const result = visit(child);
        if (result)
          deepest = result;
      });
      return deepest;
    }
    return;
  }
  return visit(sourceFile);
}
function symbolAtPosition(ctx, file, line, column) {
  const abs = join3(ctx.program.getCurrentDirectory(), file);
  const sourceFile = ctx.program.getSourceFile(abs);
  if (!sourceFile)
    return;
  const node = nodeAtPosition(sourceFile, line, column);
  if (!node)
    return;
  return ctx.checker.getSymbolAtLocation(node);
}
function allSourceFiles(ctx, root) {
  const result = [];
  for (const sf of ctx.program.getSourceFiles()) {
    if (sf.isDeclarationFile)
      continue;
    result.push(sf);
  }
  return result;
}
function relativePath(fileName, root) {
  return fileName.startsWith(root) ? fileName.slice(root.length + 1) : fileName;
}
function collectRelatedSymbols(ctx, symbol) {
  const result = new Set([symbol]);
  if (symbol.flags & import_typescript2.default.SymbolFlags.Alias) {
    const aliased = ctx.checker.getAliasedSymbol(symbol);
    if (aliased)
      result.add(aliased);
  }
  return result;
}
function symbolsRelated(ctx, a, b) {
  const aSymbols = collectRelatedSymbols(ctx, a);
  const bSymbols = collectRelatedSymbols(ctx, b);
  for (const symbol of aSymbols) {
    if (bSymbols.has(symbol))
      return true;
  }
  return false;
}
function dedupeEdits(edits) {
  const seen = new Set;
  return edits.filter((edit) => {
    const key = `${edit.file}:${edit.start}:${edit.end}`;
    if (seen.has(key))
      return false;
    seen.add(key);
    return true;
  });
}
function tsRenameSymbol(ctx, options) {
  const { root, from, to, file: maybeFile, line, column } = options;
  const targetFile = maybeFile ? join3(root, maybeFile) : undefined;
  let targetSymbols;
  if (maybeFile && line !== undefined && column !== undefined) {
    const symbol = symbolAtPosition(ctx, maybeFile, line, column);
    if (symbol)
      targetSymbols = collectRelatedSymbols(ctx, symbol);
  }
  if (!targetSymbols) {
    targetSymbols = undefined;
  }
  const edits = [];
  for (const sourceFile of allSourceFiles(ctx, root)) {
    if (targetFile && sourceFile.fileName !== targetFile)
      continue;
    const rel = relativePath(sourceFile.fileName, root);
    import_typescript2.default.forEachChild(sourceFile, function visit(node) {
      if (!import_typescript2.default.isIdentifier(node)) {
        import_typescript2.default.forEachChild(node, visit);
        return;
      }
      if (node.text !== from) {
        import_typescript2.default.forEachChild(node, visit);
        return;
      }
      if (targetSymbols) {
        const symbol = ctx.checker.getSymbolAtLocation(node);
        if (!symbol || !targetSymbols.has(symbol)) {
          import_typescript2.default.forEachChild(node, visit);
          return;
        }
      }
      const start = node.getStart(sourceFile);
      const end = node.getEnd();
      edits.push({ file: rel, start, end, newText: to, oldText: node.text });
      import_typescript2.default.forEachChild(node, visit);
    });
  }
  return { edits: dedupeEdits(edits) };
}
function tsRenameSymbolAtPosition(ctx, options) {
  return tsRenameSymbol(ctx, options);
}
function tsMoveFunction(ctx, options) {
  const { root, symbol: symbolName, targetFile: targetFileRel, file: sourceFileRel } = options;
  if (!sourceFileRel) {
    throw new Error("TS move requires --file to identify the source file");
  }
  const sourceAbs = join3(root, sourceFileRel);
  const targetAbs = join3(root, targetFileRel);
  const sourceSf = ctx.program.getSourceFile(sourceAbs);
  const targetSf = ctx.program.getSourceFile(targetAbs) ?? ctx.program.getSourceFile(targetFileRel);
  if (!sourceSf)
    throw new Error(`Source file not found: ${sourceFileRel}`);
  const edits = [];
  let declarationNode;
  import_typescript2.default.forEachChild(sourceSf, function visit(node) {
    if ((import_typescript2.default.isFunctionDeclaration(node) || import_typescript2.default.isClassDeclaration(node)) && node.name?.text === symbolName) {
      declarationNode = node;
      return;
    }
    import_typescript2.default.forEachChild(node, visit);
  });
  if (!declarationNode)
    throw new Error(`Symbol ${symbolName} not found in ${sourceFileRel}`);
  const text = declarationNode.getText(sourceSf);
  const targetRel = targetAbs.startsWith(root) ? targetAbs.slice(root.length + 1) : targetFileRel;
  const targetExists = !!targetSf;
  const targetContent = targetSf?.text ?? "";
  const insertOffset = targetContent.length;
  const insertText = targetContent.length === 0 ? text + `
` : targetContent.endsWith(`
`) ? text + `
` : `
` + text + `
`;
  edits.push({ file: targetRel, start: insertOffset, end: insertOffset, newText: insertText });
  if (!targetExists) {}
  const start = declarationNode.getStart(sourceSf);
  const end = declarationNode.getEnd();
  let removeStart = start;
  while (removeStart > 0 && /\s/.test(sourceSf.text[removeStart - 1]))
    removeStart--;
  let removeEnd = end;
  while (removeEnd < sourceSf.text.length && /\s/.test(sourceSf.text[removeEnd]))
    removeEnd++;
  edits.push({ file: sourceFileRel, start: removeStart, end: removeEnd, newText: "" });
  edits.push(...updateImportsForMovedSymbol(ctx, root, sourceFileRel, targetRel, symbolName));
  return { edits: dedupeEdits(edits) };
}
function updateImportsForMovedSymbol(ctx, root, sourceFileRel, targetFileRel, symbolName) {
  const edits = [];
  for (const sourceFile of allSourceFiles(ctx, root)) {
    const rel = relativePath(sourceFile.fileName, root);
    if (rel === sourceFileRel || rel === targetFileRel)
      continue;
    import_typescript2.default.forEachChild(sourceFile, function visit(node) {
      if (!import_typescript2.default.isImportDeclaration(node) || !import_typescript2.default.isStringLiteral(node.moduleSpecifier)) {
        import_typescript2.default.forEachChild(node, visit);
        return;
      }
      const importedFile = resolveRelativeImport(rel, node.moduleSpecifier.text);
      if (importedFile !== stripKnownExtension(sourceFileRel)) {
        import_typescript2.default.forEachChild(node, visit);
        return;
      }
      const namedBindings = node.importClause?.namedBindings;
      if (!namedBindings || !import_typescript2.default.isNamedImports(namedBindings)) {
        import_typescript2.default.forEachChild(node, visit);
        return;
      }
      const elementIndex = namedBindings.elements.findIndex((element) => (element.propertyName?.text ?? element.name.text) === symbolName);
      if (elementIndex === -1) {
        import_typescript2.default.forEachChild(node, visit);
        return;
      }
      const nextSpecifier = moduleSpecifierBetween(rel, targetFileRel);
      if (namedBindings.elements.length === 1) {
        edits.push({
          file: rel,
          start: node.moduleSpecifier.getStart(sourceFile) + 1,
          end: node.moduleSpecifier.getEnd() - 1,
          newText: nextSpecifier
        });
      } else {
        const element = namedBindings.elements[elementIndex];
        const removal = removalRangeForNamedImport(sourceFile, element, elementIndex < namedBindings.elements.length - 1);
        edits.push({ file: rel, ...removal, newText: "" });
        edits.push({
          file: rel,
          start: node.getEnd(),
          end: node.getEnd(),
          newText: `
import { ${symbolName} } from "${nextSpecifier}"`
        });
      }
      import_typescript2.default.forEachChild(node, visit);
    });
  }
  return edits;
}
function stripKnownExtension(file) {
  return file.replace(/\.(tsx?|jsx?|mjs|cjs|mts|cts)$/i, "");
}
function normalizePath(value) {
  return value.split("\\").join("/");
}
function resolveRelativeImport(importingFileRel, specifier) {
  if (!specifier.startsWith("."))
    return;
  const base = normalizePath(join3(dirname2(importingFileRel), specifier));
  return stripKnownExtension(base);
}
function moduleSpecifierBetween(importingFileRel, targetFileRel) {
  let specifier = normalizePath(relative(dirname2(importingFileRel), stripKnownExtension(targetFileRel)));
  if (!specifier.startsWith("."))
    specifier = `./${specifier}`;
  return specifier;
}
function removalRangeForNamedImport(sourceFile, element, hasNext) {
  let start = element.getStart(sourceFile);
  let end = element.getEnd();
  if (hasNext) {
    while (end < sourceFile.text.length && /\s/.test(sourceFile.text[end]))
      end++;
    if (sourceFile.text[end] === ",")
      end++;
    while (end < sourceFile.text.length && /\s/.test(sourceFile.text[end]))
      end++;
  } else {
    while (start > 0 && /\s/.test(sourceFile.text[start - 1]))
      start--;
    if (sourceFile.text[start - 1] === ",")
      start--;
    while (start > 0 && /\s/.test(sourceFile.text[start - 1]))
      start--;
  }
  return { start, end };
}
function tsOrganizeImports(_ctx, options) {
  const { file: maybeFile, root } = options;
  const files = maybeFile ? [maybeFile] : [];
  const edits = [];
  for (const file of files) {
    const abs = join3(root, file);
    const sf = _ctx.program.getSourceFile(abs);
    if (!sf)
      continue;
    const importNodes = [];
    import_typescript2.default.forEachChild(sf, function visit(node) {
      if (import_typescript2.default.isImportDeclaration(node))
        importNodes.push(node);
      import_typescript2.default.forEachChild(node, visit);
    });
    if (importNodes.length === 0)
      continue;
    importNodes.sort((a, b) => {
      const aSpec = a.moduleSpecifier.getText(sf);
      const bSpec = b.moduleSpecifier.getText(sf);
      return aSpec.localeCompare(bSpec);
    });
    const first = importNodes[0];
    const last = importNodes[importNodes.length - 1];
    const start = first.getStart(sf);
    const end = last.getEnd();
    const sortedText = importNodes.map((i) => i.getText(sf)).join(`
`) + `
`;
    edits.push({ file, start, end, newText: sortedText });
  }
  return { edits: dedupeEdits(edits) };
}
function tsFindUnused(ctx, options) {
  const { root, file: maybeFile } = options;
  const result = [];
  for (const sourceFile of allSourceFiles(ctx, root)) {
    const rel = relativePath(sourceFile.fileName, root);
    if (maybeFile && rel !== maybeFile)
      continue;
    import_typescript2.default.forEachChild(sourceFile, function visit(node) {
      if (import_typescript2.default.isVariableDeclaration(node) && import_typescript2.default.isIdentifier(node.name)) {
        const symbol = ctx.checker.getSymbolAtLocation(node.name);
        if (symbol && symbol.declarations?.length === 1) {
          if (countSymbolReferences(ctx, symbol, node.name) === 0) {
            const loc = sourceFile.getLineAndCharacterOfPosition(node.name.getStart(sourceFile));
            result.push({ file: rel, line: loc.line + 1, column: loc.character + 1, name: node.name.text, kind: "variable" });
          }
        }
      }
      import_typescript2.default.forEachChild(node, visit);
    });
  }
  return result;
}
function countSymbolReferences(ctx, targetSymbol, declarationName) {
  let count = 0;
  const declarationFile = declarationName.getSourceFile().fileName;
  const declarationStart = declarationName.getStart(declarationName.getSourceFile());
  for (const sourceFile of allSourceFiles(ctx, ctx.program.getCurrentDirectory())) {
    import_typescript2.default.forEachChild(sourceFile, function visit(node) {
      if (import_typescript2.default.isIdentifier(node)) {
        const symbol = ctx.checker.getSymbolAtLocation(node);
        if (symbol && symbolsRelated(ctx, symbol, targetSymbol)) {
          const isDeclaration = sourceFile.fileName === declarationFile && node.getStart(sourceFile) === declarationStart;
          if (!isDeclaration)
            count++;
        }
      }
      import_typescript2.default.forEachChild(node, visit);
    });
  }
  return count;
}
function tsFindCallers(ctx, options) {
  const { root, symbol: symbolName, file: maybeFile } = options;
  const result = [];
  let targetSymbol;
  for (const sourceFile of allSourceFiles(ctx, root)) {
    if (maybeFile && relativePath(sourceFile.fileName, root) !== maybeFile)
      continue;
    import_typescript2.default.forEachChild(sourceFile, function visit(node) {
      if (import_typescript2.default.isIdentifier(node) && node.text === symbolName) {
        const symbol = ctx.checker.getSymbolAtLocation(node);
        if (symbol && symbol.getName() === symbolName) {
          targetSymbol = symbol;
        }
      }
      import_typescript2.default.forEachChild(node, visit);
    });
  }
  if (!targetSymbol)
    return result;
  for (const sourceFile of allSourceFiles(ctx, root)) {
    const rel = relativePath(sourceFile.fileName, root);
    import_typescript2.default.forEachChild(sourceFile, function visit(node) {
      let isCall = false;
      let callName;
      if (import_typescript2.default.isCallExpression(node)) {
        isCall = true;
        callName = node.expression;
      } else if (import_typescript2.default.isNewExpression(node)) {
        isCall = true;
        callName = node.expression;
      }
      if (!isCall || !callName) {
        import_typescript2.default.forEachChild(node, visit);
        return;
      }
      const symbol = ctx.checker.getSymbolAtLocation(callName);
      if (!symbol || !collectRelatedSymbols(ctx, targetSymbol).has(symbol)) {
        import_typescript2.default.forEachChild(node, visit);
        return;
      }
      const loc = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      result.push({ file: rel, line: loc.line + 1, column: loc.character + 1, name: symbolName, kind: "function" });
      import_typescript2.default.forEachChild(node, visit);
    });
  }
  return result;
}
var import_typescript2;
var init_typescriptEngine = __esm(() => {
  import_typescript2 = __toESM(require_typescript(), 1);
});

// ../../src/services/repoEditing/ast/treeSitterEngine.ts
import { readFileSync as readFileSync3 } from "node:fs";
function tryLoadNativeParser(language) {
  try {
    const Parser = __require(`@tree-sitter/${language}`);
    const parse = Parser.default?.parse ?? Parser.parse;
    if (!parse)
      return;
    return (_file, content) => parse(content);
  } catch {
    return;
  }
}
function loadNativeParser(language) {
  if (!nativeParser) {
    nativeParser = tryLoadNativeParser(language);
  }
  return nativeParser;
}
function pureTsParse(file, content) {
  return {
    type: "program",
    start: 0,
    end: content.length,
    text: content,
    children: []
  };
}
function getAdapter(language) {
  const native = loadNativeParser(language);
  if (native) {
    return {
      parse: native,
      isComment: (node) => node.type.includes("comment"),
      isString: (node) => node.type.includes("string") || node.type.includes("template_string"),
      isIdentifier: (node) => node.type === "identifier"
    };
  }
  return {
    parse: pureTsParse,
    isComment: () => false,
    isString: () => false,
    isIdentifier: () => false
  };
}
function collectIdentifiers(root, name, adapter) {
  const result = [];
  function visit(node, insideComment, insideString) {
    const nextComment = insideComment || adapter.isComment(node);
    const nextString = insideString || adapter.isString(node);
    if (!nextComment && !nextString && adapter.isIdentifier(node) && node.text === name) {
      result.push(node);
    }
    for (const child of node.children) {
      visit(child, nextComment, nextString);
    }
  }
  visit(root, false, false);
  return result;
}
function treeSitterRename(options, language) {
  const { root, from, to, file: maybeFile } = options;
  const files = maybeFile ? [maybeFile] : [];
  const edits = [];
  const adapter = getAdapter(language);
  for (const file of files) {
    const abs = file.startsWith("/") ? file : `${root}/${file}`;
    const content = readFileSync3(abs, "utf-8");
    const tree = adapter.parse(file, content);
    const identifiers = collectIdentifiers(tree, from, adapter);
    for (const node of identifiers) {
      edits.push({ file, start: node.start, end: node.end, newText: to, oldText: from });
    }
  }
  return { edits };
}
var nativeParser;
var init_treeSitterEngine = () => {};

// ../../src/services/repoEditing/ast/repoEditAst.ts
import { exec as exec2 } from "node:child_process";
import { promisify as promisify2 } from "node:util";
async function runCheck(command, cwd) {
  try {
    const result = await execAsync2(command, {
      cwd,
      timeout: 10 * 60 * 1000,
      maxBuffer: 10 * 1024 * 1024
    });
    return { ok: true, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    const e = error;
    return {
      ok: false,
      stdout: e.stdout ?? "",
      stderr: e.stderr ?? "",
      error: e.message
    };
  }
}
function createPlan(kind, description, edit, diagnosticsBefore) {
  const affectedFiles = [...new Set(edit.edits.map((e) => e.file))];
  return {
    kind,
    edits: edit,
    affectedFiles,
    description,
    diagnosticsBefore
  };
}
function createReadPlan(kind, description, refs, diagnosticsBefore) {
  return {
    kind,
    edits: { edits: [] },
    affectedFiles: [...new Set(refs.map((r) => r.file))],
    description,
    diagnosticsBefore
  };
}
async function listRepoCodeFiles(root) {
  const { listRepoFiles } = await import("./reliableRepoEdit-0kbxhvtb.js");
  return listRepoFiles(root).filter((f) => /\.(ts|tsx|js|jsx|mjs|cjs|py|rs|go)$/i.test(f));
}
async function computeRenameEdit(options, attempt = 0) {
  const language = options.file ? languageFromPath(options.file) : undefined;
  const selection = await resolveEngine(language ?? "ts", {
    preferLsp: options.engine === "lsp",
    preferTreeSitter: options.engine === "treesitter"
  });
  if (selection.engine === "lsp") {
    if (!options.file || options.line === undefined || options.column === undefined) {
      throw new Error("LSP rename requires a file and position; use `file.ts:line:column` or pass --file with a position.");
    }
    try {
      const result = await lspRename(options.root, options.file, options.line, options.column, options.to);
      if (result && result.edits.length > 0)
        return result;
      if (attempt === 0 && language) {
        return computeRenameEdit({ ...options, engine: "treesitter" }, attempt + 1);
      }
      return result ?? { edits: [] };
    } catch (error) {
      if (attempt === 0 && language) {
        return computeRenameEdit({ ...options, engine: "treesitter" }, attempt + 1);
      }
      throw error;
    }
  }
  if (selection.engine === "treesitter") {
    if (!language)
      return { edits: [] };
    return treeSitterRename(options, language);
  }
  const files = options.file ? [options.file] : await listRepoCodeFiles(options.root);
  const ctx = loadProgram(options.root, files);
  if (options.file && options.line !== undefined && options.column !== undefined) {
    return tsRenameSymbolAtPosition(ctx, options);
  }
  return tsRenameSymbol(ctx, options);
}
async function planRenameAst(options) {
  const files = options.file ? [options.file] : await listRepoCodeFiles(options.root);
  const edit = await computeRenameEdit(options);
  const diagnosticsBefore = options.skipDiagnostics ? emptySnapshot("none") : await collectDiagnostics(options.root, files);
  return createPlan("rename", `Rename ${options.from} -> ${options.to}${options.file ? ` in ${options.file}` : ""}`, edit, diagnosticsBefore);
}
async function applyRenameAst(options) {
  const plan = await planRenameAst(options);
  let applyResult;
  try {
    applyResult = applyWorkspaceEdit(options.root, plan.edits);
    const diagnosticsAfter = options.skipDiagnostics ? emptySnapshot("none") : await collectDiagnostics(options.root, applyResult.writtenFiles);
    plan.diagnosticsAfter = diagnosticsAfter;
    const newErrors = diagnosticsDiff(plan.diagnosticsBefore, diagnosticsAfter);
    if (newErrors.length > 0) {
      rollbackWorkspaceEdit(options.root, applyResult.snapshots);
      return {
        ok: false,
        plan,
        writtenFiles: applyResult.writtenFiles,
        rolledBack: true,
        error: `New diagnostics after rename:
${newErrors.map((d) => `${d.file}:${d.line}:${d.column} ${d.message}`).join(`
`)}`
      };
    }
    if (options.checkCommand) {
      const check = await runCheck(options.checkCommand, options.root);
      if (!check.ok) {
        rollbackWorkspaceEdit(options.root, applyResult.snapshots);
        return {
          ok: false,
          plan,
          writtenFiles: applyResult.writtenFiles,
          rolledBack: true,
          error: check.error ?? `Check failed: ${options.checkCommand}`
        };
      }
    }
    return { ok: true, plan, writtenFiles: applyResult.writtenFiles, rolledBack: false };
  } catch (error) {
    if (applyResult) {
      rollbackWorkspaceEdit(options.root, applyResult.snapshots);
    }
    return {
      ok: false,
      plan,
      writtenFiles: applyResult?.writtenFiles ?? [],
      rolledBack: true,
      error: error instanceof Error ? error.message : String(error)
    };
  } finally {
    await shutdownLspManager().catch(() => {});
  }
}
async function planMoveAst(options) {
  const repoFiles = await listRepoCodeFiles(options.root);
  const files = [
    ...new Set([
      ...repoFiles.filter((p) => /\.(ts|tsx|js|jsx)$/i.test(p)),
      ...options.file ? [options.file] : [],
      options.targetFile
    ])
  ];
  const ctx = loadProgram(options.root, files);
  const edit = tsMoveFunction(ctx, options);
  const diagnosticsBefore = options.skipDiagnostics ? emptySnapshot("none") : await collectDiagnostics(options.root, files);
  return createPlan("move", `Move ${options.symbol} -> ${options.targetFile}${options.file ? ` from ${options.file}` : ""}`, edit, diagnosticsBefore);
}
async function applyMoveAst(options) {
  const plan = await planMoveAst(options);
  let applyResult;
  try {
    applyResult = applyWorkspaceEdit(options.root, plan.edits);
    const diagnosticsAfter = options.skipDiagnostics ? emptySnapshot("none") : await collectDiagnostics(options.root, applyResult.writtenFiles);
    plan.diagnosticsAfter = diagnosticsAfter;
    const newErrors = diagnosticsDiff(plan.diagnosticsBefore, diagnosticsAfter);
    if (newErrors.length > 0) {
      rollbackWorkspaceEdit(options.root, applyResult.snapshots);
      return {
        ok: false,
        plan,
        writtenFiles: applyResult.writtenFiles,
        rolledBack: true,
        error: `New diagnostics after move:
${newErrors.map((d) => `${d.file}:${d.line}:${d.column} ${d.message}`).join(`
`)}`
      };
    }
    if (options.checkCommand) {
      const check = await runCheck(options.checkCommand, options.root);
      if (!check.ok) {
        rollbackWorkspaceEdit(options.root, applyResult.snapshots);
        return {
          ok: false,
          plan,
          writtenFiles: applyResult.writtenFiles,
          rolledBack: true,
          error: check.error ?? `Check failed: ${options.checkCommand}`
        };
      }
    }
    return { ok: true, plan, writtenFiles: applyResult.writtenFiles, rolledBack: false };
  } catch (error) {
    if (applyResult)
      rollbackWorkspaceEdit(options.root, applyResult.snapshots);
    return {
      ok: false,
      plan,
      writtenFiles: applyResult?.writtenFiles ?? [],
      rolledBack: true,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
async function planOrganizeImportsAst(options) {
  const files = options.file ? [options.file] : await listRepoCodeFiles(options.root).then((f) => f.filter((p) => /\.(ts|tsx|js|jsx)$/i.test(p)));
  const ctx = loadProgram(options.root, files);
  const edit = tsOrganizeImports(ctx, options);
  const diagnosticsBefore = options.skipDiagnostics ? emptySnapshot("none") : await collectDiagnostics(options.root, files);
  return createPlan("organize-imports", `Organize imports${options.file ? ` in ${options.file}` : ""}`, edit, diagnosticsBefore);
}
async function applyOrganizeImportsAst(options) {
  const plan = await planOrganizeImportsAst(options);
  let applyResult;
  try {
    applyResult = applyWorkspaceEdit(options.root, plan.edits);
    const diagnosticsAfter = options.skipDiagnostics ? emptySnapshot("none") : await collectDiagnostics(options.root, applyResult.writtenFiles);
    plan.diagnosticsAfter = diagnosticsAfter;
    const newErrors = diagnosticsDiff(plan.diagnosticsBefore, diagnosticsAfter);
    if (newErrors.length > 0) {
      rollbackWorkspaceEdit(options.root, applyResult.snapshots);
      return {
        ok: false,
        plan,
        writtenFiles: applyResult.writtenFiles,
        rolledBack: true,
        error: `New diagnostics after organize imports:
${newErrors.map((d) => `${d.file}:${d.line}:${d.column} ${d.message}`).join(`
`)}`
      };
    }
    if (options.checkCommand) {
      const check = await runCheck(options.checkCommand, options.root);
      if (!check.ok) {
        rollbackWorkspaceEdit(options.root, applyResult.snapshots);
        return {
          ok: false,
          plan,
          writtenFiles: applyResult.writtenFiles,
          rolledBack: true,
          error: check.error ?? `Check failed: ${options.checkCommand}`
        };
      }
    }
    return { ok: true, plan, writtenFiles: applyResult.writtenFiles, rolledBack: false };
  } catch (error) {
    if (applyResult)
      rollbackWorkspaceEdit(options.root, applyResult.snapshots);
    return {
      ok: false,
      plan,
      writtenFiles: applyResult?.writtenFiles ?? [],
      rolledBack: true,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
async function findUnusedAst(options) {
  const files = options.file ? [options.file] : await listRepoCodeFiles(options.root).then((f) => f.filter((p) => /\.(ts|tsx|js|jsx)$/i.test(p)));
  const ctx = loadProgram(options.root, files);
  const refs = tsFindUnused(ctx, options);
  const diagnosticsBefore = emptySnapshot("none");
  return createReadPlan("unused", `Unused symbols${options.file ? ` in ${options.file}` : ""}`, refs, diagnosticsBefore);
}
async function findCallersAst(options) {
  const files = options.file ? [options.file] : await listRepoCodeFiles(options.root).then((f) => f.filter((p) => /\.(ts|tsx|js|jsx)$/i.test(p)));
  const ctx = loadProgram(options.root, files);
  const refs = tsFindCallers(ctx, options);
  const diagnosticsBefore = emptySnapshot("none");
  return createReadPlan("callers", `Callers of ${options.symbol}${options.file ? ` in ${options.file}` : ""}`, refs, diagnosticsBefore);
}
function formatRenamePlanAst(plan) {
  const patch = formatWorkspaceEditAsPatch(".", plan.edits);
  if (plan.edits.edits.length === 0) {
    return `No binding-aware rename matches for symbol.`;
  }
  const byFile = new Map;
  for (const edit of plan.edits.edits) {
    byFile.set(edit.file, (byFile.get(edit.file) ?? 0) + 1);
  }
  const lines = [
    plan.description,
    `${plan.edits.edits.length} occurrence(s) across ${byFile.size} file(s).`,
    ""
  ];
  for (const [file, count] of byFile) {
    lines.push(`${file} (${count})`);
  }
  lines.push("", patch);
  return lines.join(`
`);
}
function formatMovePlanAst(plan) {
  const patch = formatWorkspaceEditAsPatch(".", plan.edits);
  if (plan.edits.edits.length === 0)
    return "No move edits computed.";
  return [plan.description, "", patch].join(`
`);
}
function formatOrganizeImportsPlanAst(plan) {
  const patch = formatWorkspaceEditAsPatch(".", plan.edits);
  if (plan.edits.edits.length === 0)
    return "No imports to organize.";
  return [plan.description, "", patch].join(`
`);
}
var execAsync2;
var init_repoEditAst = __esm(() => {
  init_diagnostics();
  init_engineRouter();
  init_lspEditEngine();
  init_typescriptEngine();
  init_treeSitterEngine();
  init_workspaceEdit();
  execAsync2 = promisify2(exec2);
});

// ../../src/commands/repo-edit/repo-edit.ts
function usage() {
  return [
    "Usage:",
    "  ur repo-edit index [--json]",
    "  ur repo-edit search <query> [--json]",
    "  ur repo-edit plan rename <from> --to <to> [--json]",
    "  ur repo-edit preview rename <from> --to <to> [--json]",
    "  ur repo-edit apply rename <from> --to <to> [--check <cmd>] [--json]",
    "  ur repo-edit rename <from> --to <to> [--file <path>] [--engine ts|lsp|treesitter] [--check <cmd>] [--json]",
    "  ur repo-edit move <symbol> --to <target-file> --file <source-file> [--check <cmd>] [--json]",
    "  ur repo-edit organize-imports [--file <path>] [--check <cmd>] [--json]",
    "  ur repo-edit unused [--file <path>] [--json]",
    "  ur repo-edit callers <symbol> [--file <path>] [--json]",
    "",
    "Rename operations are AST-aware for JavaScript and TypeScript files:",
    "identifier nodes are changed, while comments and strings are not.",
    "Use --engine lsp for language-server rename, --engine treesitter for",
    "best-effort identifier matching."
  ].join(`
`);
}
function option(tokens, name) {
  const index = tokens.indexOf(name);
  return index === -1 ? undefined : tokens[index + 1];
}
function positionals(tokens) {
  const values = [];
  const flagsWithValue = new Set(["--to", "--check", "--file", "--engine"]);
  for (let i = 0;i < tokens.length; i++) {
    const token = tokens[i];
    if (flagsWithValue.has(token)) {
      i++;
      continue;
    }
    if (token.startsWith("--"))
      continue;
    values.push(token);
  }
  return values;
}
function renameArgs(tokens) {
  const values = positionals(tokens);
  if (values[1] !== "rename" || !values[2])
    return null;
  const to = option(tokens, "--to");
  if (!to)
    return null;
  return { from: values[2], to };
}
function moveArgs(tokens) {
  const values = positionals(tokens);
  if (values[1] !== "move" || !values[2])
    return null;
  const target = option(tokens, "--to");
  if (!target)
    return null;
  return { symbol: values[2], targetFile: target };
}
function callersArgs(tokens) {
  const values = positionals(tokens);
  return values[1] === "callers" ? values[2] : undefined;
}
function parseSymbolLocation(symbol) {
  const match = symbol.match(/^(.+):(\d+):(\d+)$/);
  if (!match)
    return { name: symbol };
  return { name: match[1], line: parseInt(match[2], 10), column: parseInt(match[3], 10) };
}
function parseEngine(value) {
  if (value === "ts" || value === "typescript")
    return "typescript";
  if (value === "lsp")
    return "lsp";
  if (value === "treesitter")
    return "treesitter";
  return;
}
function applyResultToText(result, label) {
  if (!result.ok) {
    return `Repo edit failed; rollback ${result.rolledBack ? "completed" : "not needed"}.
` + `${result.error ?? "Unknown error"}

Patch preview:
${formatWorkspaceEditAsPatch(getCwd(), result.plan.edits)}`;
  }
  return `Applied ${label}.

Patch preview:
${formatWorkspaceEditAsPatch(getCwd(), result.plan.edits)}`;
}
var call = async (args) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const action = positionals(tokens)[0] ?? "status";
  const root = getCwd();
  try {
    if (action === "index") {
      const index = buildRepoEditIndex(root);
      const summary = {
        path: repoEditIndexPath(root),
        files: index.files.length,
        codeFiles: index.files.filter((file) => file.code).length,
        symbols: index.files.reduce((total, file) => total + file.symbols.length, 0),
        builtAt: index.builtAt
      };
      return {
        type: "text",
        value: json ? JSON.stringify({ index: summary }, null, 2) : `Built repo-edit index at ${summary.path}
` + `  files:    ${summary.files}
` + `  code:     ${summary.codeFiles}
` + `  symbols:  ${summary.symbols}`
      };
    }
    if (action === "status") {
      const index = loadRepoEditIndex(root);
      const status = index ? {
        path: repoEditIndexPath(root),
        builtAt: index.builtAt,
        files: index.files.length,
        codeFiles: index.files.filter((file) => file.code).length,
        symbols: index.files.reduce((total, file) => total + file.symbols.length, 0)
      } : { missing: true, path: repoEditIndexPath(root) };
      return { type: "text", value: JSON.stringify(status, null, 2) };
    }
    if (action === "search") {
      const query = positionals(tokens).slice(1).join(" ");
      if (!query)
        return { type: "text", value: usage() };
      const hits = searchRepoEditIndex(root, query);
      return {
        type: "text",
        value: json ? JSON.stringify({ hits }, null, 2) : formatSearchHits(hits)
      };
    }
    if (action === "rename") {
      const rename = renameArgs(tokens);
      if (!rename)
        return { type: "text", value: usage() };
      const file = option(tokens, "--file");
      const location = file ? parseSymbolLocation(rename.from) : { name: rename.from };
      const plan = await planRenameAst({
        root,
        from: location.name,
        to: rename.to,
        file,
        line: location.line,
        column: location.column,
        engine: parseEngine(option(tokens, "--engine")),
        checkCommand: option(tokens, "--check"),
        skipDiagnostics: tokens.includes("--skip-diagnostics")
      });
      if (json) {
        return { type: "text", value: JSON.stringify({ plan }, null, 2) };
      }
      return { type: "text", value: formatRenamePlanAst(plan) };
    }
    if (action === "apply") {
      const rename = renameArgs(tokens);
      if (!rename)
        return { type: "text", value: usage() };
      const file = option(tokens, "--file");
      const location = file ? parseSymbolLocation(rename.from) : { name: rename.from };
      const result = await applyRenameAst({
        root,
        from: location.name,
        to: rename.to,
        file,
        line: location.line,
        column: location.column,
        engine: parseEngine(option(tokens, "--engine")),
        checkCommand: option(tokens, "--check"),
        skipDiagnostics: tokens.includes("--skip-diagnostics")
      });
      if (json) {
        return { type: "text", value: JSON.stringify(result, null, 2) };
      }
      return { type: "text", value: applyResultToText(result, `rename ${rename.from} -> ${rename.to}`) };
    }
    if (action === "move") {
      const move = moveArgs(tokens);
      if (!move)
        return { type: "text", value: usage() };
      const file = option(tokens, "--file");
      if (!file)
        return { type: "text", value: "move requires --file <source-file>" };
      const location = parseSymbolLocation(move.symbol);
      const plan = await planMoveAst({
        root,
        symbol: location.name,
        targetFile: move.targetFile,
        file,
        checkCommand: option(tokens, "--check"),
        skipDiagnostics: tokens.includes("--skip-diagnostics")
      });
      if (tokens.includes("--preview") || !tokens.includes("--apply") && !json) {
        return { type: "text", value: json ? JSON.stringify({ plan }, null, 2) : formatMovePlanAst(plan) };
      }
      const result = await applyMoveAst({
        root,
        symbol: location.name,
        targetFile: move.targetFile,
        file,
        checkCommand: option(tokens, "--check"),
        skipDiagnostics: tokens.includes("--skip-diagnostics")
      });
      if (json) {
        return { type: "text", value: JSON.stringify(result, null, 2) };
      }
      return { type: "text", value: applyResultToText(result, `move ${move.symbol} -> ${move.targetFile}`) };
    }
    if (action === "organize-imports") {
      const file = option(tokens, "--file");
      const plan = await planOrganizeImportsAst({
        root,
        file,
        checkCommand: option(tokens, "--check"),
        skipDiagnostics: tokens.includes("--skip-diagnostics")
      });
      if (tokens.includes("--preview") || !tokens.includes("--apply") && !json) {
        return { type: "text", value: json ? JSON.stringify({ plan }, null, 2) : formatOrganizeImportsPlanAst(plan) };
      }
      const result = await applyOrganizeImportsAst({
        root,
        file,
        checkCommand: option(tokens, "--check"),
        skipDiagnostics: tokens.includes("--skip-diagnostics")
      });
      if (json) {
        return { type: "text", value: JSON.stringify(result, null, 2) };
      }
      return { type: "text", value: applyResultToText(result, "organize imports") };
    }
    if (action === "unused") {
      const file = option(tokens, "--file");
      const plan = await findUnusedAst({ root, file });
      return { type: "text", value: json ? JSON.stringify({ plan }, null, 2) : plan.description };
    }
    if (action === "callers") {
      const symbol = callersArgs(tokens);
      if (!symbol)
        return { type: "text", value: usage() };
      const file = option(tokens, "--file");
      const location = parseSymbolLocation(symbol);
      const plan = await findCallersAst({ root, symbol: location.name, file });
      return { type: "text", value: json ? JSON.stringify({ plan }, null, 2) : plan.description };
    }
    if (action === "plan" || action === "preview") {
      const rename = renameArgs(tokens);
      if (!rename)
        return { type: "text", value: usage() };
      const plan = planRename(root, rename.from, rename.to);
      if (action === "plan") {
        return {
          type: "text",
          value: json ? JSON.stringify({ plan }, null, 2) : formatRenamePlan(plan)
        };
      }
      return {
        type: "text",
        value: json ? JSON.stringify({ plan, patch: plan.patch }, null, 2) : plan.patch || formatRenamePlan(plan)
      };
    }
  } catch (error) {
    return {
      type: "text",
      value: `repo-edit failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
  return { type: "text", value: usage() };
};
var init_repo_edit = __esm(() => {
  init_argumentSubstitution();
  init_cwd();
  init_reliableRepoEdit();
  init_repoEditAst();
  init_workspaceEdit();
});
init_repo_edit();

export {
  call
};
