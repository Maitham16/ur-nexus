import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/agent-task/selfReview.ts
function reviewDiff(diff) {
  const findings = [];
  const perRuleCount = new Map;
  let currentFile;
  let newLineNo = 0;
  for (const raw of diff.split(`
`)) {
    if (raw.startsWith("+++ ")) {
      const path = raw.slice(4).replace(/^b\//, "").trim();
      currentFile = path === "/dev/null" ? undefined : path;
      continue;
    }
    if (raw.startsWith("--- ")) {
      continue;
    }
    const hunk = raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunk) {
      newLineNo = Number(hunk[1]);
      continue;
    }
    if (raw.startsWith("+")) {
      const content = raw.slice(1);
      for (const rule of RULES) {
        if (!rule.test.test(content))
          continue;
        const count = perRuleCount.get(rule.rule) ?? 0;
        if (count >= MAX_FINDINGS_PER_RULE)
          continue;
        perRuleCount.set(rule.rule, count + 1);
        findings.push({
          severity: rule.severity,
          rule: rule.rule,
          message: rule.message,
          file: currentFile,
          line: newLineNo
        });
      }
      newLineNo++;
      continue;
    }
    if (raw.startsWith("-")) {
      continue;
    }
    newLineNo++;
  }
  return findings;
}
function hasBlockingFindings(findings) {
  return findings.some((f) => f.severity === "block");
}
function summarizeFindings(findings) {
  if (findings.length === 0) {
    return "Self-review: no issues found.";
  }
  const lines = [];
  for (const severity of SEVERITY_ORDER) {
    const group = findings.filter((f) => f.severity === severity);
    if (group.length === 0)
      continue;
    lines.push(`${SEVERITY_LABEL[severity]} (${group.length}):`);
    for (const f of group) {
      const loc = f.file ? ` ${f.file}${f.line ? `:${f.line}` : ""}` : "";
      lines.push(`  - [${f.rule}]${loc} ${f.message}`);
    }
  }
  return lines.join(`
`);
}
var RULES, MAX_FINDINGS_PER_RULE = 20, SEVERITY_ORDER, SEVERITY_LABEL;
var init_selfReview = __esm(() => {
  RULES = [
    {
      rule: "merge-conflict",
      severity: "block",
      message: "Unresolved merge conflict marker",
      test: /^(<{7}|={7}|>{7})( |$)/
    },
    {
      rule: "private-key",
      severity: "block",
      message: "Private key material committed",
      test: /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/
    },
    {
      rule: "aws-access-key",
      severity: "block",
      message: "Looks like an AWS access key id",
      test: /\bAKIA[0-9A-Z]{16}\b/
    },
    {
      rule: "slack-token",
      severity: "block",
      message: "Looks like a Slack token",
      test: /\bxox[baprs]-[A-Za-z0-9-]{10,}/
    },
    {
      rule: "hardcoded-secret",
      severity: "block",
      message: "Possible hardcoded secret assigned to a string literal",
      test: /(?:password|passwd|secret|api[_-]?key|access[_-]?token|auth[_-]?token)\s*[:=]\s*['"][^'"]{8,}['"]/i
    },
    {
      rule: "focused-test",
      severity: "block",
      message: "Focused test will skip the rest of the suite",
      test: /(?:\b(?:describe|it|test)\.only\s*\()|(?:\bfdescribe\s*\()|(?:\bfit\s*\()/
    },
    {
      rule: "debugger-statement",
      severity: "warn",
      message: "Leftover debugger statement",
      test: /(?:^|\s|;)debugger\s*;?\s*$/
    },
    {
      rule: "console-log",
      severity: "warn",
      message: "Leftover console.log/debug",
      test: /\bconsole\.(?:log|debug)\s*\(/
    },
    {
      rule: "todo-added",
      severity: "info",
      message: "TODO/FIXME added",
      test: /\b(?:TODO|FIXME|XXX)\b/
    }
  ];
  SEVERITY_ORDER = ["block", "warn", "info"];
  SEVERITY_LABEL = {
    block: "BLOCKING",
    warn: "warning",
    info: "info"
  };
});

export { reviewDiff, hasBlockingFindings, summarizeFindings, init_selfReview };
