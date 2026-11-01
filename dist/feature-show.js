import { FEATURE_ORDER, ShowClock } from './show-clock.js';
import { PhoneDemo } from './phone-demo.js';

const FEATURES = {
  collections:{title:'Know what’s next.',accent:'Before collection day.',kicker:'A LITTLE LESS GUESSWORK',summary:'Your barangay’s posted dates and notes, with a little guidance to prepare ahead.',description:'Watch the demo open a schedule and explore collection notes.',icon:'calendar',secondary:'leaf'},
  assist:{title:'A little unsure?',accent:'Let’s figure it out.',kicker:'A BETTER DIRECTION FOR EVERY ITEM',summary:'Scan an example item, see its guidance, and ask how to prepare it.',description:'Watch a sample scan turn into practical waste guidance.',icon:'scan',secondary:'recycle'},
  reports:{title:'See something?',accent:'Start a little change.',kicker:'SMALL OBSERVATIONS. SHARED CARE.',summary:'A photo, a place, a few helpful details. See how a concern comes together.',description:'Watch the example fill out a concern and preview its details.',icon:'report',secondary:'pin'},
  events:{title:'Good happens',accent:'when we take part.',kicker:'OUR HOME. OUR SHARED EVERYDAY.',summary:'Find community activities, explore the details, and take part with your neighbours.',description:'Watch the example explore an event and preview joining it.',icon:'people',secondary:'calendar'},
};

