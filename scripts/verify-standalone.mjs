import assert from 'node:assert/strict';
import {cpSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,sep,basename} from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {createServer} from 'node:net';

const directory=mkdtempSync(join(tmpdir(),'smallest-agent-18-check-'));
let child;
try{
 cpSync(resolve('.output'),join(directory,'.output'),{recursive:true});
 const reservation=createServer();await new Promise(resolve=>reservation.listen(0,'127.0.0.1',resolve));
 const port=reservation.address().port;await new Promise(resolve=>reservation.close(resolve));
 const env={...process.env,ANTHROPIC_API_KEY:'sk-ant-replace-with-your-key',HOST:'127.0.0.1',NITRO_HOST:'127.0.0.1',PORT:String(port),NITRO_PORT:String(port),TRUST_PROXY:'0'};
 delete env.NODE_PATH;
 child=spawn(process.execPath,['.output/server/index.mjs'],{cwd:directory,env,stdio:['ignore','pipe','pipe']});
 let log='';child.stdout.on('data',data=>{log=(log+data).slice(-4000);});child.stderr.on('data',data=>{log=(log+data).slice(-4000);});
 const base=`http://127.0.0.1:${port}`;let ready=false;
 for(let i=0;i<100;i++){try{const response=await fetch(base+'/api/health');ready=response.ok;}catch{}if(ready)break;if(child.exitCode!==null)throw Error(log);await new Promise(resolve=>setTimeout(resolve,100));}
 assert.ok(ready,'Standalone Nitro did not start');
 assert.equal((await(await fetch(base+'/api/health')).json()).api_key_configured,false);
 const html=await(await fetch(base+'/')).text();assert.match(html,/Nuxt/);assert.match(html,/The Smallest Agent/);
 const asset=html.match(/src="([^"]+\.js[^"]*)"/);assert.ok(asset);assert.equal((await fetch(base+asset[1])).status,200);
 const response=await fetch(base+'/api/agent/stream',{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:'{"prompt":"hello"}'});
 const body=await response.text();assert.match(body,/event: error/);assert.doesNotMatch(body,/event: done/);
 const binary=join(directory,'.output/server/node_modules',`@anthropic-ai/claude-agent-sdk-${process.platform}-${process.arch}`,process.platform==='win32'?'claude.exe':'claude');
 const version=spawnSync(binary,['--version'],{cwd:directory,env,encoding:'utf8',timeout:15000});assert.equal(version.status,0);assert.match(version.stdout,/Claude Code/);
 console.log('Copied .output runs independently from an OS temporary directory: SSR, JavaScript, API/SSE and native CLI --version passed without inference.');
}finally{
 if(child&&child.exitCode===null){child.kill();await new Promise(resolve=>child.once('close',resolve));}
 const target=resolve(directory);
 if(!target.startsWith(resolve(tmpdir())+sep)||!basename(target).startsWith('smallest-agent-18-check-'))throw Error('Refusing cleanup outside the owned temporary directory');
 rmSync(target,{recursive:true,force:true});
}
