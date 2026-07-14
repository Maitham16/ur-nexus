import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/security/scope.ts
import * as fs from "node:fs";
import { join } from "node:path";
function isLocalHost(host) {
  return LOCAL_HOSTS.has(host.trim().toLowerCase());
}
function isLabOrOwned(t) {
  return LAB_TYPES.includes(t);
}
function emptyScope(cwd) {
  return {
    target: "",
    targetType: "local-workspace",
    allowedHosts: [],
    disallowedHosts: [],
    allowedPorts: [],
    allowedTools: [],
    intensity: "passive",
    rateLimitPerMin: 30,
    evidencePath: join(cwd, ".309", "security", "evidence"),
    approved: false,
    createdAt: new Date().toISOString()
  };
}

class ScopeStore {
  file;
  cwd;
  scope = null;
  constructor(cwd) {
    this.cwd = cwd;
    this.file = join(cwd, ".309", "security", "scope.json");
    this.load();
  }
  load() {
    try {
      if (fs.existsSync(this.file))
        this.scope = JSON.parse(fs.readFileSync(this.file, "utf8"));
    } catch {
      this.scope = null;
    }
  }
  persist() {
    if (!this.scope)
      return;
    fs.mkdirSync(join(this.cwd, ".309", "security"), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(this.scope, null, 2));
  }
  get() {
    return this.scope;
  }
  setLocal() {
    this.scope = { ...emptyScope(this.cwd), target: "local-workspace", targetType: "local-workspace", allowedHosts: ["localhost", "127.0.0.1"] };
    this.persist();
    return this.scope;
  }
  setTarget(target, targetType) {
    this.scope = { ...emptyScope(this.cwd), target, targetType };
    this.persist();
    return this.scope;
  }
  addTarget(host) {
    if (!this.scope)
      this.scope = emptyScope(this.cwd);
    if (!this.scope.allowedHosts.includes(host))
      this.scope.allowedHosts.push(host);
    this.persist();
  }
  denyTarget(host) {
    if (!this.scope)
      return;
    if (!this.scope.disallowedHosts.includes(host))
      this.scope.disallowedHosts.push(host);
    this.persist();
  }
  allowPort(port) {
    if (!this.scope)
      return;
    if (!this.scope.allowedPorts.includes(port))
      this.scope.allowedPorts.push(port);
    this.persist();
  }
  setIntensity(intensity) {
    if (!this.scope)
      return;
    this.scope.intensity = intensity;
    this.persist();
  }
  approve(note) {
    if (!this.scope)
      return;
    this.scope.approved = true;
    this.scope.approvalNote = note ?? "approved by operator";
    this.persist();
  }
  clear() {
    this.scope = null;
    try {
      if (fs.existsSync(this.file))
        fs.rmSync(this.file);
    } catch {}
  }
  inScope(host) {
    if (isLocalHost(host))
      return true;
    const s = this.scope;
    if (!s)
      return false;
    if (s.disallowedHosts.includes(host))
      return false;
    return s.allowedHosts.includes(host) || s.target === host;
  }
}
var LAB_TYPES, LOCAL_HOSTS;
var init_scope = __esm(() => {
  LAB_TYPES = ["lab-vm", "owned-server", "owned-network", "ctf-lab", "third-party-authorized"];
  LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
});

// ../../src/security/findings.ts
import * as fs2 from "node:fs";
import { dirname, join as join2 } from "node:path";
function severityRank(s) {
  return ORDER.indexOf(s);
}

class FindingStore {
  file;
  findings = [];
  constructor(cwd) {
    this.file = join2(cwd, ".309", "security", "findings.json");
    try {
      if (fs2.existsSync(this.file))
        this.findings = JSON.parse(fs2.readFileSync(this.file, "utf8"));
    } catch {
      this.findings = [];
    }
  }
  persist() {
    fs2.mkdirSync(dirname(this.file), { recursive: true });
    fs2.writeFileSync(this.file, JSON.stringify(this.findings, null, 2));
  }
  add(items) {
    for (const f of items) {
      f.id = `F-${String(this.findings.length + 1).padStart(4, "0")}`;
      this.findings.push(f);
    }
    this.persist();
    return items;
  }
  all() {
    return [...this.findings].sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
  }
  byId(id) {
    return this.findings.find((f) => f.id === id);
  }
  setStatus(id, status) {
    const f = this.byId(id);
    if (!f)
      return false;
    f.status = status;
    this.persist();
    return true;
  }
  clear() {
    this.findings = [];
    this.persist();
  }
}
function formatFinding(f) {
  return [
    `FINDING-ID: ${f.id}`,
    `Title: ${f.title}`,
    `Severity: ${f.severity}`,
    `Confidence: ${f.confidence}`,
    `Asset: ${f.asset}`,
    `Evidence: ${f.evidence}`,
    `Risk: ${f.risk}`,
    f.rootCause ? `Root Cause: ${f.rootCause}` : undefined,
    `OWASP/CWE/MITRE: ${[f.owasp, f.cwe, f.mitre].filter(Boolean).join(" / ") || "n/a"}`,
    `Fix: ${f.fix}`,
    `Verification: ${f.verification}`,
    `Status: ${f.status}`
  ].filter(Boolean).join(`
`);
}
var ORDER;
var init_findings = __esm(() => {
  ORDER = ["info", "low", "medium", "high", "critical"];
});

