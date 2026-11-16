# Verification · 2026-11-10

Verified locally on Windows with Node.js 24.22.2, Nuxt 4.6.4, Nitro 2.13.6, Vue 3.5.45 and Agent SDK 0.3.319. Earlier editions and their private environment files were not changed or copied. Checks used a placeholder key or injected SDK iterators; no paid inference ran.

- **36 automated tests passed:** 12 SDK/handler tests, 5 runtime/deadline/proxy tests, 5 real Node socket adapter tests and 14 client/API tests. These cover input/media/JSON/body/origin validation, safe SDK projection, required final result, non-success subtypes, missing credentials, cancellation, temporary cleanup, credential filtering, application deadline, UTF-8 SSE, oversized inputs followed by valid keep-alive requests, response disconnect, Vue navigation/retained state, duplicate locking, theme and sanitized highlighting.
- Nuxt typechecking passed for components/client contracts and Nitro server modules.
- Production Nuxt/Nitro build passed. Sixteen source-linked excerpts and SVG/PlantUML generated successfully. Nuxt's #shared alias keeps shared validators bundled; the sanitizer uses an SSR-safe capability check that preserves displayed code through Nitro transforms.
- Production package checks passed: the standalone Nitro entry, SDK metadata and platform-native executable exist in .output. The Windows executable is approximately 328.8 MiB. Linux deployment must build and package its Linux executable on Linux.
- Real production HTTP checks passed for SSR HTML/JavaScript/SVG, API reference/schema, validation boundaries, missing-key query/SSE, dotfile rejection and unknown API routing.
- Chrome checks passed against the production server for all five sections, retained prompt, missing-key streaming feedback, sixteen colored source cards, loaded native-size UML, internal scrolling, persistent theme and no page overflow at 390px in each view. Screenshots are in ignored verification/.
- **Standalone artifact check passed:** copied .output to an OS temporary directory outside the project, started it without source node_modules, verified SSR/JavaScript/API/SSE and ran the packaged CLI --version offline. The owned temporary directory and process were cleaned up afterward.
- The documented npm run dev command passed the same Chrome checks independently; its real health endpoint returned 200 and missing-key query returned 503.

## Dependency audit

The final full project audit reported **15 findings: 6 low and 9 moderate, no high or critical**. Direct leaf advisories include deepmerge prototype poisoning, glob cancellation traversal and minimatch amplification, propagated through the Nuxt/Nitro build/deployment toolchain. The installed latest deepmerge 4.3.1 has no fixed release in this audit; suggested automatic fixes included incompatible framework downgrades/major changes. No forced downgrade or incompatible transitive override was applied.

The three leaf packages deepmerge, glob and minimatch are absent from the packaged .output/server/node_modules tree. This does not constitute an independent vulnerability audit of every runtime artifact. The complete current audit is reproducible with npm audit and was saved under ignored verification/audit-full.json. Review upstream framework/toolchain updates before broader deployment.

## Reproduce

```powershell
npm ci
npm run typecheck
npm test
npm run build
npm run verify:deployment
npm run verify:standalone
```

Start npm start under a placeholder ANTHROPIC_API_KEY, then run npm run verify:http and npm run verify:browser in another terminal. Browser checks use installed Chrome; both verification scripts refuse a configured key. VERIFY_BASE_URL can override the default port 5900. npm run dev was also started independently on the documented port.

## Limits

The Docker CLI is installed but its Linux engine pipe was unavailable, so no image was built or executed. No cloud/host deployment or billed resource was created. Linux binary execution, live Claude authentication/model access/credits, hosted HTTPS/access control/proxy buffering, real provider cancellation and resource behavior remain untested. A hard process kill can interrupt cleanup. Temporary directories and credential filtering are not a metadata or network sandbox.
