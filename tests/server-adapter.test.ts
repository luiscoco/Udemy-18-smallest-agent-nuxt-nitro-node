import {afterEach,describe,it,expect,vi} from 'vitest';
import {createServer,type Server} from 'node:http';
import type {AddressInfo} from 'node:net';
import type {H3Event} from 'h3';

vi.mock('../server/lib/runtime',()=>({getHandlers:()=>({
 query:async(request:Request)=>Response.json({prompt:(await request.json()).prompt}),
 stream:async(request:Request)=>new Response(new ReadableStream({start(controller){
  controller.enqueue(new TextEncoder().encode('event: message\ndata: {"text":"héllo"}\n\n'));
  if((new URL(request.url)).searchParams.has('slow'))request.signal.addEventListener('abort',()=>{cancelled=true;try{controller.close();}catch{}},{once:true});
  else{controller.enqueue(new TextEncoder().encode('event: done\ndata: {}\n\n'));controller.close();}
 }}),{headers:{'Content-Type':'text/event-stream'}}),
})}));
import {handleAgent} from '../server/lib/node-adapter';
let server:Server|undefined;let cancelled=false;
async function start(mode:'query'|'stream'){
 server=createServer((req,res)=>{void handleAgent({node:{req,res}} as H3Event,mode);});
 await new Promise<void>(resolve=>server!.listen(0,'127.0.0.1',resolve));
 return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}
afterEach(async()=>{server?.closeAllConnections();await new Promise<void>(resolve=>server?.close(()=>resolve()));server=undefined;cancelled=false;});
describe('Nitro Node HTTP adapter',()=>{
 it('pipes real UTF-8 SSE and completion through a Node socket',async()=>{
  const base=await start('stream');const response=await fetch(base,{method:'POST',headers:{'Content-Type':'application/json'},body:'{"prompt":"hello"}'});
  expect(response.headers.get('content-type')).toBe('text/event-stream');const text=await response.text();expect(text).toContain('héllo');expect(text).toContain('event: done');
 });
 it('returns a bounded real HTTP response for an oversized body',async()=>{
  const base=await start('query');const response=await fetch(base,{method:'POST',body:'x'.repeat(40000)});expect(response.status).toBe(413);expect(await response.text()).toContain('too large');
 });
 it('does not abort inference when the input body finishes',async()=>{
  const base=await start('query');const response=await fetch(base,{method:'POST',body:'{"prompt":"hello"}'});expect(await response.json()).toEqual({prompt:'hello'});
 });
 it('keeps later HTTP requests valid after rejecting oversized inputs',async()=>{
  const base=await start('query');
  for(let i=0;i<4;i++){
   const large=await fetch(base,{method:'POST',body:'x'.repeat(40000)});expect(large.status).toBe(413);await large.text();
   const valid=await fetch(base,{method:'POST',body:'{"prompt":"hello"}'});expect(valid.status).toBe(200);expect(await valid.json()).toEqual({prompt:'hello'});
  }
 });
 it('aborts owned execution when the browser cancels a live stream',async()=>{
  const base=await start('stream');const abort=new AbortController();const response=await fetch(base+'/?slow=1',{method:'POST',body:'{}',signal:abort.signal});
  const reader=response.body!.getReader();await reader.read();abort.abort();await reader.cancel().catch(()=>{});
  await vi.waitFor(()=>expect(cancelled).toBe(true));
 });
});