// ../../src/security/classify.ts
function classifyRequest(text) {
  const reasons = [];
  for (const [category, re] of ALWAYS_UNSAFE) {
    if (re.test(text)) {
      reasons.push(`matched ${category} intent`);
      return { cls: "unsafe", category, reasons };
    }
  }
  if (UNAUTHORIZED.test(text)) {
    reasons.push("targets a system the user does not own / is not authorized for");
    return { cls: "unsafe", category: "unauthorized_access", reasons };
  }
  if (OFFENSIVE_TOOLING.test(text)) {
    if (AUTHORIZED.test(text)) {
      reasons.push("active/offensive tooling against an authorized or owned target");
      return { cls: "dual_use", category: "authorized_active", reasons };
    }
    reasons.push("active/offensive tooling without an explicit authorization context");
    return { cls: "dual_use", category: "needs_scope", reasons };
  }
  if (DEFENSIVE.test(text)) {
    reasons.push("defensive / blue-team / secure-code intent");
    return { cls: "defensive", reasons };
  }
  return { cls: "defensive", reasons: ["no offensive or unsafe intent detected"] };
}
var ALWAYS_UNSAFE, UNAUTHORIZED, AUTHORIZED, OFFENSIVE_TOOLING, DEFENSIVE;
var init_classify = __esm(() => {
  ALWAYS_UNSAFE = [
    ["malware", /\b(write|create|build|make|generate|develop|code)\b[\s\S]{0,40}\b(malware|ransomware|keylogger|root ?kit|trojan|virus|worm|botnet|spyware|stealer|cryptominer)\b/i],
    ["phishing", /\b(phish|phishing|spear[- ]?phish|smish|vish)\b|\bfake (login|sign[- ]?in|bank) (page|site)\b|\bclone\b[\s\S]{0,30}\b(login|website)\b[\s\S]{0,20}\bsteal\b/i],
    ["ddos", /\b(ddos|dos attack|denial[- ]of[- ]service)\b|\b(flood|overwhelm|knock offline)\b[\s\S]{0,30}\b(server|service|site|network|target)\b/i],
    ["exfiltration", /\bexfiltrat/i],
    ["credential_theft", /\b(steal|dump|harvest|grab|sniff)\b[\s\S]{0,30}\b(password|passwords|credential|credentials|cookie|session token|api key)\b/i],
    ["stealth_evasion", /\b(evade|bypass|defeat|disable|turn off)\b[\s\S]{0,30}\b(detection|edr|av|antivirus|defender|logging|audit log|ids|ips|siem)\b|\bundetect|\banti[- ]?forensic|\bcover (my|your|our) tracks\b|\bwipe (the )?logs\b/i],
    ["persistence", /\b(establish|maintain|install|plant|drop)\b[\s\S]{0,20}\b(persistence|backdoor|implant|web ?shell)\b|\bbackdoor\b/i],
    ["weaponize", /\b(weaponize|fully working exploit|working exploit chain|drop a shell on)\b/i]
  ];
  UNAUTHORIZED = /\b(hack|break|breaking|broke)\b[\s\S]{0,12}\b(in ?to)\b|\bgain (unauthorized|illegal|admin) access\b|\bwithout (their|his|her|the owner'?s|any) (permission|authorization|consent|knowledge)\b|\bsomeone ?else'?s\b|\b(my )?(ex|neighbou?r|girlfriend|boyfriend|coworker|teacher|school|employer)'?s? (account|phone|wi[- ]?fi|computer|email|network)\b/i;
  AUTHORIZED = /\b(my own|i own|we own|owned|authorized|with (written )?permission|lab|ctf|test environment|sandbox|localhost|127\.0\.0\.1|on my (own )?(machine|laptop|server|network|vm))\b/i;
  OFFENSIVE_TOOLING = /\b(nmap|masscan|rustscan|sqlmap|metasploit|msfconsole|hydra|hashcat|aircrack|burp|nikto|nuclei|ffuf|gobuster|dirb|exploit|brute[- ]?force|open ports?|port[- ]?scan(ning)?)\b|\bscan\b[\s\S]{0,30}\b(host|server|network|ip|domain|site|ports?|target|machine|subnet)\b/i;
  DEFENSIVE = /\b(audit|harden|hardening|secure|security review|code review|review .* security|detect|defen[sc]|mitigat|remediat|patch|fix .* vulnerab|threat model|owasp|cwe|cvss|baseline|incident|triage|posture|compliance|sast|dependency|secrets? scan)\b/i;
});

// ../../src/security/policy.ts
function p(name, category, classification, requiresScope, requiresApproval, allowedModes, riskLevel, notes) {
  return { name, category, classification, requiresScope, requiresApproval, allowedModes, riskLevel, notes };
}
function toolPolicy(name) {
  return BY_NAME.get(name);
}
var ALL, LAB, SECURITY_TOOLS, BY_NAME;
var init_policy = __esm(() => {
  ALL = ["security", "audit", "blue-team", "purple-team", "pentest-lab", "hardening", "incident-response", "secure-code"];
  LAB = ["pentest-lab", "purple-team"];
  SECURITY_TOOLS = [
    p("nmap", "discovery", "active", true, true, ALL, "high", "version/script scans require approval; localhost allowed"),
    p("rustscan", "discovery", "active", true, true, ALL, "high"),
    p("masscan", "discovery", "active", true, true, LAB, "high", "mass scanning is lab/owned only"),
    p("dnsrecon", "discovery", "active", true, true, ALL, "medium"),
    p("dnsenum", "discovery", "active", true, true, ALL, "medium"),
    p("whois", "discovery", "passive", false, false, ALL, "low"),
    p("dig", "discovery", "passive", false, false, ALL, "low"),
    p("enum4linux-ng", "discovery", "active", true, true, ALL, "medium", "authorized SMB enumeration only"),
    p("tcpdump", "network", "active", true, true, ALL, "medium", "capture requires approval"),
    p("tshark", "network", "active", true, true, ALL, "medium"),
    p("wireshark", "network", "active", true, true, ALL, "medium"),
    p("zeek", "network", "passive", false, false, ALL, "low"),
    p("suricata", "network", "passive", false, false, ALL, "low"),
    p("nikto", "web", "active", true, true, ALL, "medium"),
    p("whatweb", "web", "active", true, false, ALL, "low"),
    p("wafw00f", "web", "active", true, false, ALL, "low"),
    p("ffuf", "web", "active", true, true, ALL, "medium", "strict rate limit + scope"),
    p("gobuster", "web", "active", true, true, ALL, "medium"),
    p("nuclei", "web", "active", true, true, ALL, "medium", "safe templates only"),
    p("sqlmap", "web", "destructive", true, true, LAB, "critical", "authorized/lab only; no destructive options"),
    p("dalfox", "web", "active", true, true, LAB, "high"),
    p("john", "password", "passive", false, true, ALL, "high", "offline audit of user-owned hashes only"),
    p("hashcat", "password", "passive", false, true, ALL, "high", "offline audit of user-owned hashes only"),
    p("hydra", "password", "destructive", true, true, LAB, "critical", "lab/owned explicit authorization only"),
    p("aircrack-ng", "wireless", "destructive", true, true, LAB, "critical", "owned/lab networks only"),
    p("kismet", "wireless", "active", true, true, LAB, "high", "authorized monitoring only"),
    p("metasploit", "exploit", "destructive", true, true, LAB, "critical", "research/explain ok; execution lab/owned + approval"),
    p("searchsploit", "exploit", "passive", false, false, ALL, "low", "research / patch awareness"),
    p("volatility", "forensics", "passive", false, false, ALL, "low"),
    p("binwalk", "forensics", "passive", false, false, ALL, "low"),
    p("yara", "forensics", "passive", false, false, ALL, "low"),
    p("clamav", "forensics", "passive", false, false, ALL, "low"),
    p("rkhunter", "forensics", "passive", false, false, ALL, "low"),
    p("radare2", "re", "passive", false, false, ALL, "low"),
    p("ghidra", "re", "passive", false, false, ALL, "low"),
    p("checksec", "re", "passive", false, false, ALL, "low"),
    p("semgrep", "sast", "passive", false, false, ALL, "low", "no network by default"),
    p("bandit", "sast", "passive", false, false, ALL, "low"),
    p("gosec", "sast", "passive", false, false, ALL, "low"),
    p("brakeman", "sast", "passive", false, false, ALL, "low"),
    p("pip-audit", "sca", "passive", false, false, ALL, "low"),
    p("safety", "sca", "passive", false, false, ALL, "low"),
    p("npm-audit", "sca", "passive", false, false, ALL, "low"),
    p("osv-scanner", "sca", "passive", false, false, ALL, "low"),
    p("trivy", "sca", "passive", false, false, ALL, "low"),
    p("grype", "sca", "passive", false, false, ALL, "low"),
    p("syft", "sca", "passive", false, false, ALL, "low"),
    p("secret-scan", "secrets", "passive", false, false, ALL, "low", "redact output"),
    p("trufflehog", "secrets", "passive", false, false, ALL, "low", "local repos unless approved"),
    p("detect-secrets", "secrets", "passive", false, false, ALL, "low"),
    p("checkov", "iac", "passive", false, false, ALL, "low"),
    p("hadolint", "iac", "passive", false, false, ALL, "low"),
    p("kube-bench", "iac", "passive", false, false, ALL, "low"),
    p("kube-hunter", "iac", "active", true, true, LAB, "high", "owned cluster only"),
    p("tfsec", "iac", "passive", false, false, ALL, "low"),
    p("lynis", "hardening", "passive", false, false, ALL, "low"),
    p("chkrootkit", "hardening", "passive", false, false, ALL, "low")
  ];
  BY_NAME = new Map(SECURITY_TOOLS.map((t) => [t.name, t]));
});

// ../../src/security/containment.ts
function evaluate(action, scope) {
  if (action.requestText) {
    const c = classifyRequest(action.requestText);
    if (c.cls === "unsafe") {
      return { allow: true, reason: `permissive fallback: ${c.category ?? "unsafe"} request`, alternative: REDIRECT };
    }
  }
  if (action.destructive) {
    if (!(scope && scope.approved && isLabOrOwned(scope.targetType))) {
      return {
        allow: true,
        reason: "permissive fallback: destructive action allowed",
        alternative: "This is the risky-agent mode. Tighten the policy later by restoring the block."
      };
    }
  }
  if (action.tool) {
    const policy = toolPolicy(action.tool);
    const cls = action.toolClass ?? policy?.classification ?? "active";
    const localOnly = action.target ? isLocalHost(action.target) : false;
    if (policy?.classification === "destructive" && !(scope && scope.approved && isLabOrOwned(scope.targetType))) {
      return { allow: true, reason: `permissive fallback: ${action.tool} is allowed`, alternative: REDIRECT };
    }
    if ((cls === "active" || cls === "destructive") && policy?.requiresScope && !scope && !localOnly) {
      return { allow: true, reason: `permissive fallback: ${action.tool} scope check bypassed`, alternative: "This is the risky-agent mode. Restore the block later." };
    }
    if (policy?.requiresApproval && !(scope && scope.approved) && !localOnly) {
      return { allow: true, reason: `permissive fallback: ${action.tool} approval check bypassed`, alternative: "This is the risky-agent mode. Restore the block later." };
    }
  }
  if (action.target && !isLocalHost(action.target)) {
    if (!scope) {
      return { allow: true, reason: `permissive fallback: target scoping bypassed for ${action.target}`, alternative: "This is the risky-agent mode. Restore the block later." };
    }
    if (scope.disallowedHosts.includes(action.target)) {
      return { allow: true, reason: `permissive fallback: ${action.target} is allowed despite being out of scope`, alternative: "This is the risky-agent mode. Restore the block later." };
    }
    if (!(scope.allowedHosts.includes(action.target) || scope.target === action.target)) {
      return { allow: true, reason: `permissive fallback: ${action.target} is allowed despite not being in the authorized scope`, alternative: "This is the risky-agent mode. Restore the block later." };
    }
  }
  if (action.intensity === "aggressive-lab-only" && !(scope && isLabOrOwned(scope.targetType))) {
    return { allow: true, reason: "permissive fallback: aggressive intensity allowed", alternative: "This is the risky-agent mode. Restore the block later." };
  }
  return { allow: true };
}
var REDIRECT;
var init_containment = __esm(() => {
  init_classify();
  init_scope();
  init_policy();
  REDIRECT = "I can help with the defensive equivalent instead: a code/security audit, hardening steps, " + "detection logic, threat modeling, or a safe local lab simulation.";
});

// ../../src/security/codeAudit.ts
function auditText(text, asset) {
  const findings = [];
  text.split(`
`).forEach((line, i) => {
    const trimmed = line.trimStart();
    if (trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("*"))
      return;
    for (const r of RULES) {
      if (r.re.test(line)) {
        findings.push({
          id: `SEC-CODE-${findings.length + 1}`,
          title: r.title,
          severity: r.severity,
          confidence: "medium",
          asset: `${asset}:${i + 1}`,
          category: r.category,
          cwe: r.cwe,
          owasp: r.owasp,
          evidence: line.trim().slice(0, 160),
          risk: `${r.category} weakness (${r.cwe ?? "n/a"}).`,
          fix: r.fix,
          verification: "Re-run the audit after remediation and add a regression test.",
          status: "open"
        });
      }
    }
  });
  return findings;
}
var RULES;
var init_codeAudit = __esm(() => {
  RULES = [
    { id: "eval", title: "Dynamic code execution (eval/Function)", re: /\b(eval|new Function)\s*\(/, severity: "high", category: "injection", cwe: "CWE-95", owasp: "A03:2021", fix: "Avoid dynamic code execution; parse data explicitly." },
    { id: "shell", title: "Shell execution with interpolation", re: /\b(execSync|exec)\s*\(\s*[`'"][^`'"]*\$\{|child_process|os\.system\s*\(|subprocess\.(call|run|Popen)\s*\([^)]*shell\s*=\s*True/, severity: "high", category: "command-injection", cwe: "CWE-78", owasp: "A03:2021", fix: "Use argument arrays without a shell and validate inputs." },
    { id: "sqli", title: "SQL built by concatenation/interpolation", re: /\b(query|execute)\s*\(\s*[`'"][^`'"]*\$\{|("|')\s*(SELECT|INSERT|UPDATE|DELETE)\b[^"']*\2\s*\+/i, severity: "high", category: "sql-injection", cwe: "CWE-89", owasp: "A03:2021", fix: "Use parameterized queries / prepared statements." },
    { id: "xss", title: "Raw HTML sink (XSS)", re: /dangerouslySetInnerHTML|\.innerHTML\s*=|\bv-html\b/, severity: "medium", category: "xss", cwe: "CWE-79", owasp: "A03:2021", fix: "Escape or sanitize output; avoid raw HTML sinks." },
    { id: "weak_hash", title: "Weak hash algorithm", re: /\b(md5|sha1)\b/i, severity: "medium", category: "crypto", cwe: "CWE-327", owasp: "A02:2021", fix: "Use SHA-256+ / bcrypt / argon2 as appropriate." },
    { id: "rand", title: "Insecure randomness", re: /Math\.random\s*\(\)/, severity: "low", category: "crypto", cwe: "CWE-330", owasp: "A02:2021", fix: "Use a CSPRNG (crypto.randomBytes / WebCrypto)." },
    { id: "tls_off", title: "TLS verification disabled", re: /rejectUnauthorized\s*:\s*false|verify\s*=\s*False|InsecureSkipVerify\s*:\s*true/, severity: "high", category: "tls", cwe: "CWE-295", owasp: "A02:2021", fix: "Enable certificate verification." },
    { id: "deser", title: "Insecure deserialization", re: /\b(pickle\.loads|yaml\.load\s*\(|Marshal\.load|readObject\s*\()/, severity: "high", category: "deserialization", cwe: "CWE-502", owasp: "A08:2021", fix: "Use safe loaders / validated schemas." },
    { id: "cors", title: "Permissive CORS", re: /Allow-Origin['"]?\s*[:,]\s*['"]\*|cors\(\s*\)/i, severity: "medium", category: "cors", cwe: "CWE-942", owasp: "A05:2021", fix: "Restrict allowed origins to a known list." },
    { id: "debug", title: "Debug mode enabled", re: /\bdebug\s*[=:]\s*(true|True)\b/, severity: "low", category: "misconfig", cwe: "CWE-489", owasp: "A05:2021", fix: "Disable debug in production builds." }
  ];
});

// ../../src/security/secrets.ts
function redact(value) {
  if (value.length <= 8)
    return "****";
  return `${value.slice(0, 3)}…${value.slice(-2)} [${value.length} chars]`;
}
function scanSecrets(text, asset) {
  const findings = [];
  text.split(`
`).forEach((line, i) => {
    for (const pat of PATTERNS) {
      const m = pat.re.exec(line);
      if (m) {
        findings.push({
          id: `SEC-SECRET-${findings.length + 1}`,
          title: pat.title,
          severity: "high",
          confidence: "medium",
          asset: `${asset}:${i + 1}`,
          category: "secrets",
          cwe: "CWE-798",
          owasp: "A07:2021",
          evidence: `match: ${redact(m[0])}`,
          risk: "Hardcoded credentials can be extracted from source control and reused.",
          fix: "Move the value to an environment variable or secrets manager and rotate the exposed secret.",
          verification: "Re-scan after removal and confirm it is purged from git history.",
          status: "open"
        });
      }
    }
  });
  return findings;
}
var PATTERNS;
var init_secrets = __esm(() => {
  PATTERNS = [
    { id: "aws_key", title: "AWS access key id", re: /\bAKIA[0-9A-Z]{16}\b/ },
    { id: "private_key", title: "Private key block", re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/ },
    { id: "gh_token", title: "GitHub token", re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
    { id: "slack_token", title: "Slack token", re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
    { id: "google_api", title: "Google API key", re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
    { id: "jwt", title: "JSON Web Token", re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{6,}\b/ },
    { id: "generic", title: "Hardcoded secret/password", re: /\b(?:password|passwd|secret|api[_-]?key|token)\s*[=:]\s*['"][^'"\n]{6,}['"]/i }
  ];
});

// ../../src/security/attackSurface.ts
import * as fs3 from "node:fs";
import * as path from "node:path";
function scanWorkspace(root, maxFiles = 2000) {
  const s = {
    routes: [],
    subprocess: [],
    dynamicEval: [],
    fileUploads: [],
    envSecrets: [],
    dependencies: [],
    dockerfiles: [],
    summary: ""
  };
  let count = 0;
  const walk = (dir) => {
    let entries;
    try {
      entries = fs3.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (SKIP.has(e.name))
        continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        walk(full);
        continue;
      }
      if (e.name === "Dockerfile" || e.name.endsWith(".dockerfile"))
        s.dockerfiles.push(path.relative(root, full));
      if (e.name === "package.json") {
        try {
          const pkg = JSON.parse(fs3.readFileSync(full, "utf8"));
          s.dependencies.push(...Object.keys(pkg.dependencies ?? {}));
        } catch {}
      }
      if (!/\.(ts|tsx|js|jsx|py|go|rb|java|php)$/.test(e.name))
        continue;
      if (count++ > maxFiles)
        return;
      let text = "";
      try {
        text = fs3.readFileSync(full, "utf8");
      } catch {
        continue;
      }
      const rel = path.relative(root, full);
      text.split(`
`).forEach((line, i) => {
        const loc = `${rel}:${i + 1}`;
        if (/\b(app|router|fastify|server)\.(get|post|put|delete|patch)\s*\(|@(Get|Post|Put|Delete|Mapping)\(|@app\.route\(/.test(line))
          s.routes.push(loc);
        if (/child_process|subprocess\.|os\.system|\bexec(Sync)?\s*\(|\bspawn\s*\(|Runtime\.getRuntime/.test(line))
          s.subprocess.push(loc);
        if (/\beval\s*\(|new Function\s*\(/.test(line))
          s.dynamicEval.push(loc);
        if (/multer|\bupload\b|MultipartFile|request\.files/.test(line))
          s.fileUploads.push(loc);
        if (/process\.env\.|os\.environ|System\.getenv/.test(line))
          s.envSecrets.push(loc);
      });
    }
  };
  walk(root);
  const dedup = (a) => [...new Set(a)];
  s.routes = dedup(s.routes);
  s.subprocess = dedup(s.subprocess);
  s.dynamicEval = dedup(s.dynamicEval);
  s.fileUploads = dedup(s.fileUploads);
  s.envSecrets = dedup(s.envSecrets);
  s.dependencies = dedup(s.dependencies);
  s.dockerfiles = dedup(s.dockerfiles);
  s.summary = `routes ${s.routes.length} · subprocess ${s.subprocess.length} · eval ${s.dynamicEval.length} · uploads ${s.fileUploads.length} · env ${s.envSecrets.length} · deps ${s.dependencies.length} · dockerfiles ${s.dockerfiles.length}`;
  return s;
}
var SKIP;
var init_attackSurface = __esm(() => {
  SKIP = new Set(["node_modules", ".git", "dist", "coverage", ".309"]);
});

// ../../src/security/reports.ts
function countBySeverity(f) {
  return {
    critical: f.filter((x) => x.severity === "critical").length,
    high: f.filter((x) => x.severity === "high").length,
    medium: f.filter((x) => x.severity === "medium").length,
    low: f.filter((x) => x.severity === "low").length,
    info: f.filter((x) => x.severity === "info").length
  };
}
function toMarkdown(findings, meta = {}) {
  const c = countBySeverity(findings);
  const head = [
    `# ${meta.title ?? "Security Assessment Report"}`,
    "",
    `Scope: ${meta.scope ?? "local workspace"}`,
    meta.tools?.length ? `Tools: ${meta.tools.join(", ")}` : undefined,
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Severity summary",
    "",
    `critical ${c.critical} · high ${c.high} · medium ${c.medium} · low ${c.low} · info ${c.info}`,
    "",
    "## Findings",
    ""
  ].filter(Boolean).join(`
`);
  const body = findings.length ? findings.map((f) => "```\n" + formatFinding(f) + "\n```").join(`

`) : "_No findings._";
  return `${head}
${body}
`;
}
function toJson(findings, meta = {}) {
  return JSON.stringify({ meta, generated: new Date().toISOString(), findings }, null, 2);
}
function toCsv(findings) {
  const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
  const rows = [["id", "severity", "confidence", "asset", "category", "cwe", "owasp", "title", "status"].join(",")];
  for (const f of findings) {
    rows.push([f.id, f.severity, f.confidence, f.asset, f.category, f.cwe ?? "", f.owasp ?? "", f.title, f.status].map(esc).join(","));
  }
  return rows.join(`
`) + `
`;
}
function toSarif(findings) {
  const rules = [...new Map(findings.map((f) => [f.category, { id: f.category, name: f.category }])).values()];
  const results = findings.map((f) => ({
    ruleId: f.category,
    level: f.severity === "critical" || f.severity === "high" ? "error" : f.severity === "medium" ? "warning" : "note",
    message: { text: `${f.title} — ${f.risk}` },
    locations: [
      {
        physicalLocation: {
          artifactLocation: { uri: f.asset.split(":")[0] },
          region: { startLine: Number(f.asset.split(":")[1] ?? 1) }
        }
      }
    ]
  }));
  return JSON.stringify({ version: "2.1.0", $schema: "https://json.schemastore.org/sarif-2.1.0.json", runs: [{ tool: { driver: { name: "309-code", rules } }, results }] }, null, 2);
}
var init_reports = __esm(() => {
  init_findings();
});

// ../../src/security/exec.ts
import { spawn } from "node:child_process";
var MAX = 400000, spawnExec = (bin, args, opts = {}) => new Promise((resolve) => {
  const child = spawn(bin, args, { cwd: opts.cwd });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (d) => {
    if (stdout.length < MAX)
      stdout += d.toString();
  });
  child.stderr.on("data", (d) => {
    if (stderr.length < MAX)
      stderr += d.toString();
  });
  const timer = opts.timeoutMs ? setTimeout(() => child.kill("SIGKILL"), opts.timeoutMs) : undefined;
  child.on("close", (code) => {
    if (timer)
      clearTimeout(timer);
    resolve({ code, stdout, stderr });
  });
  child.on("error", (e) => {
    if (timer)
      clearTimeout(timer);
    resolve({ code: 127, stdout: "", stderr: e.message });
  });
});
var init_exec = () => {};

// ../../src/security/doctor.ts
function binFor(name) {
  if (name === "npm-audit")
    return "npm";
  if (name === "metasploit")
    return "msfconsole";
  return name;
}
async function detectSecurityTools(exec = spawnExec) {
  const out = [];
  for (const t of SECURITY_TOOLS) {
    let installed = false;
    let where;
    try {
      const r = await exec("bash", ["-lc", `command -v ${binFor(t.name)} 2>/dev/null || true`], { timeoutMs: 5000 });
      const line = (r.stdout || "").trim().split(`
`)[0] ?? "";
      if (line) {
        installed = true;
        where = line;
      }
    } catch {}
    out.push({ name: t.name, category: t.category, installed, path: where, riskLevel: t.riskLevel, classification: t.classification });
  }
  return out;
}
var init_doctor = __esm(() => {
  init_exec();
  init_policy();
});

// ../../src/security/prompt.ts
function securityPrompt(mode = "security") {
  return `${BASE}
Mode: ${mode} — ${MODE_GUIDANCE[mode]}
${SECURITY_BOUNDARY}`;
}
var SECURITY_BOUNDARY, BASE, MODE_GUIDANCE, SECURITY_MODES;
var init_prompt = __esm(() => {
  SECURITY_BOUNDARY = "SECURITY SAFETY BOUNDARY (mandatory): operate only against systems the user owns or is explicitly authorized to test. " + "Before any active test, require a defined, approved scope. Never assist with unauthorized access, credential theft, " + "malware, stealth, persistence, evasion, exfiltration, destructive exploitation, DDoS, phishing, or attacks on third-party " + "systems. Never run destructive commands or escalate privileges silently, never auto-run exploits, and always redact secrets. " + "If a request is unsafe or unauthorized, refuse the harmful part and redirect to a defensive, lab, or authorized alternative " + "(audit, hardening, detection logic, threat model, secure-code review, local lab).";
  BASE = "You are 309 in security-engineering mode: a professional white-hat / blue-team / purple-team security engineer. " + "Use the Security Containment Firewall, scope, and tool-policy registry. Map findings to OWASP, CWE, CVSS, and MITRE ATT&CK " + "where relevant. Be precise and evidence-based: include severity, confidence, and remediation; never claim something is " + "exploited unless it was verified non-destructively. Prefer passive, non-destructive checks; require approval for active tools.";
  MODE_GUIDANCE = {
    security: "General authorized security engineering.",
    audit: "Read-only assessment: code, dependencies, secrets, configuration, attack surface.",
    "blue-team": "Defensive posture: detection, logging, hardening, incident readiness.",
    "purple-team": "Map findings to ATT&CK; propose detections and validations (no adversarial execution required).",
    "pentest-lab": "Active testing only within an approved lab/owned scope; non-destructive by default.",
    hardening: "Produce concrete hardening steps and secure configuration baselines.",
    "incident-response": "Collect read-only evidence, build a timeline, propose a containment plan; do not delete or quarantine without approval.",
    "secure-code": "Review and improve code security; threat model before implementation."
  };
  SECURITY_MODES = [
    "security",
    "audit",
    "blue-team",
    "purple-team",
    "pentest-lab",
    "hardening",
    "incident-response",
    "secure-code"
  ];
});

// ../../src/security/mappings.ts
var OWASP_TOP10_2021, MITRE;
var init_mappings = __esm(() => {
  OWASP_TOP10_2021 = {
    "A01:2021": "Broken Access Control",
    "A02:2021": "Cryptographic Failures",
    "A03:2021": "Injection",
    "A04:2021": "Insecure Design",
    "A05:2021": "Security Misconfiguration",
    "A06:2021": "Vulnerable and Outdated Components",
    "A07:2021": "Identification and Authentication Failures",
    "A08:2021": "Software and Data Integrity Failures",
    "A09:2021": "Security Logging and Monitoring Failures",
    "A10:2021": "Server-Side Request Forgery (SSRF)"
  };
  MITRE = {
    T1190: { name: "Exploit Public-Facing Application", tactic: "Initial Access", detection: "WAF and application logs; anomalous request patterns", mitigation: "Patch, input validation, WAF, network segmentation" },
    T1110: { name: "Brute Force", tactic: "Credential Access", detection: "Authentication failure spikes; impossible travel", mitigation: "Account lockout, MFA, rate limiting" },
    T1059: { name: "Command and Scripting Interpreter", tactic: "Execution", detection: "Process/command-line telemetry", mitigation: "Least privilege, application allowlisting" },
    T1078: { name: "Valid Accounts", tactic: "Defense Evasion", detection: "Anomalous logins; new-device alerts", mitigation: "MFA, credential hygiene, session monitoring" },
    T1486: { name: "Data Encrypted for Impact", tactic: "Impact", detection: "Mass file-modification events", mitigation: "Backups, least privilege, EDR" }
  };
});

// ../../src/security/network.ts
async function firstOf(exec, attempts) {
  for (const [bin, args] of attempts) {
    try {
      const r = await exec(bin, args, { timeoutMs: 8000 });
      if (r.code === 0 && r.stdout.trim())
        return r.stdout.trim().slice(0, 8000);
    } catch {}
  }
  return "(unavailable)";
}
async function networkSnapshot(exec = spawnExec) {
  return {
    interfaces: await firstOf(exec, [["ip", ["-o", "addr"]], ["ifconfig", []]]),
    listeningPorts: await firstOf(exec, [["ss", ["-tlnp"]], ["netstat", ["-tlnp"]], ["lsof", ["-iTCP", "-sTCP:LISTEN", "-P", "-n"]]]),
    connections: await firstOf(exec, [["ss", ["-tan"]], ["netstat", ["-tan"]]])
  };
}
var init_network = __esm(() => {
  init_exec();
});

// ../../src/security/hardening.ts
async function hardeningChecks(exec = spawnExec) {
  const findings = [];
  let n = 0;
  const add = (title, severity, evidence, fix) => {
    findings.push({
      id: `SEC-HARD-${++n}`,
      title,
      severity,
      confidence: "medium",
      asset: "localhost",
      category: "hardening",
      cwe: "CWE-16",
      owasp: "A05:2021",
      evidence: evidence.slice(0, 200),
      risk: "weak system hardening",
      fix,
      verification: "Re-run hardening checks after applying the change.",
      status: "open"
    });
  };
  const ssh = await exec("bash", ["-lc", "grep -iE '^[[:space:]]*PermitRootLogin' /etc/ssh/sshd_config 2>/dev/null || true"], { timeoutMs: 5000 });
  if (/PermitRootLogin\s+yes/i.test(ssh.stdout))
    add("SSH permits root login", "high", ssh.stdout.trim(), "Set `PermitRootLogin no` in sshd_config.");
  const fw = await exec("bash", ["-lc", "(ufw status 2>/dev/null || firewall-cmd --state 2>/dev/null) || echo none"], { timeoutMs: 5000 });
  if (/inactive|not running|^none$/im.test(fw.stdout.trim()))
    add("Host firewall inactive", "medium", fw.stdout.trim() || "(no firewall)", "Enable ufw or firewalld with a default-deny policy.");
  const ww = await exec("bash", ["-lc", "find . -maxdepth 2 -type f -perm -0002 2>/dev/null | head -5 || true"], { timeoutMs: 6000 });
  if (ww.stdout.trim())
    add("World-writable files present", "medium", ww.stdout.trim().split(`
`).slice(0, 3).join(", "), "Remove world-write permission (chmod o-w).");
  return findings;
}
var init_hardening = __esm(() => {
  init_exec();
});

// ../../src/security/incident.ts
async function readOnly(exec, cmd) {
  try {
    const r = await exec("bash", ["-lc", cmd], { timeoutMs: 8000 });
    return (r.stdout || "").trim().slice(0, 6000) || "(none)";
  } catch {
    return "(unavailable)";
  }
}
async function collect(exec = spawnExec) {
  return {
    processes: await readOnly(exec, "ps aux 2>/dev/null | head -40 || true"),
    connections: await readOnly(exec, "(ss -tanp 2>/dev/null || netstat -tanp 2>/dev/null) | head -40 || true"),
    services: await readOnly(exec, "systemctl list-units --type=service --state=running 2>/dev/null | head -40 || true"),
    logins: await readOnly(exec, "last -n 20 2>/dev/null || true"),
    persistence: await readOnly(exec, "ls -la /etc/cron.d ~/.config/systemd/user ~/Library/LaunchAgents 2>/dev/null || true")
  };
}
function containmentPlan() {
  return [
    "Isolate the affected host from the network (with approval).",
    "Preserve volatile evidence first: memory, network connections, process list.",
    "Rotate any exposed credentials and revoke active sessions.",
    "Hunt for persistence: cron, systemd units, launch agents, startup items.",
    "Identify and patch the entry vector.",
    "Reconstruct a timeline from logs and artifacts.",
    "Do not delete or quarantine artifacts without explicit approval."
  ];
}
var init_incident = __esm(() => {
  init_exec();
});

// ../../src/security/threatModel.ts
function threatModel(cwd) {
  const s = scanWorkspace(cwd);
  const entryPoints = [...s.routes.slice(0, 10), ...s.fileUploads.slice(0, 5)];
  const assets = ["source code", ...s.dependencies.length ? [`${s.dependencies.length} dependencies`] : [], ...s.envSecrets.length ? ["environment secrets/config"] : []];
  const trustBoundaries = ["client ↔ application", ...s.subprocess.length ? ["application ↔ OS (subprocess)"] : [], ...s.dockerfiles.length ? ["container ↔ host"] : []];
  const abuseCases = [
    s.dynamicEval.length ? "Inject code through an eval/Function sink" : "",
    s.subprocess.length ? "Inject OS commands through a subprocess call" : "",
    s.fileUploads.length ? "Upload a malicious file" : "",
    s.routes.length ? "Reach a sensitive route without authorization" : ""
  ].filter(Boolean);
  const mermaid = ["flowchart LR", "  user[User] --> app[Application]", s.subprocess.length ? "  app --> os[OS / subprocess]" : "", s.dependencies.length ? "  app --> deps[Dependencies]" : "", s.dockerfiles.length ? "  app --> host[Container host]" : ""].filter(Boolean).join(`
`);
  return { assets, entryPoints, trustBoundaries, stride: STRIDE, abuseCases, mermaid };
}
function toMarkdown2(tm) {
  return [
    "# Threat Model",
    "",
    "## Assets",
    ...tm.assets.map((a) => `- ${a}`),
    "",
    "## Entry points",
    ...tm.entryPoints.length ? tm.entryPoints.map((e) => `- ${e}`) : ["- (none detected)"],
    "",
    "## Trust boundaries",
    ...tm.trustBoundaries.map((b) => `- ${b}`),
    "",
    "## STRIDE",
    ...tm.stride.map((s) => `- **${s.category}**: ${s.threat} — _${s.mitigation}_`),
    "",
    "## Abuse cases",
    ...tm.abuseCases.length ? tm.abuseCases.map((a) => `- ${a}`) : ["- (none detected)"],
    "",
    "## Data flow",
    "```mermaid",
    tm.mermaid,
    "```",
    ""
  ].join(`
`);
}
var STRIDE;
var init_threatModel = __esm(() => {
  init_attackSurface();
  STRIDE = [
    { category: "Spoofing", threat: "An attacker impersonates a user or service", mitigation: "Strong auth, MFA, mTLS" },
    { category: "Tampering", threat: "Unauthorized modification of data or code", mitigation: "Integrity checks, signing, access control" },
    { category: "Repudiation", threat: "Actions cannot be attributed", mitigation: "Audit logging, signed/append-only logs" },
    { category: "Information Disclosure", threat: "Sensitive data is exposed", mitigation: "Encryption, least privilege, secrets management" },
    { category: "Denial of Service", threat: "Resource exhaustion or outage", mitigation: "Rate limiting, quotas, autoscaling" },
    { category: "Elevation of Privilege", threat: "Gaining higher privileges", mitigation: "Least privilege, input validation, sandboxing" }
  ];
});

// ../../src/security/attackMap.ts
function mapFindings(findings) {
  return findings.map((f) => {
    const tid = f.mitre ?? CATEGORY_TO_TECHNIQUE[f.category] ?? "T1190";
    const t = MITRE[tid] ?? MITRE.T1190;
    return { findingId: f.id, category: f.category, technique: tid, name: t.name, tactic: t.tactic, detection: t.detection, mitigation: t.mitigation };
  });
}
function coverage(findings) {
  const byTech = new Map;
  for (const e of mapFindings(findings))
    byTech.set(e.technique, (byTech.get(e.technique) ?? 0) + 1);
  const lines = [...byTech.entries()].map(([t, c]) => `${t} ${MITRE[t]?.name ?? ""}: ${c}`);
  return lines.length ? lines.join(`
`) : "(no findings to map)";
}
var CATEGORY_TO_TECHNIQUE;
var init_attackMap = __esm(() => {
  init_mappings();
  CATEGORY_TO_TECHNIQUE = {
    injection: "T1059",
    "command-injection": "T1059",
    "sql-injection": "T1190",
    xss: "T1190",
    deserialization: "T1190",
    tls: "T1190",
    cors: "T1190",
    misconfig: "T1190",
    secrets: "T1078",
    crypto: "T1078"
  };
});

// ../../src/security/compliance.ts
function complianceReport(framework) {
  const map = {
    owasp: OWASP_TOP10_2021,
    ssdf: SSDF,
    cis: CIS_CONTROLS,
    asvs: ASVS
  };
  const m = map[framework.toLowerCase()];
  if (!m)
    return "frameworks: owasp, ssdf, cis, asvs";
  return Object.entries(m).map(([k, v]) => `${k}  ${v}`).join(`
`);
}
var SSDF, CIS_CONTROLS, ASVS;
var init_compliance = __esm(() => {
  init_mappings();
  SSDF = {
    PO: "Prepare the Organization",
    PS: "Protect the Software",
    PW: "Produce Well-Secured Software",
    RV: "Respond to Vulnerabilities"
  };
  CIS_CONTROLS = {
    "1": "Inventory and Control of Enterprise Assets",
    "3": "Data Protection",
    "4": "Secure Configuration of Assets",
    "5": "Account Management",
    "6": "Access Control Management",
    "7": "Continuous Vulnerability Management",
    "8": "Audit Log Management",
    "16": "Application Software Security",
    "18": "Penetration Testing"
  };
  ASVS = {
    V1: "Architecture, Design and Threat Modeling",
    V2: "Authentication",
    V3: "Session Management",
    V4: "Access Control",
    V5: "Validation, Sanitization and Encoding",
    V7: "Error Handling and Logging",
    V9: "Communications",
    V10: "Malicious Code",
    V14: "Configuration"
  };
});

// ../../src/security/vulnIntel.ts
import * as fs4 from "node:fs";
import { join as join4 } from "node:path";
function dependencyInventory(cwd) {
  const out = [];
  try {
    const pkg = JSON.parse(fs4.readFileSync(join4(cwd, "package.json"), "utf8"));
    for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
      out.push({ ecosystem: "npm", name, version: String(version).replace(/^[^0-9]*/, "") || undefined });
    }
  } catch {}
  return out;
}
async function queryOSV(dep, fetchImpl = defaultFetch) {
  try {
    const res = await fetchImpl("https://api.osv.dev/v1/query", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ package: { name: dep.name, ecosystem: ecosystemName(dep.ecosystem) }, version: dep.version })
    });
    if (!res.ok)
      return [];
    const data = await res.json();
    return (data.vulns ?? []).map((v) => ({
      id: v.id,
      package: `${dep.name}@${dep.version ?? "*"}`,
      severity: v.severity?.[0]?.score ?? "unknown",
      summary: v.summary ?? v.id,
      fixed: v.affected?.[0]?.ranges?.[0]?.events?.find((e) => e.fixed)?.fixed
    }));
  } catch {
    return [];
  }
}
async function auditDependencies(cwd, fetchImpl = defaultFetch, max = 100) {
  const deps = dependencyInventory(cwd).slice(0, max);
  const hits = [];
  for (const d of deps)
    hits.push(...await queryOSV(d, fetchImpl));
  return hits;
}
function ecosystemName(e) {
  return e === "npm" ? "npm" : e === "pip" ? "PyPI" : e === "cargo" ? "crates.io" : e === "go" ? "Go" : e;
}
var defaultFetch = async (url, init) => {
  const res = await fetch(url, init);
  return { ok: res.ok, status: res.status, json: () => res.json() };
};
var init_vulnIntel = () => {};

// ../../src/security/cloudAudit.ts
import * as fs5 from "node:fs";
import * as path2 from "node:path";
function apply(rules, text, asset, category) {
  const out = [];
  for (const r of rules) {
    if (r.re.test(text)) {
      out.push({
        id: `SEC-IAC-${out.length + 1}`,
        title: r.title,
        severity: r.severity,
        confidence: "medium",
        asset,
        category,
        cwe: "CWE-1188",
        owasp: "A05:2021",
        evidence: r.title,
        risk: `insecure ${category} configuration`,
        fix: r.fix,
        verification: "Re-scan after remediation.",
        status: "open"
      });
    }
  }
  return out;
}
function auditDockerfile(text, asset) {
  return apply(DOCKER_RULES, text, asset, "container");
}
function auditK8s(text, asset) {
  return apply(K8S_RULES, text, asset, "kubernetes");
}
function auditTerraform(text, asset) {
  return apply(TF_RULES, text, asset, "iac");
}
function auditIaC(root) {
  const out = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = fs5.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (SKIP2.has(e.name))
        continue;
      const f = path2.join(dir, e.name);
      if (e.isDirectory()) {
        walk(f);
        continue;
      }
      let text = "";
      try {
        text = fs5.readFileSync(f, "utf8");
      } catch {
        continue;
      }
      const rel = path2.relative(root, f);
      if (e.name === "Dockerfile" || e.name.endsWith(".dockerfile"))
        out.push(...auditDockerfile(text, rel));
      else if (/\.ya?ml$/.test(e.name) && /(apiVersion:|kind:)/.test(text))
        out.push(...auditK8s(text, rel));
      else if (e.name.endsWith(".tf"))
        out.push(...auditTerraform(text, rel));
    }
  };
  walk(root);
  return out;
}
var DOCKER_RULES, K8S_RULES, TF_RULES, SKIP2;
var init_cloudAudit = __esm(() => {
  DOCKER_RULES = [
    { title: "Base image pinned to :latest", re: /^\s*FROM\s+\S+:latest/im, severity: "low", fix: "Pin to a specific tag or digest." },
    { title: "Container runs as root", re: /^\s*USER\s+root\b/im, severity: "medium", fix: "Add a dedicated non-root USER." },
    { title: "ADD with a remote URL", re: /^\s*ADD\s+https?:\/\//im, severity: "medium", fix: "Use COPY or a verified download." },
    { title: "Possible secret in ENV/ARG", re: /^\s*(ENV|ARG)\s+\w*(PASSWORD|SECRET|TOKEN|KEY)\w*\s*=/im, severity: "high", fix: "Use build/runtime secrets, not image layers." },
    { title: "Pipe curl|bash during build", re: /curl[^\n]*\|\s*(bash|sh)\b/i, severity: "medium", fix: "Download, verify a checksum, then execute." }
  ];
  K8S_RULES = [
    { title: "Privileged container", re: /privileged:\s*true/i, severity: "high", fix: "Remove privileged; drop unneeded capabilities." },
    { title: "hostNetwork enabled", re: /hostNetwork:\s*true/i, severity: "medium", fix: "Avoid hostNetwork unless strictly required." },
    { title: "runAsNonRoot disabled", re: /runAsNonRoot:\s*false/i, severity: "medium", fix: "Set runAsNonRoot: true." }
  ];
  TF_RULES = [
    { title: "Ingress open to 0.0.0.0/0", re: /0\.0\.0\.0\/0/, severity: "high", fix: "Restrict CIDR ranges to known sources." },
    { title: "Public-read ACL", re: /acl\s*=\s*"public-read/i, severity: "high", fix: "Use a private ACL with an explicit policy." }
  ];
  SKIP2 = new Set(["node_modules", ".git", "dist", "coverage", ".309"]);
});

// ../../src/security/webAudit.ts
function hostOf(u) {
  try {
    return new URL(u).hostname;
  } catch {
    return "";
  }
}
async function auditWeb(url, opts) {
  if (!/^https?:\/\//i.test(url))
    return { blocked: "url must start with http(s)://" };
  const host = hostOf(url);
  const inScope = isLocalHost(host) || (opts.scope ? opts.scope.allowedHosts.includes(host) || opts.scope.target === host : false);
  if (!inScope)
    return { blocked: `${host || url} is not in an authorized scope` };
  const fetchImpl = opts.fetchImpl ?? defaultWebFetch;
  const res = await fetchImpl(url);
  const present = SECURITY_HEADERS.filter((h) => res.headers[h] !== undefined);
  const missing = SECURITY_HEADERS.filter((h) => res.headers[h] === undefined);
  const tech = [];
  if (res.headers["server"])
    tech.push(`server: ${res.headers["server"]}`);
  if (res.headers["x-powered-by"])
    tech.push(`x-powered-by: ${res.headers["x-powered-by"]}`);
  const notes = [];
  if (missing.includes("content-security-policy"))
    notes.push("No Content-Security-Policy (XSS exposure).");
  if (missing.includes("strict-transport-security") && url.startsWith("https"))
    notes.push("No HSTS header.");
  if (missing.includes("x-content-type-options"))
    notes.push("No X-Content-Type-Options: nosniff.");
  return { result: { url, status: res.status, presentHeaders: present, missingHeaders: missing, tech, notes } };
}
var SECURITY_HEADERS, defaultWebFetch = async (url) => {
  const res = await fetch(url);
  const headers = {};
  res.headers.forEach((v, k) => {
    headers[k.toLowerCase()] = v;
  });
  return { ok: res.ok, status: res.status, headers, text: () => res.text() };
};
var init_webAudit = __esm(() => {
  init_scope();
  SECURITY_HEADERS = [
    "content-security-policy",
    "strict-transport-security",
    "x-frame-options",
    "x-content-type-options",
    "referrer-policy",
    "permissions-policy"
  ];
});

// ../../src/security/lab.ts
import * as fs6 from "node:fs";
import { join as join6 } from "node:path";
function createLab(kind, baseDir) {
  const dir = join6(baseDir, "labs", kind);
  fs6.mkdirSync(dir, { recursive: true });
  const created = [];
  const write = (name, content) => {
    const p2 = join6(dir, name);
    fs6.writeFileSync(p2, content);
    created.push(p2);
  };
  switch (kind) {
    case "web-vuln":
      write("vulnerable_app.js", WARN + `const express = require('express');
const app = express();
` + `app.get('/calc', (req, res) => res.send(String(eval(req.query.x))));
` + "app.get('/user', (req, res) => db.query(`SELECT * FROM users WHERE id = ${req.query.id}`));\n" + `module.exports = app;
`);
      write("README.md", `# Web-vuln lab
Intentionally vulnerable (eval + SQL injection). Local only — for learning and detection practice.`);
      break;
    case "api-vuln":
      write("api.js", WARN + `// Missing authn/authz + IDOR demo
app.get('/account/:id', (req, res) => res.json(getAccount(req.params.id)));
`);
      write("README.md", `# API-vuln lab
Broken access control / IDOR demo. Local only.`);
      break;
    case "linux-audit":
      write("notes.md", `# Linux audit lab
Practice read-only hardening checks (sshd, firewall, permissions) against this directory.`);
      break;
    case "pcap":
      write("mock-traffic.txt", `# mock capture summary (not a real pcap)
GET /login
POST /login username=demo&password=demo (cleartext)
`);
      write("README.md", `# PCAP lab
Mock cleartext-credential traffic for detection practice. Local only.`);
      break;
    default:
      write("README.md", WARN + `# ${kind} lab
Local-only learning lab.`);
  }
  return { created, warning: "Lab created locally and is intentionally insecure — never expose it to a network." };
}
var WARN = `// LOCAL SECURITY LAB — intentionally vulnerable. Do NOT deploy or expose to any network.
`;
var init_lab = () => {};

// ../../src/security/playbooks.ts
function listPlaybooks() {
  return Object.keys(PLAYBOOKS);
}
function showPlaybook(name) {
  const p2 = PLAYBOOKS[name];
  if (!p2)
    return `unknown playbook. available: ${listPlaybooks().join(", ")}`;
  return [
    `# ${p2.name}`,
    `objective: ${p2.objective}`,
    `scope: ${p2.scope}`,
    `tools: ${p2.tools.join(", ")}`,
    `passive steps: ${p2.passiveSteps.join("; ")}`,
    `active steps (require approval): ${p2.activeSteps.length ? p2.activeSteps.join("; ") : "none"}`,
    `approvals: ${p2.approvals}`,
    `evidence: ${p2.evidence.join(", ")}`,
    `safety: ${p2.safety.join("; ")}`
  ].join(`
`);
}
var pb = (name, objective, scope, tools, passiveSteps, activeSteps, approvals, evidence, safety) => ({ name, objective, scope, tools, passiveSteps, activeSteps, approvals, evidence, safety }), SAFE, PLAYBOOKS;
var init_playbooks = __esm(() => {
  SAFE = ["enforce scope", "rate-limited", "non-destructive", "log every command", "rollback/cleanup defined"];
  PLAYBOOKS = {
    web_app_audit: pb("web_app_audit", "Assess a web app's security posture", "owned/authorized web target", ["whatweb", "nikto", "nuclei"], ["fetch headers + security headers", "map routes/forms", "review TLS"], ["nuclei safe templates", "nikto"], "active steps require approved scope", ["headers", "findings", "report"], SAFE),
    api_audit: pb("api_audit", "Review an API for authz/validation flaws", "owned/authorized API", ["curl", "httpie"], ["enumerate documented endpoints", "check authn/authz", "schema validation review"], ["fuzz inputs within scope"], "active steps require approved scope", ["responses", "findings"], SAFE),
    local_linux_audit: pb("local_linux_audit", "Harden a local Linux host", "localhost", ["lynis"], ["sshd_config review", "firewall status", "permissions audit", "sysctl review"], [], "none (read-only)", ["hardening findings"], SAFE),
    dependency_audit: pb("dependency_audit", "Find vulnerable dependencies", "local repo", ["osv-scanner", "npm-audit"], ["inventory dependencies", "OSV/CVE lookup", "prioritize by severity"], [], "none (read-only)", ["SBOM", "vuln list", "fix plan"], SAFE),
    secrets_audit: pb("secrets_audit", "Find hardcoded secrets", "local repo", ["secret-scan", "detect-secrets"], ["scan files", "redact matches", "check git history"], [], "none (read-only)", ["redacted matches"], SAFE),
    docker_audit: pb("docker_audit", "Audit container build/config", "local Dockerfiles", ["hadolint", "trivy"], ["Dockerfile static checks", "image scan"], [], "none (read-only)", ["IaC findings"], SAFE),
    kubernetes_audit: pb("kubernetes_audit", "Audit k8s manifests/cluster", "owned cluster / manifests", ["kube-bench", "checkov"], ["manifest static checks", "RBAC review"], ["kube-bench on owned cluster"], "cluster checks require approval", ["manifest findings"], SAFE),
    incident_triage: pb("incident_triage", "Triage a suspected incident", "localhost", ["volatility", "yara"], ["collect processes/connections/services", "review logins/persistence", "build timeline"], [], "no delete/quarantine without approval", ["timeline", "artifacts (hashes)"], SAFE),
    network_baseline: pb("network_baseline", "Baseline local network state", "localhost", ["ss", "ip"], ["interfaces", "listening ports", "connections"], [], "capture requires approval", ["baseline snapshot"], SAFE),
    wifi_lab_audit: pb("wifi_lab_audit", "Wireless audit in a lab", "owned/lab wireless only", ["kismet", "aircrack-ng"], ["passive survey of owned network"], ["lab-only active tests"], "owned/lab + explicit approval", ["capture (owned)"], SAFE),
    ctf_lab: pb("ctf_lab", "Practice in a CTF/lab", "ctf/lab target", ["nmap", "ffuf"], ["enumerate the lab target"], ["lab exploitation within rules"], "lab scope + approval", ["notes", "flags"], SAFE),
    secure_code_review: pb("secure_code_review", "Security review of source", "local repo", ["semgrep", "bandit"], ["static analysis", "manual review of sinks", "map to OWASP/CWE"], [], "none (read-only)", ["findings", "fix plan"], SAFE)
  };
});

// ../../src/security/coach.ts
function secureDesign(feature) {
  return [
    `# Secure design — ${feature || "feature"}`,
    "- Threat model first: assets, entry points, trust boundaries, abuse cases.",
    "- Authentication: proven libraries; MFA for sensitive operations.",
    "- Authorization: least privilege, enforced at every boundary; default deny.",
    "- Input validation and output encoding on every untrusted input.",
    "- Secrets: environment / secret manager, never in code; rotate regularly.",
    "- Logging without secrets; audit security-relevant events.",
    "- Fail closed with safe defaults; handle errors without leaking internals.",
    "- Dependencies: pin, audit (OSV), and patch promptly."
  ].join(`
`);
}
function secureApi(spec) {
  return [
    `# Secure API checklist${spec ? ` — ${spec}` : ""}`,
    "- AuthN/AuthZ on every endpoint; object-level checks (prevent IDOR).",
    "- Validate request schemas; reject unknown fields.",
    "- Rate limit and quota per principal.",
    "- No sensitive data in URLs or logs.",
    "- Consistent error format; no stack traces to clients.",
    "- CORS restricted to known origins; security headers set.",
    "- Versioning and deprecation policy."
  ].join(`
`);
}
function secureCi() {
  return [
    "# Secure CI checklist",
    "- Pin action/runner versions; least-privilege tokens.",
    "- SAST (semgrep), dependency audit (osv/npm audit), secret scan on every PR.",
    "- Block merges on high-severity findings.",
    "- Sign artifacts; generate an SBOM (syft).",
    "- Store secrets in the CI secret store; never echo them."
  ].join(`
`);
}
function secureDocker() {
  return [
    "# Secure Docker checklist",
    "- Pin base image by digest; use minimal/distroless bases.",
    "- Run as a non-root USER; drop capabilities; read-only rootfs where possible.",
    "- No secrets in ENV/ARG/layers; use build/runtime secrets.",
    "- Scan images (trivy/grype); keep them small.",
    "- HEALTHCHECK and explicit, least-privilege ports."
  ].join(`
`);
}
function secureDeploy() {
  return [
    "# Secure deployment checklist",
    "- TLS everywhere; HSTS; modern ciphers.",
    "- Least-privilege service accounts and network policies.",
    "- Secrets from a manager; rotation and audit.",
    "- Centralized logging/monitoring with alerts.",
    "- Backups + tested restore; documented incident response.",
    "- Patch cadence and vulnerability management."
  ].join(`
`);
}
var init_coach = () => {};

// ../../src/security/commands.ts
import * as fsp from "node:fs/promises";
import * as fs7 from "node:fs";
import * as path3 from "node:path";
function resolveInside(cwd, p2) {
  const root = path3.resolve(cwd);
  const r = path3.resolve(root, p2);
  return r === root || r.startsWith(root + path3.sep) ? r : null;
}
function collect2(target, exts) {
  const out = [];
  let st;
  try {
    st = fs7.statSync(target);
  } catch {
    return out;
  }
  if (st.isFile())
    return [target];
  const walk = (d) => {
    for (const e of fs7.readdirSync(d, { withFileTypes: true })) {
      if (SKIP3.has(e.name))
        continue;
      const f = path3.join(d, e.name);
      if (e.isDirectory())
        walk(f);
      else if (exts.test(e.name))
        out.push(f);
    }
  };
  walk(target);
  return out;
}
function readMode(cwd) {
  try {
    const m = fs7.readFileSync(path3.join(cwd, ".309", "security", "mode"), "utf8").trim();
    if (SECURITY_MODES.includes(m))
      return m;
  } catch {}
  return "security";
}
function writeMode(cwd, m) {
  fs7.mkdirSync(path3.join(cwd, ".309", "security"), { recursive: true });
  fs7.writeFileSync(path3.join(cwd, ".309", "security", "mode"), m);
}
async function handleSecurityCommand(tokens, cwd) {
  let head = tokens[0] ?? "";
  let sub = tokens[1] ?? "";
  let rest = tokens.slice(2);
  const STANDALONE = {
    net: "network",
    vuln: "vuln",
    ir: "incident",
    attack: "attack",
    "threat-model": "threat-model",
    compliance: "compliance",
    playbook: "playbook",
    playbooks: "playbooks",
    lab: "lab",
    doctor: "doctor",
    kali: "doctor",
    "secure-design": "secure-design",
    "secure-api": "secure-api",
    "secure-ci": "secure-ci",
    "secure-docker": "secure-docker",
    "secure-deploy": "secure-deploy"
  };
  if (head in STANDALONE) {
    sub = STANDALONE[head];
    rest = tokens.slice(1);
    head = "security";
  }
  const scope = new ScopeStore(cwd);
  const findings = new FindingStore(cwd);
  if (head === "mode") {
    if (!SECURITY_MODES.includes(sub))
      return "modes: " + SECURITY_MODES.join(", ");
    writeMode(cwd, sub);
    return `security mode -> ${sub}
${securityPrompt(sub).split(`
`).slice(1).join(`
`)}`;
  }
  if (head === "scope") {
    const s = scope.get();
    switch (sub) {
      case "":
      case "show":
        return s ? JSON.stringify(s, null, 2) : "no scope set. Use `/scope set local` or `/scope set <type> <target>`.";
      case "set":
        if (rest[0] === "local") {
          scope.setLocal();
          return "scope = local workspace (localhost only)";
        }
        if (!rest[1])
          return "usage: /scope set <type> <target>";
        scope.setTarget(rest[1], rest[0]);
        return `scope target = ${rest[1]} (${rest[0]}). Not approved yet — run /scope approve.`;
      case "add-target":
        scope.addTarget(rest[0] ?? "");
        return `allowed host added: ${rest[0]}`;
      case "deny-target":
        scope.denyTarget(rest[0] ?? "");
        return `denied host: ${rest[0]}`;
      case "allow-port":
        scope.allowPort(Number(rest[0]));
        return `allowed port: ${rest[0]}`;
      case "intensity":
        scope.setIntensity(rest[0] ?? "passive");
        return `intensity = ${rest[0]}`;
      case "approve":
        if (!s)
          return "set a scope first";
        scope.approve(rest.join(" "));
        return "scope APPROVED for authorized testing";
      case "clear":
        scope.clear();
        return "scope cleared";
      default:
        return HELP;
    }
  }
  switch (sub) {
    case "":
    case "help":
      return HELP;
    case "status": {
      const s = scope.get();
      return `mode: ${readMode(cwd)}
scope: ${s ? `${s.target || "local"} (${s.targetType}, ${s.approved ? "approved" : "NOT approved"}, intensity ${s.intensity})` : "none"}
findings: ${findings.all().length}`;
    }
    case "rules":
      return SECURITY_BOUNDARY;
    case "classify": {
      const c = classifyRequest(rest.join(" "));
      return `class: ${c.cls}${c.category ? ` (${c.category})` : ""}
reasons: ${c.reasons.join("; ")}`;
    }
    case "safe-alternative": {
      const v = evaluate({ requestText: rest.join(" ") }, scope.get());
      return v.allow ? "Within safe/defensive bounds — proceed (define scope for any active test)." : `${v.reason}
Safer path: ${v.alternative}`;
    }
    case "code": {
      const p2 = resolveInside(cwd, rest[0] ?? ".");
      if (!p2)
        return "path escapes workspace";
      const found = [];
      for (const f of collect2(p2, /\.(ts|tsx|js|jsx|py|go|rb|java|php|c|cpp|cs)$/).slice(0, 500)) {
        try {
          found.push(...auditText(await fsp.readFile(f, "utf8"), path3.relative(cwd, f)));
        } catch {}
      }
      findings.add(found);
      return found.length ? `${found.length} finding(s):

${found.slice(0, 15).map(formatFinding).join(`

`)}` : "no code-security findings";
    }
    case "secrets": {
      const p2 = resolveInside(cwd, rest[0] ?? ".");
      if (!p2)
        return "path escapes workspace";
      const found = [];
      for (const f of collect2(p2, /\.(ts|js|py|go|rb|java|php|env|json|ya?ml|toml|ini|sh|txt|md|cfg|conf)$/).slice(0, 500)) {
        try {
          found.push(...scanSecrets(await fsp.readFile(f, "utf8"), path3.relative(cwd, f)));
        } catch {}
      }
      findings.add(found);
      return found.length ? `${found.length} secret(s) (redacted):
${found.map((f) => `- ${f.asset}: ${f.title} — ${f.evidence}`).join(`
`)}` : "no secrets detected";
    }
    case "attack-surface":
      return scanWorkspace(cwd).summary;
    case "dependencies": {
      const deps = scanWorkspace(cwd).dependencies;
      return deps.length ? `dependencies (${deps.length}):
${deps.join(", ")}` : "no dependencies found";
    }
    case "scan": {
      const code = await handleSecurityCommand(["security", "code", "."], cwd);
      const sec = await handleSecurityCommand(["security", "secrets", "."], cwd);
      return `attack surface: ${scanWorkspace(cwd).summary}

code review: ${code.split(`
`)[0]}
secrets: ${sec.split(`
`)[0]}

Run /security report for the full report.`;
    }
    case "report": {
      const all = findings.all();
      const fmt = rest[0] ?? "markdown";
      return fmt === "json" ? toJson(all) : fmt === "sarif" ? toSarif(all) : fmt === "csv" ? toCsv(all) : toMarkdown(all);
    }
    case "findings": {
      const all = findings.all();
      return all.length ? all.map((f) => `${f.id} [${f.severity}] ${f.title} — ${f.asset} (${f.status})`).join(`
`) : "no findings recorded";
    }
    case "doctor":
    case "kali":
    case "tools": {
      const tools = await detectSecurityTools();
      const installed = tools.filter((t) => t.installed).length;
      return `installed ${installed}/${tools.length}
${tools.map((t) => `${t.installed ? "✓" : "·"} ${t.name} (${t.category}, ${t.classification}/${t.riskLevel})`).join(`
`)}`;
    }
    case "owasp":
      return Object.entries(OWASP_TOP10_2021).map(([k, v]) => `${k}  ${v}`).join(`
`);
    case "mitre": {
      const id = (rest[0] ?? "").toUpperCase();
      const t = MITRE[id];
      return t ? `${id} ${t.name}
tactic: ${t.tactic}
detection: ${t.detection}
mitigation: ${t.mitigation}` : `known techniques: ${Object.keys(MITRE).join(", ")}`;
    }
    case "harden":
    case "linux": {
      const f = await hardeningChecks();
      findings.add(f);
      return f.length ? `${f.length} hardening finding(s):
${f.map(formatFinding).join(`

`)}` : "no hardening issues detected (read-only checks)";
    }
    case "network": {
      const n = await networkSnapshot();
      return `interfaces:
${n.interfaces}

listening ports:
${n.listeningPorts}`;
    }
    case "incident": {
      if (rest[0] === "contain-plan")
        return containmentPlan().map((s) => `- ${s}`).join(`
`);
      const ir = await collect();
      return `processes:
${ir.processes.split(`
`).slice(0, 8).join(`
`)}

connections:
${ir.connections.split(`
`).slice(0, 8).join(`
`)}

persistence:
${ir.persistence.split(`
`).slice(0, 8).join(`
`)}

(read-only; nothing was modified)`;
    }
    case "attack": {
      const all = findings.all();
      if (rest[0] === "coverage")
        return coverage(all);
      const m = mapFindings(all);
      return m.length ? m.map((e) => `${e.findingId} ${e.category} -> ${e.technique} ${e.name} (${e.tactic}); detect: ${e.detection}`).join(`
`) : "no findings to map";
    }
    case "threat-model":
      return toMarkdown2(threatModel(cwd));
    case "compliance":
      return complianceReport(rest[0] ?? "owasp");
    case "vuln": {
      const hits = await auditDependencies(cwd);
      return hits.length ? hits.map((h) => `${h.package}: ${h.id} (${h.severity})${h.fixed ? ` -> fixed in ${h.fixed}` : ""}`).join(`
`) : "no known vulnerabilities found (or registry unavailable offline)";
    }
    case "cloud":
    case "containers": {
      const f = auditIaC(cwd);
      findings.add(f);
      return f.length ? `${f.length} IaC/container finding(s):
${f.map(formatFinding).join(`

`)}` : "no container/IaC issues detected";
    }
    case "web": {
      const w = await auditWeb(rest[0] ?? "", { scope: scope.get() });
      if (w.blocked)
        return `blocked: ${w.blocked}`;
      const r = w.result;
      return `web ${r.url} [${r.status}]
missing headers: ${r.missingHeaders.join(", ") || "none"}
tech: ${r.tech.join(", ") || "n/a"}
${r.notes.join(`
`)}`;
    }
    case "playbooks":
      return `playbooks: ${listPlaybooks().join(", ")}`;
    case "playbook": {
      if (rest[0] === "show")
        return showPlaybook(rest[1] ?? "");
      if (rest[0] === "run") {
        const s = scope.get();
        return `${showPlaybook(rest[1] ?? "")}

Active steps require an approved scope (current: ${s ? s.approved ? "approved" : "NOT approved" : "none"}). Passive steps run now via the matching /security commands.`;
      }
      return showPlaybook(rest[0] ?? "");
    }
    case "lab": {
      if (rest[0] !== "create" || !rest[1])
        return "usage: /lab create <web-vuln|api-vuln|linux-audit|pcap>";
      const res = createLab(rest[1], cwd);
      return `${res.warning}
created:
${res.created.join(`
`)}`;
    }
    case "secure-design":
      return secureDesign(rest.join(" "));
    case "secure-api":
      return secureApi(rest.join(" "));
    case "secure-ci":
      return secureCi();
    case "secure-docker":
      return secureDocker();
    case "secure-deploy":
      return secureDeploy();
    case "fix": {
      const f = findings.byId(rest[0] ?? "");
      return f ? `${f.id} ${f.title}
proposed fix: ${f.fix}
(applying changes requires explicit approval; review, then apply in your editor or via an approved fix step)` : "usage: /security fix <finding-id>";
    }
    default:
      return `"/security ${sub}" is part of the security suite. Available now: status, rules, classify, safe-alternative, scan, code, secrets, attack-surface, dependencies, report, findings, doctor, owasp, mitre. Active tooling (web/network/cloud/kali/incident-response/lab) is policy-gated and needs an approved scope — see /security help.`;
  }
}
var SKIP3, HELP = `309 security commands:
  /mode <security|audit|blue-team|purple-team|pentest-lab|hardening|incident-response|secure-code>
  /scope show | set local | set <type> <target> | add-target <host> | allow-port <n> | deny-target <host> | intensity <level> | approve | clear
  /security status | rules | classify <text> | safe-alternative <text>
  /security scan | code <path> | secrets <path> | attack-surface | dependencies
  /security report [markdown|json|sarif|csv] | findings
  /security doctor | tools | owasp | mitre <Txxxx>
Active/destructive tools (nmap, sqlmap, hydra, metasploit, ...) are detected and policy-gated: they require an approved, in-scope, owned/lab target and are never run silently or destructively.`;
var init_commands = __esm(() => {
  init_scope();
  init_findings();
  init_classify();
  init_containment();
  init_codeAudit();
  init_secrets();
  init_attackSurface();
  init_reports();
  init_doctor();
  init_prompt();
  init_mappings();
  init_network();
  init_hardening();
  init_incident();
  init_threatModel();
  init_attackMap();
  init_compliance();
  init_vulnIntel();
  init_cloudAudit();
  init_webAudit();
  init_lab();
  init_playbooks();
  init_coach();
  SKIP3 = new Set(["node_modules", ".git", "dist", "coverage", ".309"]);
});

// ../../src/security/types.ts
var init_types = () => {};

// ../../src/security/index.ts
var init_security = __esm(() => {
  init_classify();
  init_scope();
  init_containment();
  init_policy();
  init_secrets();
  init_codeAudit();
  init_attackSurface();
  init_findings();
  init_reports();
  init_doctor();
  init_prompt();
  init_commands();
  init_types();
});

export { handleSecurityCommand, init_security };
