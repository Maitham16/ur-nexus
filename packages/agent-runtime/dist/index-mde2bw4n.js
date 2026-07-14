import {
  defaultHeadlessRunner,
  init_headlessAgent,
  makeDryHeadlessRunner
} from "./index-c6n1hema.js";
import {
  require_ajv
} from "./index-yw8ef0zj.js";
import {
  init_json,
  safeParseJSON
} from "./index-s5dp14ed.js";
import {
  __esm,
  __toESM
} from "./index-8rxa073f.js";

// src/services/guardrails/guardrails.ts
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from "node:fs";
import { join } from "node:path";
function detectPii(text, kinds = "all") {
  const wanted = kinds === "all" ? ALL_PII : kinds;
  return wanted.filter((kind) => PII_PATTERNS[kind].test(text));
}
function validateGuardrails(config) {
  const errors = [];
  const warnings = [];
  if (!Array.isArray(config.rules)) {
    return { valid: false, errors: ["config has no rules array"], warnings };
  }
  const seen = new Set;
  for (const rule of config.rules) {
    if (!ID_RE.test(rule.id ?? ""))
      errors.push(`invalid rule id "${rule.id}"`);
    if (seen.has(rule.id))
      errors.push(`duplicate rule id "${rule.id}"`);
    seen.add(rule.id);
    if ((rule.kind === "regex" || rule.kind === "contains") && !rule.pattern) {
      errors.push(`rule "${rule.id}" (${rule.kind}) needs a pattern`);
    }
    if (rule.kind === "regex" && rule.pattern) {
      try {
        new RegExp(rule.pattern, rule.flags ?? "i");
      } catch {
        errors.push(`rule "${rule.id}" has an invalid regex`);
      }
    }
    if (rule.kind === "maxLength" && typeof rule.max !== "number") {
      errors.push(`rule "${rule.id}" (maxLength) needs a numeric max`);
    }
    if (rule.kind === "jsonSchema" && !rule.schema) {
      errors.push(`rule "${rule.id}" (jsonSchema) needs a schema`);
    }
    if (rule.kind === "llm" && !rule.rubric) {
      errors.push(`rule "${rule.id}" (llm) needs a rubric`);
    }
  }
  return { valid: errors.length === 0, errors, warnings };
}
function action(rule) {
  return rule.action ?? "block";
}
function ruleAppliesTo(rule, toolName, phase) {
  const rulePhase = rule.phase ?? "both";
  if (rulePhase !== "both" && phase !== "both" && rulePhase !== phase)
    return false;
  if (rule.tools && rule.tools.length > 0) {
    if (!toolName || !rule.tools.includes(toolName))
      return false;
  }
  return true;
}
function evaluateDeterministicRule(rule, text) {
  const violation = (message) => ({
    ruleId: rule.id,
    kind: rule.kind,
    action: action(rule),
    message
  });
  switch (rule.kind) {
    case "contains":
      return rule.pattern && text.toLowerCase().includes(rule.pattern.toLowerCase()) ? violation(rule.description ?? `matched forbidden text "${rule.pattern}"`) : null;
    case "regex": {
      if (!rule.pattern)
        return null;
      let re;
      try {
        re = new RegExp(rule.pattern, rule.flags ?? "i");
      } catch {
        return null;
      }
      return re.test(text) ? violation(rule.description ?? `matched /${rule.pattern}/`) : null;
    }
    case "pii": {
      const found = detectPii(text, rule.pii ?? "all");
      return found.length > 0 ? violation(rule.description ?? `PII detected: ${found.join(", ")}`) : null;
    }
    case "maxLength":
      return typeof rule.max === "number" && text.length > rule.max ? violation(rule.description ?? `exceeds ${rule.max} chars (${text.length})`) : null;
    case "jsonSchema": {
      if (!rule.schema)
        return null;
      const parsed = safeParseJSON(text, false);
      if (parsed === false || parsed === null || typeof parsed !== "object") {
        return violation(rule.description ?? "output is not valid JSON");
      }
      const ajv = new import_ajv.Ajv({ allErrors: true });
      let validate;
      try {
        validate = ajv.compile(rule.schema);
      } catch {
        return null;
      }
      return validate(parsed) ? null : violation(rule.description ?? `schema: ${ajv.errorsText(validate.errors)}`);
    }
    default:
      return null;
  }
}
async function evaluateGuardrails(config, text, options = {}) {
  const phase = options.phase ?? "both";
  const violations = [];
  for (const rule of config.rules) {
    if (!ruleAppliesTo(rule, options.toolName, phase))
      continue;
    if (rule.kind === "llm") {
      if (!rule.rubric)
        continue;
      const runner = options.judge ?? (options.dryRun ? makeDryHeadlessRunner() : defaultHeadlessRunner());
      const out = await runner({
        cwd: process.cwd(),
        prompt: `You are a guardrail. Decide if the TEXT violates this policy.

` + `Policy: ${rule.rubric}

TEXT:
${text.slice(0, 4000)}

` + `Reply with exactly "VERDICT: PASS" (no violation) or "VERDICT: FAIL" (violation), then a brief reason.`,
        maxTurns: 1
      });
      if (/\bVERDICT:\s*FAIL\b/i.test(out.output)) {
        violations.push({
          ruleId: rule.id,
          kind: "llm",
          action: action(rule),
          message: rule.description ?? `llm guardrail failed: ${rule.rubric}`
        });
      }
      continue;
    }
    const violation = evaluateDeterministicRule(rule, text);
    if (violation)
      violations.push(violation);
  }
  return { tripwire: violations.some((v) => v.action === "block"), violations };
}
function addedLines(diff) {
  return diff.split(`
`).filter((line) => line.startsWith("+") && !line.startsWith("+++")).map((line) => line.slice(1)).join(`
`);
}
function guardrailFindings(diff, config, options = {}) {
  const text = options.addedOnly === false ? diff : addedLines(diff);
  const findings = [];
  for (const rule of config.rules) {
    if (rule.kind === "llm" || rule.kind === "jsonSchema")
      continue;
    if (!ruleAppliesTo(rule, undefined, "output"))
      continue;
    const violation = evaluateDeterministicRule(rule, text);
    if (!violation)
      continue;
    findings.push({
      severity: violation.action === "block" ? "block" : "warn",
      rule: `guardrail:${rule.id}`,
      message: violation.message
    });
  }
  return findings;
}
function guardrailsDir(cwd) {
  return join(cwd, ".ur", "guardrails");
}
function loadGuardrails(cwd) {
  const dir = guardrailsDir(cwd);
  if (!existsSync(dir))
    return { version: 1, rules: [] };
  const rules = [];
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".json"))
      continue;
    const parsed = safeParseJSON(readFileSync(join(dir, file), "utf-8"), false);
    if (!parsed || typeof parsed !== "object")
      continue;
    const fileRules = Array.isArray(parsed) ? parsed : Array.isArray(parsed.rules) ? parsed.rules : [];
    for (const rule of fileRules)
      if (rule && typeof rule === "object")
        rules.push(rule);
  }
  return { version: 1, rules };
}
function defaultGuardrails() {
  return {
    version: 1,
    rules: [
      {
        id: "no-private-keys",
        kind: "regex",
        action: "block",
        phase: "output",
        description: "Private key material must not be written",
        pattern: "-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----"
      },
      {
        id: "no-pii-leak",
        kind: "pii",
        action: "warn",
        phase: "output",
        pii: ["ssn", "credit-card"],
        description: "Possible PII (SSN / credit card) in output"
      },
      {
        id: "block-rm-rf-root",
        kind: "regex",
        action: "block",
        phase: "input",
        tools: ["Bash"],
        description: "Refuse destructive recursive deletes of the filesystem root",
        pattern: "rm\\s+-rf?\\s+(?:/|~|\\$HOME)(?:\\s|$)"
      }
    ]
  };
}
function scaffoldGuardrails(cwd, options = {}) {
  const dir = guardrailsDir(cwd);
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "default.json");
  if (existsSync(path) && options.force !== true)
    return { path, created: false };
  writeFileSync(path, `${JSON.stringify(defaultGuardrails(), null, 2)}
`);
  return { path, created: true };
}
function formatDecision(decision, json) {
  if (json)
    return JSON.stringify(decision, null, 2);
  if (decision.violations.length === 0)
    return "Guardrails: no violations.";
  const lines = [decision.tripwire ? "Guardrails: TRIPWIRE (blocked)" : "Guardrails: warnings"];
  for (const v of decision.violations) {
    lines.push(`  - [${v.action}] ${v.ruleId} (${v.kind}): ${v.message}`);
  }
  return lines.join(`
`);
}
var import_ajv, PII_PATTERNS, ALL_PII, ID_RE;
var init_guardrails = __esm(() => {
  init_headlessAgent();
  init_json();
  import_ajv = __toESM(require_ajv(), 1);
  PII_PATTERNS = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/,
    "credit-card": /\b(?:\d[ -]?){13,16}\b/,
    phone: /\b(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}\b/,
    jwt: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
    "aws-key": /\bAKIA[0-9A-Z]{16}\b/
  };
  ALL_PII = Object.keys(PII_PATTERNS);
  ID_RE = /^[a-z0-9][a-z0-9-_]{0,63}$/i;
});

export { validateGuardrails, evaluateGuardrails, guardrailFindings, loadGuardrails, scaffoldGuardrails, formatDecision, init_guardrails };
