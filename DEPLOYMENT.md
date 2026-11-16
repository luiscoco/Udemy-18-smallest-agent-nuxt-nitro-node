# Deploy the Nuxt + Nitro + Node.js edition

This edition targets a normal Node server through Nitro's node-server preset. It uses a native CLI subprocess and writable temporary directories. Build for the target platform; do not upload Windows native output to a Linux host. No hosting account, container or cloud resource has been created during implementation.

## Node hosting

1. Choose a host with Node.js 24, compatible glibc Linux (or the intended supported operating system), writable OS temporary storage, subprocess execution and outbound HTTPS to Anthropic. The native CLI alone is over 300 MB; account for output size and per-run memory/process usage.
2. On the target platform, install with npm ci, run npm test, npm run typecheck, npm run build and npm run verify:deployment. Build packages the actual native platform executable and SDK, preserving file modes. Optional dependencies must be installed. The same source's Linux build packages Linux; Windows local verification packages Windows.
3. Transfer the complete .output directory with its node_modules/native executable and permissions. Do not ship the root .env, source dependency tree or verification screenshots. Secrets must be injected separately by the host.
4. Set ANTHROPIC_API_KEY privately, optional CLAUDE_MODEL/system prompt, AGENT_MAX_TURNS=1, HOST=0.0.0.0 as required by ingress, and PORT to the host's assigned port. Run `node .output/server/index.mjs`. The entry reads process environment, not a local .env file. npm start is a local convenience that explicitly loads .env and defaults to loopback port 5900.
5. Put the service behind HTTPS and access control appropriate to the intended users. Same-origin validation does not authenticate direct HTTP clients; the agent endpoints spend provider credits. Configure user authentication or a private authenticated gateway before intentionally exposing inference. Set TRUST_PROXY=1 only when direct access is controlled and the proxy overwrites X-Forwarded-Proto and preserves the intended Host. Forwarded Host is not accepted as an origin authority.
6. Give the reverse proxy enough response time for the 180-second application deadline plus cleanup, disable SSE buffering where applicable and verify streamed events arrive progressively. Set process/resource/concurrency limits based on measured workload. There is no durable conversation store or background queue in this lesson.

## Docker option

The multi-stage Dockerfile uses Node 24 Debian for both build and runtime, installs Bash/Git/CA certificates, builds Linux SDK dependencies inside the image and runs as the non-root node user. The final image contains .output only. .dockerignore excludes host dependency/build trees and all environment files.

With Docker Desktop's Linux engine running, from this edition's root:

```powershell
docker build --platform linux/amd64 -t smallest-agent-nuxt:lesson18 .
docker run --rm -p 5900:5900 --env-file .env -e HOST=0.0.0.0 smallest-agent-nuxt:lesson18
```

The image defaults to HOST=0.0.0.0 and PORT=5900. For this local .env example, HOST=127.0.0.1 would override that image default and prevent ingress through the container mapping. Either remove HOST from a separate private container environment file, or explicitly override it:

```powershell
docker run --rm -p 5900:5900 --env-file .env -e HOST=0.0.0.0 smallest-agent-nuxt:lesson18
```

Prefer a host secret store for real deployments. An environment file is only a local convenience; never bake it into an image or commit it. Docker is not required to run the application locally.

## Hosted verification

- Check .output includes the platform CLI and that --version executes before testing inference. No version check validates model access.
- Confirm intended users can reach the UI and API, and unauthorized callers cannot invoke paid inference.
- Open all five views, highlighted code, workflow downloads, /docs and health. Check missing-key behavior before supplying a real key.
- With your key, run Simple and Stream. These use API credits. Require actual SDK initialization/assistant/final messages, final plus done and reported result metrics. Verify non-success subtypes remain errors.
- Test cancellation, invalid/revoked key, model access failure, deadline, server restart and concurrent runs. Each run must own distinct temporary directories. A hard process kill can interrupt cleanup; runtime directories are ephemeral rather than persisted sessions.
- Monitor CPU, memory, process/file-descriptor usage, response duration and provider spending. Environment filtering is not a network or metadata sandbox.

Local build, injected tests and browser checks are not proof of hosted provider execution. VERIFICATION.md records what was actually exercised. Nitro's Node runtime options are documented at [Node deployment](https://nitro.build/deploy/runtimes/node), and the SDK subprocess model at [Agent SDK hosting](https://code.claude.com/docs/en/agent-sdk/hosting).
