export default defineNuxtConfig({
 compatibilityDate:'2026-11-10',
 devtools:{enabled:false},
 telemetry:false,
 css:['~/assets/main.css'],
 app:{head:{title:'The Smallest Agent · Nuxt + Nitro + Node.js',meta:[{name:'description',content:'Learn the Claude Agent SDK through Nuxt, Nitro and Node.js, with colored code and a source-linked UML workflow.'}]}},
 nitro:{preset:'node-server',externals:{external:['@anthropic-ai/claude-agent-sdk']}},
});
