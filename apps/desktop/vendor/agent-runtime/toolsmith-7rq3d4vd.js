import {
  commandExists,
  init_sysinfo
} from "./index-bn9g96g3.js";
import"./index-0b2n9cdp.js";
import"./index-133awary.js";
import"./index-pnhq4694.js";
import"./index-4mfpjpj0.js";
import"./index-mpmmtc93.js";
import"./index-s5dp14ed.js";
import"./index-6dy59xbm.js";
import"./index-0r3wd4mq.js";
import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
import"./index-h7h0j06f.js";
import"./index-7h9ddexs.js";
import"./index-f80dj2bz.js";
import"./index-q00jv0fc.js";
import"./index-cs7da0vv.js";
import"./index-ycnb0yeb.js";
import"./index-vpczjthp.js";
import"./index-t784n9jz.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/toolsmith/toolsmith.ts
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
