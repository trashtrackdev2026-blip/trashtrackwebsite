import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {PhoneDemo} from '../dist/phone-demo.js';
import {startFeatureShow} from '../dist/feature-show.js';
const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
function setup({initialize=true}={}){
  const {document,window}=parseHTML(html);
  // LinkeDOM validates behavior and DOM state; it does not emulate visual layout.
  window.HTMLElement.prototype.getBoundingClientRect=function(){return {top:0,bottom:20,left:0,width:100,height:20};};
  window.HTMLElement.prototype.scrollTo=function({top}){this.scrollTop=top;};
  window.HTMLElement.prototype.focus=function(){};
  window.HTMLElement.prototype.animate=function(){return {cancel(){},finished:Promise.resolve()};};
  const root=document.querySelector('#live-demo');let phone;let interactions=0;
  if(initialize)phone=new PhoneDemo(root,{canAnimate:()=>false,onInteract:()=>interactions++,onNavigate:key=>phone.setFeature(key,{preserve:true})});
  const click=selector=>root.querySelector(selector).dispatchEvent(new window.Event('click',{bubbles:true}));
  const input=(selector,value)=>{const element=root.querySelector(selector);element.value=value;element.dispatchEvent(new window.Event('input',{bubbles:true}));};
  return {document,window,root,phone,click,input,interactions:()=>interactions};
}
test('exploring tabs retains the actual report draft and event registration',()=>{
  const {root,phone,click,input}=setup();
  click('.demo-bottom-nav [data-demo-goto="reports"]');click('[data-demo-action="missed"]');input('#demo-report-text','Example bags beside the street.');
  click('[data-demo-action="attachment"]');click('[data-demo-action="location"]');
  click('.demo-bottom-nav [data-demo-goto="events"]');click('[data-demo-action="join"]');
  click('.demo-bottom-nav [data-demo-goto="collections"]');click('.demo-bottom-nav [data-demo-goto="reports"]');
  assert.equal(root.querySelector('#demo-report-text').value,'Example bags beside the street.');
  assert.equal(root.querySelector('[data-demo-action="missed"]').getAttribute('aria-pressed'),'true');assert.equal(phone.attachment,true);assert.equal(phone.location,true);
  click('[data-demo-action="review"]');assert.equal(root.querySelector('#demo-review-description').textContent,'Example bags beside the street.');
  click('.demo-bottom-nav [data-demo-goto="events"]');click('[data-demo-action="participation"]');
  assert.equal(root.querySelector('.demo-event-card').hidden,false);assert.equal(root.querySelector('[data-demo-action="join"]').disabled,true);phone.destroy();
});
test('typed chat questions produce topic-specific local replies and render input as plain text',()=>{
  const {root,phone,click,input,window}=setup();click('.demo-bottom-nav [data-demo-goto="assist"]');
  input('#demo-chat-input','What about banana peels?');root.querySelector('#demo-chat-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(root.querySelector('.demo-chat-user').textContent,'What about banana peels?');assert.match(root.querySelector('#demo-chat-answer-text').textContent,/peels/);
  input('#demo-chat-input','<img src=x onerror=alert(1)>');root.querySelector('#demo-chat-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(root.querySelector('.demo-chat-user').children.length,0);assert.match(root.querySelector('#demo-chat-answer-text').textContent,/sample replies/);phone.destroy();
});
test('report review validates text, preserves chosen category, and opens an illustrative timeline',()=>{
  const {root,phone,click,input}=setup();click('.demo-bottom-nav [data-demo-goto="reports"]');click('[data-demo-action="review"]');
  assert.equal(root.querySelector('#demo-report-hint').hidden,false);assert.equal(root.querySelector('.demo-review-sheet').hidden,true);
  click('[data-demo-action="dumping"]');input('#demo-report-text','Example waste beside the road.');click('[data-demo-action="review"]');
  assert.equal(root.querySelector('.demo-review-kind').textContent,'Illegal Dumping');click('[data-demo-action="finish"]');click('[data-demo-action="timeline"]');
  assert.equal(root.querySelector('.demo-timeline-sheet').hidden,false);click('[data-demo-action="close-timeline"]');click('[data-demo-action="new-report"]');
  assert.equal(root.querySelector('.demo-report-complete').hidden,true);assert.equal(root.querySelector('#demo-report-text').value,'');phone.destroy();
});
test('tour reset clears interactive records and the scan continues to a readable chat',()=>{
  const {root,phone,click,input}=setup();click('.demo-bottom-nav [data-demo-goto="reports"]');input('#demo-report-text','A manual draft');click('.demo-bottom-nav [data-demo-goto="events"]');click('[data-demo-action="join"]');
  phone.setFeature('assist');phone.render(4000);assert.equal(root.querySelector('.demo-scan-result').hidden,false);phone.render(7100);
  assert.equal(root.querySelector('.demo-chat-conversation').hidden,false);assert.match(root.querySelector('#demo-chat-answer-text').textContent,/Empty the bottle/);
  assert.equal(root.querySelector('#demo-report-text').value,'');assert.equal(phone.joined,false);phone.destroy();
});
test('explore mode retains drafts through the full feature controller, and tour restarts cleanly',()=>{
  const {document,window}=setup({initialize:false});
  globalThis.document=document;globalThis.requestAnimationFrame=()=>1;globalThis.cancelAnimationFrame=()=>{};
  globalThis.IntersectionObserver=class{observe(){}disconnect(){}};
  const show=startFeatureShow({paused:true,enableMotion(){show.setMotion(false);}});
  const click=selector=>document.querySelector(selector).dispatchEvent(new window.Event('click',{bubbles:true}));
  click('#show-explore');assert.equal(document.querySelector('[data-feature-film]').dataset.mode,'explore');
  click('.demo-bottom-nav [data-demo-goto="reports"]');document.querySelector('#demo-report-text').value='Saved while exploring';
  click('.demo-bottom-nav [data-demo-goto="collections"]');click('.demo-bottom-nav [data-demo-goto="reports"]');assert.equal(document.querySelector('#demo-report-text').value,'Saved while exploring');
  click('#show-tour');assert.equal(document.querySelector('[data-feature-film]').dataset.mode,'tour');assert.equal(document.querySelector('#demo-report-text').value,'');show.destroy();
});
