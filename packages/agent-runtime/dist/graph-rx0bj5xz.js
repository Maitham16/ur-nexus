import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/ur/researchGraph.ts
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
function isEntity(s) {
  return ENTITIES.includes(s);
}
function addEntity(cwd, entity, text) {
  try {
    const f = file(cwd, entity);
    mkdirSync(dirname(f), { recursive: true });
    appendFileSync(f, JSON.stringify({ ts: new Date().toISOString(), text }) + `
`);
  } catch {}
}
function listEntity(cwd, entity) {
  const f = file(cwd, entity);
  if (!existsSync(f))
    return [];
  const out = [];
  for (const line of readFileSync(f, "utf8").split(`
`).filter(Boolean)) {
    try {
      out.push(JSON.parse(line));
    } catch {}
  }
  return out;
}
function graphSummary(cwd) {
  const out = {};
  for (const e of ENTITIES)
    out[e] = listEntity(cwd, e).length;
  return out;
}
var ENTITIES, file = (cwd, entity) => join(cwd, ".ur", "graph", `${entity}.jsonl`);
var init_researchGraph = __esm(() => {
  ENTITIES = [
    "sources",
    "papers",
    "claims",
    "methods",
    "datasets",
    "metrics",
    "limitations",
    "citations",
    "concepts",
    "notes",
    "experiments",
    "open_questions",
    "links"
  ];
});

// src/commands/graph/graph.ts
var call = async (args) => {
  const toks = (args ?? "").trim().split(/\s+/).filter(Boolean);
  if (!toks.length) {
    const s = graphSummary(getCwd());
    return { type: "text", value: `research graph:
` + Object.entries(s).map(([k, v]) => `  ${k}: ${v}`).join(`
`) };
  }
  const entity = toks[0];
  if (!isEntity(entity))
    return { type: "text", value: `unknown entity "${entity}"
entities: ${ENTITIES.join(", ")}` };
  const rest = toks.slice(1).join(" ").trim();
  if (!rest) {
    const items = listEntity(getCwd(), entity);
    return { type: "text", value: items.length ? items.map((i) => `- ${i.text}`).join(`
`) : `no ${entity} yet` };
  }
  addEntity(getCwd(), entity, rest);
  return { type: "text", value: `added to ${entity}: ${rest}` };
};
var init_graph = __esm(() => {
  init_cwd();
  init_researchGraph();
});
init_graph();

export {
  call
};
