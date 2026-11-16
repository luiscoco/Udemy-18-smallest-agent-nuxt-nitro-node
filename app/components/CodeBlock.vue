<script setup>
import { computed, ref } from 'vue';
import { highlightCode } from '../lib/code';
const props = defineProps({ code: { type: String, required: true }, language: { type: String, default: 'javascript' }, source: { type: String, default: 'SELECTED EXCERPT' } });
const markup = computed(() => highlightCode(props.code, props.language));
const label = ref('Copy code');
async function copy() {
  try { await navigator.clipboard.writeText(props.code); label.value = 'Copied'; }
  catch { label.value = 'Select code to copy'; }
}
</script>
<template><div class="code-component"><div class="code-heading"><span>{{ language.toUpperCase() }} · {{ source }}</span><button type="button" @click="copy">{{ label }}</button></div><pre tabindex="0"><code class="hljs" v-html="markup"></code></pre></div></template>
