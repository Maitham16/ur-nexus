# UR-AGENT providers

UR-AGENT integrates official model access paths only. It supports subscription
CLI login flows, explicit API-key providers, and local OpenAI-compatible
runtimes. It does not implement hidden or unofficial authentication.

## Legal auth policy

UR-AGENT never:

- scrapes browser cookies or browser sessions
- extracts, copies, or reuses OAuth refresh tokens
- reads hidden provider auth files directly
- bypasses subscription, quota, region, product, or organization restrictions
- proxies a consumer web session as an API
- claims provider support unless the official CLI/API path works

UR-AGENT stores only safe config: provider name, model name, base URL, command
path, fallback preference, and non-secret preferences. API keys are read from
environment variables only when the user explicitly selects API mode.

## Provider matrix

| Provider | Access type | Legal path |
| --- | --- | --- |
| ChatGPT/Codex | subscription | official Codex CLI login |
| Claude Code | subscription | official Claude Code login |
| Gemini CLI | subscription | official Gemini Code Assist login |
| Antigravity | subscription | official Antigravity login, where supported |
| OpenAI | API | `OPENAI_API_KEY` |
| Anthropic Claude | API | `ANTHROPIC_API_KEY` |
| Gemini | API | `GEMINI_API_KEY` |
| OpenRouter | API/router | `OPENROUTER_API_KEY` |
| Ollama | local | localhost Ollama runtime |
| LM Studio | local | local OpenAI-compatible server |
| llama.cpp | local | local OpenAI-compatible server |
| vLLM | local/server | OpenAI-compatible server |

## Commands

```sh
ur provider list
ur provider status
ur provider doctor
ur provider doctor codex-cli
ur auth chatgpt
ur auth claude
ur auth gemini
ur auth antigravity
ur config set provider codex-cli
ur config set provider claude
ur config set provider "Claude Code"
ur config set provider antigravity
ur provider doctor agy
ur config set provider ollama
ur config set provider openai-compatible
ur config set model <model>
ur config set base_url <url>
ur config set provider.fallback ollama
```

Provider config and doctor commands accept canonical IDs and common aliases:

| Canonical ID | Accepted examples |
| --- | --- |
| `codex-cli` | `chatgpt`, `codex`, `openai codex` |
| `claude-code-cli` | `claude`, `Claude Code`, `anthropic claude` |
| `gemini-cli` | `gemini`, `gemini cli`, `gemini code assist` |
| `antigravity-cli` | `antigravity`, `agy`, `ag`, `google antigravity` |
| `openai-api` | `openai`, `openai api` |
| `anthropic-api` | `anthropic`, `claude api` |
| `gemini-api` | `gemini api`, `google gemini api` |
| `openrouter` | `openrouter api` |
| `openai-compatible` | `compatible`, `openai compatible` |
| `ollama` | `ollama local` |
| `lmstudio` | `LM Studio`, `lm-studio` |
| `llama.cpp` | `llama cpp`, `llamacpp`, `llama-cpp` |
| `vllm` | `vllm server` |

`ur provider doctor` checks the selected provider. It reports installed/missing
CLIs, official login status where available, API key presence for API providers,
local endpoint reachability, detectable model availability, unsupported account
type signals, and fallback configuration.

Fallback is never silent by default. If the selected provider fails, UR-AGENT
reports the selected provider, failure reason, suggested fix, and configured
fallback option.

## Subscription CLI providers

- `codex-cli`: detects `codex --version`, uses `codex login` or
  `codex login --device-auth`, and checks `codex login status`.
- `claude-code-cli`: detects `claude --version`, uses `claude auth login`, and
  checks `claude auth status` when available. If `ANTHROPIC_API_KEY` is set,
  doctor warns that API-key mode may override subscription auth.
- `gemini-cli`: launches only the official Gemini CLI flow. If the detected
  path is an unsupported personal-account path, UR-AGENT prints a clear error.
- `antigravity-cli`: detects official CLI commands including `agy --version`,
  `antigravity --version`, `google-antigravity --version`, or `ag --version`
  where installed. It launches only an installed official CLI command where
  supported; UR-AGENT does not invent flags.

## API and local providers

API providers require explicit user selection and environment keys:

```sh
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
GEMINI_API_KEY=...
OPENROUTER_API_KEY=...
```

OpenAI-compatible endpoints can point at local or cloud endpoints:

```sh
ur config set provider openai-compatible
ur config set base_url http://localhost:1234/v1
ur config set model local-model-name
```

Local providers use their normal servers:

- Ollama: `http://localhost:11434`
- LM Studio: `http://localhost:1234/v1`
- llama.cpp server mode: `http://localhost:8080/v1`
- vLLM server mode: `http://localhost:8000/v1`
