<script setup>
import {onMounted,onUnmounted,provide,ref} from 'vue';
import {api,CLIENT} from '../lib/client.js';
import Lab from './Lab.vue';
import Lesson from './Lesson.vue';
const props=defineProps({client:{type:Object,default:()=>api}});
provide(CLIENT,props.client);
const sections=[['lab','Application lab'],['learn','What you will learn'],['setup','How to run'],['architecture','Architecture & workflow'],['walkthrough','Code walkthrough']];
const selected=ref('lab'),health=ref(null),checked=ref(false),dark=ref(false);
const controller=new AbortController();
function onHash(){const id=location.hash.slice(1);if(sections.some(([name])=>name===id))selected.value=id;}
function applyTheme(){document.documentElement.classList.toggle('dark',dark.value);}
function toggleTheme(){dark.value=!dark.value;applyTheme();try{localStorage.setItem('agent18-theme',dark.value?'dark':'light');}catch{}}
function focusLesson(){document.getElementById('lesson-content')?.focus();}
onMounted(async()=>{
 onHash();window.addEventListener('hashchange',onHash);
 try{dark.value=localStorage.getItem('agent18-theme')==='dark';}catch{}applyTheme();
 try{health.value=await props.client.health(controller.signal);}catch{health.value=null;}finally{checked.value=true;}
});
onUnmounted(()=>{controller.abort();window.removeEventListener('hashchange',onHash);});
</script>
<template>
 <a class="skip-link" href="#lesson-content" @click.prevent="focusLesson">Skip to lesson content</a>
 <header class="topbar"><a class="brand" href="#lab"><span class="brand-icon">a<span>·</span></span><span>The Smallest Agent<small>CLAUDE AGENT SDK · NUXT + NITRO + NODE.JS</small></span></a><div class="header-actions"><span class="health"><i :class="{online:health}"></i>{{health?'Backend connected':checked?'Backend offline':'Checking backend…'}}</span><span v-if="health && !health.api_key_configured" class="warning">API key not configured</span><a href="/docs" target="_blank" rel="noopener noreferrer">API docs ↗</a><button :aria-label="dark?'Switch to light mode':'Switch to dark mode'" @click="toggleTheme">{{dark?'☀ Light':'☾ Dark'}}</button></div></header>
 <main><div class="course-hero"><div><span class="eyebrow">LEARN IT. BUILD IT. WATCH IT WORK.</span><h1>Your first agent.<br><em>A real web application.</em></h1><p class="hero-lead">Explore the smallest Claude application in your browser. Ask a question, follow the messages, and understand every layer of a Nuxt + Nitro + Node.js application.</p><div class="hero-tags"><span>Nuxt + Vue</span><span>Nitro + Node.js</span><span>Claude Agent SDK</span></div></div><figure class="mascot"><img src="/astronaut.png" width="380" height="483" alt="Waving course astronaut"><figcaption>A small step into agent development.</figcaption></figure></div>
 <nav class="lesson-nav" aria-label="Application sections"><a v-for="[id,label] in sections" :key="id" :href="`#${id}`" :aria-current="selected===id?'page':undefined">{{label}}</a></nav>
 <div id="lesson-content" tabindex="-1"><Lab v-show="selected==='lab'"/><Lesson v-if="selected!=='lab'" :section="selected"/></div>
 <footer><div><strong>The Smallest Agent · Nuxt + Nitro + Node.js Edition</strong><p>A small agent at the core. A real application around it.</p></div><a href="https://github.com/luiscoco/Udemy-Claude-Agent-SDK-lesson01-app" target="_blank" rel="noopener noreferrer">Course design reference ↗</a></footer></main>
</template>
