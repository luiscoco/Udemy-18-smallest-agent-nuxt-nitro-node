import assert from 'node:assert/strict';
import {existsSync,readFileSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
const config=readFileSync('nuxt.config.ts','utf8');assert.match(config,/preset:'node-server'/);
assert.ok(existsSync('.output/server/index.mjs'));
for(const name of ['@anthropic-ai/claude-agent-sdk',`@anthropic-ai/claude-agent-sdk-${process.platform}-${process.arch}`]){
 const path=resolve('.output/server/node_modules',name);assert.ok(existsSync(path),`${name} must be packaged`);
 assert.equal(JSON.parse(readFileSync(resolve(path,'package.json'),'utf8')).version,'0.3.319');
}
const binary=resolve('.output/server/node_modules',`@anthropic-ai/claude-agent-sdk-${process.platform}-${process.arch}`,process.platform==='win32'?'claude.exe':'claude');assert.ok(statSync(binary).size>1000000);
assert.match(readFileSync('.dockerignore','utf8'),/\.env\*/);assert.match(readFileSync('Dockerfile','utf8'),/USER node/);
console.log(`Nitro Node entry, SDK and native executable packaged (${(statSync(binary).size/1024/1024).toFixed(1)} MiB binary); container and secret exclusions passed.`);
