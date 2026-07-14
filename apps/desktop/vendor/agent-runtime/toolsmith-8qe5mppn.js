import {
  commandExists,
  init_sysinfo
} from "./index-pbs27mmg.js";
import"./index-e7zhbfbk.js";
import"./index-31dnhhm9.js";
import"./index-f7bfe40r.js";
import"./index-z5aeypvg.js";
import"./index-5jmh1e0k.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-wxsgjqjk.js";
import"./index-s1a1wahe.js";
import"./index-wred0kdg.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-9xfq6h4s.js";
import"./index-0x08e9n5.js";
import"./index-4bphgmcc.js";
import"./index-7bd814mt.js";
import"./index-m9qhxms7.js";
import"./index-5h7w9qkc.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/toolsmith/toolsmith.ts
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
var TEMPLATES, call = async (args) => {
  const [name, langArg] = (args ?? "").trim().split(/\s+/).filter(Boolean);
  const auto = [["python3", "python"], ["node", "node"], ["bash", "bash"], ["go", "go"], ["cargo", "rust"]].find(([bin]) => commandExists(bin))?.[1] ?? "python";
  const lang = langArg ?? auto;
  const dir = join(getCwd(), ".ur", "tools");
  if (!name) {
    const files = existsSync(dir) ? readdirSync(dir) : [];
    return { type: "text", value: files.length ? `tools:
` + files.map((f) => "  " + f).join(`
`) : "no tools yet. usage: /toolsmith <name> <python|bash|node|go|rust>" };
  }
  const tpl = TEMPLATES[lang];
  if (!tpl)
    return { type: "text", value: `unknown lang "${lang}". choose: ${Object.keys(TEMPLATES).join(", ")}` };
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${name}.${tpl.ext}`);
  if (existsSync(file))
    return { type: "text", value: `already exists: .ur/tools/${name}.${tpl.ext}` };
  writeFileSync(file, tpl.body);
  return { type: "text", value: `created .ur/tools/${name}.${tpl.ext}
Ask UR to run it — it will request approval before executing, and you can keep it as a plugin if useful.` };
};
var init_toolsmith = __esm(() => {
  init_cwd();
  init_sysinfo();
  TEMPLATES = {
    python: { ext: "py", body: `#!/usr/bin/env python3
"""UR helper tool."""


def main() -> None:
    print("hello from UR toolsmith")


if __name__ == "__main__":
    main()
` },
    bash: { ext: "sh", body: `#!/usr/bin/env bash
set -euo pipefail
echo "hello from UR toolsmith"
` },
    node: { ext: "js", body: `#!/usr/bin/env node
console.log("hello from UR toolsmith")
` },
    go: { ext: "go", body: `package main

import "fmt"

func main() {
	fmt.Println("hello from UR toolsmith")
}
` },
    rust: { ext: "rs", body: `fn main() {
    println!("hello from UR toolsmith");
}
` }
  };
});
init_toolsmith();

export {
  call
};
