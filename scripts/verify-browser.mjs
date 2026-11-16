import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const base=process.env.VERIFY_BASE_URL||'http://127.0.0.1:5900';
const health=await(await fetch(base+'/api/health')).json();
assert.equal(health.api_key_configured,false,'Browser QA requires a placeholder key to avoid inference.');
mkdirSync('verification',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.getByText('API key not configured',{exact:true}).waitFor();
 await page.locator('#prompt').fill('Remember my Nitro prompt');
 for(const [id,heading] of [['learn','Small enough to understand. Real enough to explore.'],['setup','One Nuxt server. One application.'],['architecture','See how the pieces connect.'],['walkthrough','One request. Every layer explained.'],['lab','Start small. See everything.']]){
  await page.locator(`.lesson-nav a[href="#${id}"]`).click();
  await page.getByRole('heading',{name:heading,exact:true}).waitFor();
 }
 assert.equal(await page.locator('#prompt').inputValue(),'Remember my Nitro prompt');
 await page.getByRole('button',{name:/Run agent/}).click();
 await page.locator('.error-message[role="alert"]').waitFor();
 assert.match(await page.locator('.error-message[role="alert"]').innerText(),/ANTHROPIC_API_KEY/);
 await page.getByRole('button',{name:'Dismiss notification',exact:true}).click();
 await page.locator('.lesson-nav a[href="#architecture"]').click();
 await page.locator('.workflow-code-step').last().waitFor();
 assert.equal(await page.locator('.workflow-code-step').count(),16);
 assert.ok(await page.locator('.workflow-code-step .hljs-keyword').count()>10);
 await page.waitForFunction(()=>{const img=document.querySelector('.uml-viewport img');return img?.complete&&img.naturalWidth===1680;});
 assert.ok(await page.locator('.uml-viewport').evaluate(el=>el.scrollWidth>el.clientWidth));
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.locator('.uml-card').scrollIntoViewIfNeeded();
 await page.screenshot({path:'verification/architecture.png',fullPage:false});
 await page.getByRole('button',{name:'Switch to dark mode'}).click();
 await page.reload();assert.equal(await page.evaluate(()=>localStorage.getItem('agent18-theme')),'dark');
 await page.getByRole('button',{name:'Switch to light mode'}).waitFor();
 await page.setViewportSize({width:390,height:844});
 for(const id of ['lab','learn','setup','walkthrough','architecture']){
  await page.locator(`.lesson-nav a[href="#${id}"]`).click();
  await page.waitForFunction(selected=>document.querySelector('.lesson-nav [aria-current="page"]')?.getAttribute('href')===`#${selected}`,id);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Mobile page overflow in ${id}`);
 }
 await page.screenshot({path:'verification/mobile.png',fullPage:false});
 assert.deepEqual(errors,[]);
 console.log('Chrome passed all tabs, retained prompt, missing-key SSE, 16 colored steps, UML, theme persistence and mobile overflow checks.');
}finally{await browser.close();}
