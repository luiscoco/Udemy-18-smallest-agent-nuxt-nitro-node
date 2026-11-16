import {cpSync,existsSync,mkdirSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const names=['@anthropic-ai/claude-agent-sdk',`@anthropic-ai/claude-agent-sdk-${process.platform}-${process.arch}`];
for(const name of names){const source=resolve('node_modules',name);if(!existsSync(source))throw Error(`Missing ${name}; install optional dependencies and build on the target OS (glibc Linux for deployment).`);
 const target=resolve('.output/server/node_modules',name);mkdirSync(target,{recursive:true});cpSync(source,target,{recursive:true});
 console.log(`Packaged ${name}@${JSON.parse(readFileSync(resolve(source,'package.json'),'utf8')).version}`);
}
