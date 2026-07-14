import {
  init_argumentSubstitution,
  parseArguments
} from "./index-f6z7dc9t.js";
import {
  init_json,
  safeParseJSON
} from "./index-wxsgjqjk.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-9xfq6h4s.js";
import"./index-0x08e9n5.js";
import"./index-4bphgmcc.js";
import"./index-5h7w9qkc.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/claim-ledger/claim-ledger.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
function ledgerPath() {
  return join(getCwd(), ".ur", "evidence", "claims.json");
}
function option(tokens, name) {
  const index = tokens.indexOf(name);
  return index === -1 ? undefined : tokens[index + 1];
}
function loadLedger() {
  if (!existsSync(ledgerPath()))
    return { claims: [] };
  const parsed = safeParseJSON(readFileSync(ledgerPath(), "utf-8"), false);
  return parsed && typeof parsed === "object" && Array.isArray(parsed.claims) ? parsed : { claims: [] };
}
function saveLedger(ledger) {
  mkdirSync(join(getCwd(), ".ur", "evidence"), { recursive: true });
  writeFileSync(ledgerPath(), `${JSON.stringify(ledger, null, 2)}
`);
}
function parseSource(value) {
  if (!value)
    return null;
  const index = value.indexOf(":");
  if (index === -1)
    return { kind: "user", ref: value, accessedAt: new Date().toISOString() };
  return {
    kind: value.slice(0, index),
    ref: value.slice(index + 1),
    accessedAt: new Date().toISOString()
  };
}
function validate(ledger) {
  const errors = [];
  for (const claim of ledger.claims) {
    if (!claim.claim.trim())
      errors.push(`${claim.id}: empty claim`);
    if (claim.sources.length === 0)
      errors.push(`${claim.id}: no sources`);
    for (const source of claim.sources) {
      if (!source.kind || !source.ref)
        errors.push(`${claim.id}: malformed source`);
    }
  }
  return errors;
}
var call = async (args) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const command = tokens.find((token) => !token.startsWith("--")) ?? "list";
  const ledger = loadLedger();
  if (command === "add") {
    const claimText = option(tokens, "--claim");
    const source = parseSource(option(tokens, "--source"));
    if (!claimText || !source) {
      return { type: "text", value: 'Usage: ur claim-ledger add --claim "..." --source web:https://example.com' };
    }
    const confidence = option(tokens, "--confidence") ?? "medium";
    const claim = {
      id: String(ledger.claims.length + 1),
      claim: claimText,
      confidence: ["low", "medium", "high"].includes(confidence) ? confidence : "medium",
      sources: [source],
      createdAt: new Date().toISOString()
    };
    ledger.claims.push(claim);
    saveLedger(ledger);
    return { type: "text", value: json ? JSON.stringify(claim, null, 2) : `Added claim ${claim.id}` };
  }
  if (command === "validate") {
    const errors = validate(ledger);
    return {
      type: "text",
      value: json ? JSON.stringify({ valid: errors.length === 0, errors }, null, 2) : errors.length === 0 ? "Claim ledger is valid." : errors.join(`
`)
    };
  }
  return {
    type: "text",
    value: json ? JSON.stringify(ledger, null, 2) : JSON.stringify(ledger, null, 2)
  };
};
var init_claim_ledger = __esm(() => {
  init_argumentSubstitution();
  init_cwd();
  init_json();
});
init_claim_ledger();

export {
  call
};