export function startFeatureShow({ paused=false, enableMotion }) {
  const film=document.querySelector('[data-feature-film]');
  const $=selector=>film.querySelector(selector);
  const tabs=[...film.querySelectorAll('.feature-tab')];
  const clock=new ShowClock();
  const reasons=new Set();
  let motionPaused=paused, visible=false, raf=0, transition=0, destroyed=false;
  let animations=[];
  if(paused)reasons.add('motion');
  const phone=new PhoneDemo($('#live-demo'),{
    canAnimate:()=>!motionPaused,
    onInteract:()=>pause('manual'),
    onNavigate:key=>select(key,{manual:true}),
  });
  document.documentElement.classList.remove('feature-film-ready');
  film.classList.add('automatic-show');
  for(const name of ['enter','accent','open','out'])film.style.setProperty(`--film-${name}`,'1');

  function running(){return visible&&!document.hidden&&reasons.size===0&&!destroyed;}
  function updateControls(){
    const stopped=reasons.size>0;
    $('#show-toggle').setAttribute('aria-pressed',String(stopped));
    $('#show-toggle-label').textContent=stopped?'Play demo':'Pause demo';
    $('#show-toggle use').setAttribute('href',stopped?'#i-play':'#i-pause');
    $('#show-status').textContent=motionPaused?'Motion paused':stopped?'Paused · try the phone':'Playing automatically';
    film.dataset.playing=String(!stopped);
  }
  function pause(reason){reasons.add(reason);clock.suspend();phone.hidePointer();cancelAnimationFrame(raf);raf=0;updateControls();}
  function resume(){
    if(motionPaused)enableMotion();
    reasons.delete('manual');reasons.delete('keyboard');reasons.delete('focus');
    clock.select(clock.index);render(clock.index);updateControls();schedule();
  }
  function render(index){
    const key=FEATURE_ORDER[index],data=FEATURES[key];
    film.dataset.scene=key;
    tabs.forEach(tab=>{const active=tab.dataset.feature===key;tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
    $('#feature-panel').setAttribute('aria-labelledby',`tab-${key}`);
    $('#film-counter').textContent=String(index+1).padStart(2,'0');
    $('#film-kicker').textContent=data.kicker;$('#film-title-line').textContent=data.title;$('#film-title-accent').textContent=data.accent;
    $('#film-summary').textContent=data.summary;$('#feature-description').textContent=data.description;
    $('#feature-number').textContent=`0${index+1} / 04`;
    $('#film-token-primary').setAttribute('href',`#i-${data.icon}`);$('#film-token-secondary').setAttribute('href',`#i-${data.secondary}`);
    $('#demo-feature-name').textContent=tabs[index].querySelector('strong').textContent;
    phone.setFeature(key);phone.render(0);film.style.setProperty('--show-scene-progress','0');
  }
  function animateTo(index,{instant=false}={}){
    const generation=++transition;
    animations.forEach(animation=>animation.cancel());animations=[];
    const targets=[$('.film-copy'),$('.demo-device-stage')];
    if(instant||motionPaused||!visible){render(index);return;}
    animations=targets.map(target=>target.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-9px)'}],{duration:220,easing:'ease-in',fill:'forwards'}));
    Promise.all(animations.map(animation=>animation.finished)).then(()=>{
      if(generation!==transition||destroyed)return;
      animations.forEach(animation=>animation.cancel());render(index);
      animations=targets.map(target=>target.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:460,easing:'cubic-bezier(.22,1,.36,1)'}));
    }).catch(()=>{});
  }
  function frame(now){
    raf=0;if(!running()){clock.suspend();return;}
    const changed=clock.tick(now,true);
    if(changed)animateTo(clock.index);
    if(film.dataset.scene===FEATURE_ORDER[clock.index])phone.render(clock.elapsed);
    film.style.setProperty('--show-scene-progress',String(clock.progress));
    film.style.setProperty('--show-total-progress',String((clock.index+clock.progress)/FEATURE_ORDER.length));
    raf=requestAnimationFrame(frame);
  }
  function schedule(){if(running()&&!raf){clock.suspend();raf=requestAnimationFrame(frame);}}
  function select(key,{manual=false,scroll=false,keyboard=false}={}){
    const index=FEATURE_ORDER.indexOf(key);if(index<0)return;
    if(manual)pause('manual');else{reasons.delete('manual');reasons.delete('keyboard');}
    if(keyboard)pause('keyboard');
    clock.select(index);animateTo(index,{instant:manual||keyboard});updateControls();
    if(scroll)film.scrollIntoView({behavior:motionPaused?'instant':'smooth',block:'start'});
    schedule();
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>select(tab.dataset.feature));
    tab.addEventListener('keydown',event=>{
      let next;if(['ArrowRight','ArrowDown'].includes(event.key))next=(index+1)%tabs.length;
      if(['ArrowLeft','ArrowUp'].includes(event.key))next=(index-1+tabs.length)%tabs.length;
      if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;
      if(next!==undefined){event.preventDefault();tabs[next].focus();select(tabs[next].dataset.feature,{keyboard:true});}
    });
  });
  $('#show-toggle').addEventListener('click',()=>reasons.size?resume():pause('manual'));
  $('#show-replay').addEventListener('click',resume);
  $('#live-demo').addEventListener('focusin',()=>pause('focus'));
  $('#live-demo').addEventListener('focusout',event=>{if(!$('#live-demo').contains(event.relatedTarget)){reasons.delete('focus');updateControls();schedule();}});
  const observer=new IntersectionObserver(entries=>{
    visible=entries[0].intersectionRatio>=.35;
    if(!visible){clock.suspend();cancelAnimationFrame(raf);raf=0;}else schedule();
  },{threshold:[0,.15,.35,.6,1]});
  observer.observe($('.demo-device-stage'));
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clock.suspend();cancelAnimationFrame(raf);raf=0;}else schedule();});
  render(0);updateControls();
  return{
    select,
    setMotion(value){motionPaused=value;if(value)pause('motion');else{reasons.delete('motion');updateControls();schedule();}},
    setArrival(value){if(value)pause('arrival');else{reasons.delete('arrival');updateControls();schedule();}},
    destroy(){destroyed=true;observer.disconnect();cancelAnimationFrame(raf);animations.forEach(animation=>animation.cancel());phone.destroy();},
  };
}
