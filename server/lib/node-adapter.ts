import type {H3Event} from 'h3';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {getHandlers} from './runtime';
import type {IncomingMessage} from 'node:http';

function readBounded(req:IncomingMessage):Promise<Buffer|null>{
 return new Promise((resolve,reject)=>{
  const chunks:Buffer[]=[];let size=0;
  const cleanup=()=>{req.off('data',data);req.off('end',end);req.off('error',error);req.off('aborted',aborted);};
  const error=(failure:Error)=>{cleanup();reject(failure);};
  const aborted=()=>error(new Error('Request aborted'));
  const end=()=>{cleanup();resolve(Buffer.concat(chunks));};
  const data=(chunk:Buffer|string)=>{const bytes=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);size+=bytes.length;
   if(size>32768){cleanup();req.resume();resolve(null);}else chunks.push(bytes);
  };
  req.on('data',data);req.once('end',end);req.once('error',error);req.once('aborted',aborted);
 });
}

export async function handleAgent(event:H3Event,mode:'query'|'stream'){
 const {req,res}=event.node;
 const controller=new AbortController();
 const abort=()=>{if(!res.writableEnded)controller.abort();};
 req.once('aborted',abort);res.once('close',abort);
 try{
  const body=await readBounded(req);
  if(body===null){res.writeHead(413,{'Content-Type':'application/json',Connection:'close'});res.end(JSON.stringify({detail:'Request body is too large.'}));return;}
  const protocol=process.env.TRUST_PROXY==='1'&&req.headers['x-forwarded-proto']==='https'?'https':'http';
  const headers=new Headers();for(const [name,value]of Object.entries(req.headers))if(value!==undefined)headers.set(name,Array.isArray(value)?value.join(','):value);
  const request=new Request(`${protocol}://${req.headers.host||'localhost'}${req.url||'/'}`,{method:'POST',headers,body:body.toString('utf8'),signal:controller.signal});
  const response=await getHandlers()[mode](request);
  res.writeHead(response.status,Object.fromEntries(response.headers));res.flushHeaders();
  if(response.body)await pipeline(Readable.fromWeb(response.body as never),res);else res.end();
 }catch{
  controller.abort();
  if(!res.headersSent){res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({detail:'The server could not process this request. Check its configuration.'}));}
  else if(!res.writableEnded)res.end();
 }finally{req.off('aborted',abort);res.off('close',abort);}
}
