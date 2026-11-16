<script setup>
import { computed, inject, onUnmounted, ref } from 'vue';
import { CLIENT, isAgentResult } from '../lib/client.js';
import { renderMarkdown } from '../lib/code';
import CodeBlock from './CodeBlock.vue';
const client = inject(CLIENT);
const examples = ['Hello world!', 'Explain what an AI agent is in one sentence.', 'What is Nuxt?'];
const prompt = ref('Hello world!'), mode = ref('stream'), state = ref('idle');
const partial = ref('');
const result = ref(null), messages = ref([]), error = ref(''), notice = ref(''), elapsed = ref(0);
const running = computed(() => state.value === 'running');
const trimmed = computed(() => prompt.value.trim());
const answer = computed(() => renderMarkdown(result.value?.result || partial.value));
let controller, timer;
async function run() {
  if (running.value || !trimmed.value || trimmed.value.length > 4000) return;
  state.value = 'running'; error.value = ''; notice.value = ''; result.value = null; partial.value = ''; messages.value = []; elapsed.value = 0;
  controller = new AbortController();
  const started = performance.now();
  timer = setInterval(() => { elapsed.value = (performance.now() - started) / 1000; }, 100);
  try {
    if (mode.value === 'simple') result.value = await client.query(trimmed.value, controller.signal);
    else await client.stream(trimmed.value, message => {
      if (message.type === 'AssistantMessage' && typeof message.data.text === 'string') partial.value = message.data.text;
      if (messages.value.length < 500) messages.value.push({ ...message, elapsed: (performance.now() - started) / 1000 });
      if (message.type === 'ResultMessage' && isAgentResult(message.data)) result.value = message.data;
    }, controller.signal);
    if (!isAgentResult(result.value)) throw new Error('The agent returned no final result. Please try again.');
    if (result.value.is_error) throw new Error('The agent stopped with an error. Check its result and try again.');
    state.value = 'success';
  } catch (failure) {
    if (failure.name === 'AbortError') return;
    state.value = 'error'; error.value = failure.message || 'The agent could not finish.'; notice.value = error.value;
  } finally { clearInterval(timer); elapsed.value = (performance.now() - started) / 1000; }
}
async function copyAnswer() {
  try { await navigator.clipboard.writeText(result.value.result); notice.value = 'Answer copied.'; }
  catch { notice.value = 'Clipboard unavailable. Select the answer to copy it.'; }
}
function cancel() { controller?.abort(); state.value='idle'; notice.value='Request cancelled.'; }
function downloadAnswer() {
  const url = URL.createObjectURL(new Blob([result.value.result], { type: 'text/markdown;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'claude-answer.md'; link.click(); URL.revokeObjectURL(url);
}
onUnmounted(() => { controller?.abort(); clearInterval(timer); });
</script>
<template>
  <section aria-labelledby="lab-title">
    <div class="section-intro lab-intro"><div><span class="eyebrow">YOUR FIRST CLAUDE REQUEST</span><h2 id="lab-title">Start small. See everything.</h2><p>Send a question and follow the SDK messages as they arrive.</p></div><a href="#architecture">Explore the architecture →</a></div>
    <div class="lesson-flow"><div><span>01</span><strong>Write a prompt</strong><p>Tell the agent what you need.</p></div><div><span>02</span><strong>Watch the stream</strong><p>Follow every safe SDK message.</p></div><div><span>03</span><strong>Read the answer</strong><p>Inspect the result and metrics.</p></div></div>
    <div class="workspace"><div class="left-column">
      <section class="panel"><div class="panel-heading"><div><span class="eyebrow">01 / INPUT</span><h2>Your prompt</h2></div><span class="count">{{ trimmed.length }} / 4000</span></div><label class="field-label" for="prompt">What would you like Claude to do?</label><textarea id="prompt" v-model="prompt" class="prompt-input" rows="5" maxlength="4000" :disabled="running" aria-describedby="prompt-help" @keydown.ctrl.enter.prevent="run"></textarea><p id="prompt-help" class="panel-description">One prompt, one agent loop. Start with Hello world!</p><div class="examples"><span>TRY AN EXAMPLE</span><button v-for="example in examples" :key="example" class="example" :disabled="running" @click="prompt = example">{{ example }}</button></div><div class="run-toolbar"><div class="mode-toggle" role="group" aria-label="Response mode"><button :aria-pressed="mode === 'stream'" :disabled="running" @click="mode = 'stream'">Stream</button><button :aria-pressed="mode === 'simple'" :disabled="running" @click="mode = 'simple'">Simple</button></div><button class="primary" :disabled="running || !trimmed || trimmed.length > 4000" @click="run">{{ running ? 'Running…' : 'Run agent ↗' }}</button><button v-if="running" @click="cancel">Cancel</button></div><div class="run-footnote"><span>{{ mode === 'stream' ? 'Watch SDK messages as they arrive' : 'Receive the completed result' }}</span><kbd>Ctrl + Enter</kbd></div></section>
      <section class="panel answer-panel" aria-live="polite"><div class="panel-heading"><div><span class="eyebrow">02 / OUTPUT</span><h2>Agent’s answer</h2></div><span class="state" :data-state="state">{{ state }}</span></div><p v-if="error" class="error-message" role="alert">{{ error }}</p><div v-if="running" class="loading"><span class="spinner" aria-hidden="true"></span><span>Claude is working…<strong>Elapsed {{ elapsed.toFixed(1) }} s</strong></span></div>
        <div v-if="result || partial" class="markdown" v-html="answer"></div><template v-if="result"><div class="answer-actions"><button @click="copyAnswer">Copy answer</button><button @click="downloadAnswer">Download .md</button></div><div class="stats"><span><strong>{{ result.num_turns }}</strong>Agent turns</span><span><strong>{{ result.duration_ms }} ms</strong>SDK duration</span><span><strong>{{ result.total_cost_usd === null ? 'Not reported' : '$' + result.total_cost_usd.toFixed(6) }}</strong>Reported cost (USD)</span></div></template>
        <div v-else-if="!running && !error" class="answer-empty"><span>✦</span><p>Your first answer will appear here.</p><small>Write a prompt and select Run agent.</small></div>
      </section>
    </div><section class="panel inspector stream-inspector"><div class="panel-heading"><div><span class="eyebrow">03 / INSPECT</span><h2>Inside the agent</h2></div><span class="count">{{ messages.length }} messages</span></div><p class="panel-description">{{ mode === 'stream' ? 'A live timeline of safe SDK messages. Expand any row to inspect its JSON.' : 'Simple mode returns one final result. Choose Stream to see intermediate messages.' }}</p><div class="timeline" role="log" aria-label="SDK message timeline"><div v-if="!messages.length" class="empty-stream"><span class="empty-symbol">⌁</span><h3>The journey starts with your prompt.</h3><p>Initialization, assistant content and the final ResultMessage appear here.</p><div class="sample-flow">query() <span>→</span> for await <span>→</span> result</div></div><article v-for="(message, index) in messages" :key="index" class="timeline-row"><span class="timeline-dot"></span><div class="event-body"><div class="event-heading"><span class="badge" :data-type="message.type">{{ message.type }}</span><time>+{{ message.elapsed.toFixed(2) }}s</time></div><p>{{ message.summary }}</p><details><summary>View JSON</summary><CodeBlock :code="JSON.stringify(message.data, null, 2)" language="json" /></details></div></article></div></section></div>
    <aside class="lesson-note"><strong>The same agent, with Nuxt and Nitro around it.</strong><p>Your prompt travels through Nuxt → Nitro → TypeScript Claude Agent SDK → Claude. The query() → for await → result loop stays recognizable.</p><p>Your API key stays on the server. Sending a real prompt may use API credits.</p><a href="#architecture">Explore the architecture →</a></aside>
    <div v-if="notice" class="snackbar" role="status">{{ notice }} <button aria-label="Dismiss notification" @click="notice = ''">Dismiss</button></div>
  </section>
</template>
