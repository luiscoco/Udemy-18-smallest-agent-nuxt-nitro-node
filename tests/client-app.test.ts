import {afterEach,beforeEach,describe,it,expect,vi} from 'vitest';
import {mount,flushPromises} from '@vue/test-utils';
import AppShell from '../app/components/AppShell.vue';
import CodeBlock from '../app/components/CodeBlock.vue';
import {renderMarkdown} from '../app/lib/code';
let wrapper:any;
const result={result:'**Hello!**\n```typescript\nconst answer = 42;\n```\n<script>alert(1)</script>',num_turns:1,duration_ms:12,total_cost_usd:null,is_error:false};
const makeClient=()=>({health:vi.fn(async()=>({status:'ok',api_key_configured:false})),query:vi.fn(async()=>result),stream:vi.fn(async(_prompt:string,onMessage:Function,_signal?:AbortSignal)=>{onMessage({type:'ResultMessage',summary:'Done',data:result});})});
async function open(client=makeClient()){wrapper=mount(AppShell,{props:{client}});await flushPromises();return client;}
async function section(id:string){history.replaceState(null,'',`/#${id}`);window.dispatchEvent(new HashChangeEvent('hashchange'));await flushPromises();}
beforeEach(()=>{localStorage.clear();history.replaceState(null,'','/');});
afterEach(()=>{wrapper?.unmount();wrapper=null;});
describe('Nuxt Vue learning lab',()=>{
 it('navigates all views with sixteen source cards and retained prompt',async()=>{
  await open();await wrapper.get('textarea').setValue('Keep my prompt');
  for(const [id,heading]of [['learn','Small enough to understand.'],['setup','One Nuxt server.'],['architecture','See how the pieces connect.'],['walkthrough','One request. Every layer'],['lab','Start small. See everything.']]){
   await section(id!);expect(wrapper.text()).toContain(heading);
   expect(wrapper.get('.lesson-nav [aria-current="page"]').attributes('href')).toBe(`#${id}`);
   if(id==='architecture'){expect(wrapper.findAll('.workflow-code-step')).toHaveLength(16);for(const card of wrapper.findAll('.workflow-code-step')){expect(card.find('pre .hljs').exists()).toBe(true);expect(card.find('.workflow-code-explanation').exists()).toBe(true);}}
  }expect(wrapper.get('textarea').element.value).toBe('Keep my prompt');
 });
 it('starts with Hello world and reports missing key',async()=>{await open();expect(wrapper.get('textarea').element.value).toBe('Hello world!');expect(wrapper.text()).toContain('API key not configured');});
 it('renders a real result with sanitized highlighted Markdown',async()=>{const client=await open();await wrapper.get('button.primary').trigger('click');await flushPromises();expect(client.stream).toHaveBeenCalledOnce();expect(wrapper.get('.state').text()).toBe('success');expect(wrapper.get('.markdown strong').text()).toBe('Hello!');expect(wrapper.find('.markdown .hljs-keyword').exists()).toBe(true);expect(wrapper.find('.markdown script').exists()).toBe(false);expect(wrapper.findAll('.timeline-row')).toHaveLength(1);});
 it('runs Simple and retains result after lesson navigation',async()=>{const client=await open();await wrapper.findAll('.mode-toggle button')[1].trigger('click');await wrapper.get('button.primary').trigger('click');await flushPromises();expect(client.query).toHaveBeenCalledOnce();await section('architecture');await section('lab');expect(wrapper.get('.markdown strong').text()).toBe('Hello!');});
 it('rejects missing final and SDK error results',async()=>{const client=makeClient();client.stream.mockImplementationOnce(async()=>{});await open(client);await wrapper.get('button.primary').trigger('click');await flushPromises();expect(wrapper.get('.state').text()).toBe('error');expect(wrapper.get('.error-message').text()).toContain('no final result');client.stream.mockImplementationOnce(async(_p,onMessage)=>onMessage({type:'ResultMessage',summary:'Error',data:{...result,is_error:true}}));await wrapper.get('button.primary').trigger('click');await flushPromises();expect(wrapper.get('.state').text()).toBe('error');});
 it('locks duplicate runs and cancels the owned request',async()=>{const client=makeClient();let signal:AbortSignal|undefined;client.stream.mockImplementationOnce(async(_p,_onMessage,incoming)=>{signal=incoming;await new Promise<void>((_resolve,reject)=>incoming!.addEventListener('abort',()=>reject(new DOMException('Cancelled','AbortError')),{once:true}));});await open(client);await wrapper.get('button.primary').trigger('click');await wrapper.get('textarea').trigger('keydown',{ctrlKey:true,key:'Enter'});expect(client.stream).toHaveBeenCalledOnce();await wrapper.findAll('button').find((button:any)=>button.text()==='Cancel').trigger('click');await flushPromises();expect(signal?.aborted).toBe(true);expect(wrapper.get('.state').text()).toBe('idle');});
 it('persists light/dark preference',async()=>{await open();await wrapper.get('button[aria-label="Switch to dark mode"]').trigger('click');expect(localStorage.getItem('agent18-theme')).toBe('dark');expect(document.documentElement.classList.contains('dark')).toBe(true);});
 it('sanitizes active HTML and highlights unknown language as text',()=>{expect(renderMarkdown('<img src=x onerror=alert(1)>')).not.toContain('onerror');wrapper=mount(CodeBlock,{props:{code:'<script>alert(1)</script>',language:'unknown-language'}});expect(wrapper.get('code').text()).toBe('<script>alert(1)</script>');expect(wrapper.find('script').exists()).toBe(false);});
});
