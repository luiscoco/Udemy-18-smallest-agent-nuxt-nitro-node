# The Smallest Agent · Nuxt + Nitro + Node.js

Independent edition 18: Nuxt/Vue → Nitro/H3 Node endpoints → TypeScript Claude Agent SDK → Claude API. One Node process serves the UI and API. It retains the five lesson sections, large readable typography, pastel cards, persistent theme, colored code, safe Markdown, real message timeline and sixteen-step source-linked UML walkthrough.

## Run on Windows

Install Node.js 24. From **Lesson 0**:

```powershell
cd .\18-smallest-agent-nuxt-nitro-node
npm ci
if (!(Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

Set your own ANTHROPIC_API_KEY, save, then:

```powershell
npm run dev
```

Open **http://127.0.0.1:5900**. UI and Nitro API share this port. Ctrl+C stops Nuxt. No Python, separate backend, Docker, virtual environment or cloud login is needed. Start-Application.ps1 resolves its own directory.

## Configure this edition

```dotenv
ANTHROPIC_API_KEY=sk-ant-replace-with-your-key
CLAUDE_MODEL=
AGENT_SYSTEM_PROMPT=You are a concise teaching assistant.
AGENT_MAX_TURNS=1
HOST=127.0.0.1
PORT=5900
TRUST_PROXY=0
```

Nuxt dev loads this project's .env. The supplied npm start explicitly loads .env for local production use; direct Nitro execution reads only process environment. Existing environment values take precedence. Restart after editing. Blank CLAUDE_MODEL uses the SDK default; choose a model accessible to your account to override it. Turns accept integers 1–10. Health indicates key presence, not valid authentication, model permissions or credits. No private .env is supplied or copied from another edition. Never put a key in NUXT_PUBLIC_ variables or public assets.

## Build and run production locally

```powershell
npm run typecheck
npm test
npm run build
npm run verify:deployment
```

Stop development, then:

```powershell
npm start
```

Open the same **http://127.0.0.1:5900**. Build regenerates sixteen source excerpts and SVG/PlantUML, compiles Nuxt/Nitro using the node-server preset, then explicitly packages the SDK and installed platform-native CLI into .output/server/node_modules. No inference happens during build. Build on the target OS: the Windows output contains a Windows executable; Linux deployment requires a Linux build. Do not omit optional dependencies during installation.

The standalone entry is `.output/server/index.mjs`. Direct execution defaults to port 3000 unless PORT/NITRO_PORT is provided; it does not load .env. The local npm launcher defaults to 5900/127.0.0.1. Set HOST=0.0.0.0 when exposing a container to its ingress. See DEPLOYMENT.md for Node hosting and the supplied non-root Debian Dockerfile.

## Application and API

- Application lab: Hello world!, examples, trimmed prompt counter, Stream/Simple, synchronous duplicate lock, elapsed time, Cancel, safe timeline/JSON, final answer and metrics, copy and Markdown download. It remains mounted across lesson navigation.
- What you will learn, How to run, Architecture & workflow and Code walkthrough contain this edition's actual Vue/Nitro/TypeScript content. Each of sixteen UML steps includes a generated colored excerpt, source path/line and explanation. SVG and PlantUML downloads work offline; the native-size diagram scrolls internally.
- GET /api/health reports readiness and key presence. POST /api/agent/query accepts JSON `{ "prompt": "Hello world!" }` and returns result, num_turns, duration_ms, total_cost_usd and is_error.
- POST /api/agent/stream emits UTF-8 SSE message events and done after a final SDK result. Missing key/failure emits error without done. The UI requires both final result and done and preserves result errors. These are SDK messages rather than token deltas.
- /docs is a custom API reference; /openapi.json is the schema. Unknown APIs and private dotfile paths return 404.

The Node adapter bounds actual request bytes to 32 KiB, flushes response headers and awaits a backpressure-aware stream pipeline. Validation checks exact JSON media, same origin and a trimmed 1–4000 character string before inference. Provider failures and invalid inputs do not echo raw diagnostics or submitted values. Application execution has a 180-second deadline; request cancellation aborts owned SDK work. Forwarded HTTPS is trusted only with explicit TRUST_PROXY=1 behind a controlled proxy, and forwarded Host never chooses the allowed origin. Same-origin checks are not user authentication.

The actual Claude Agent SDK owns its CLI subprocess. Tools, settings, skills, MCP, plugins and persisted sessions are disabled. Each request owns temporary work/home/config directories and closes/cleans them on completion or cancellation. Selected public projections omit thinking, private paths/session IDs and tool payloads; exact configured-key occurrences are redacted. Inherited cloud credentials are excluded from the CLI environment. This is not metadata or network isolation. Cost remains null when unreported. DOMPurify sanitizes highlighted Markdown before Vue v-html.

## Verification

With the server running under a placeholder key, run npm run verify:http and npm run verify:browser. Both refuse a configured key to avoid paid inference. Browser checks use installed Chrome; VERIFY_BASE_URL can override port 5900. VERIFICATION.md records actual evidence and remaining limits. BUILD-PROMPT.txt matches the standalone prompt in Lesson 0.

The locked Nuxt/Nitro toolchain currently has low/moderate audit findings. Their details and the packaged-runtime distinction are recorded in VERIFICATION.md; no incompatible forced framework downgrade was applied.

References: [Nuxt](https://nuxt.com), [Nitro Node output](https://nitro.build/deploy/runtimes/node), [Claude Agent SDK hosting](https://code.claude.com/docs/en/agent-sdk/hosting).
