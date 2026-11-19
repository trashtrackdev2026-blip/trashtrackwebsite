import { FEATURE_ORDER, ShowClock } from './show-clock.js';
import { PhoneDemo } from './phone-demo.js';

const FEATURES = {
  collections:{title:'Know when the',accent:'truck is coming.',summary:'Find your barangay’s collection dates and see what waste will be picked up.'},
  assist:{title:'Find the right bin',accent:'for everyday items.',summary:'Scan an item or ask TrashTrack Assist how to sort it.'},
  reports:{title:'Report what you see.',accent:'Follow what happens.',summary:'Share a photo and location so your barangay can review the concern.'},
  events:{title:'Find events',accent:'close to home.',summary:'Explore local cleanups, workshops, and other activities in Balete.'},
};

export function startFeatureShow({ paused=false }) {
  const film=document.querySelector('[data-feature-film]');
  const $=selector=>film.querySelector(selector);
  const tabs=[...film.querySelectorAll('.feature-tab')];
  const clock=new ShowClock();
  const reasons=new Set();
  let motionPaused=paused, visible=false, raf=0, transition=0, destroyed=false, exploring=false;
  let animations=[];
  if(paused)reasons.add('motion');
  const phone=new PhoneDemo($('#live-demo'),{
    canAnimate:()=>!motionPaused,
    onInteract:()=>explore(),
    onNavigate:key=>{
      if(key==='you'){
        explore();phone.setFeature('you',{preserve:true});$('#demo-feature-name').textContent='Your little corner';
      }else select(key,{manual:true});
    },
  });
  document.documentElement.classList.remove('feature-film-ready');
  film.classList.add('automatic-show');
  for(const name of ['enter','accent','open','out'])film.style.setProperty(`--film-${name}`,'1');

  function running(){return visible&&!document.hidden&&reasons.size===0&&!destroyed;}
  function updateMode(){
    film.dataset.playing=String(running());
    film.dataset.mode=exploring?'explore':'tour';
    $('#demo-explore-hint').textContent=exploring?'Use the phone tabs to explore the sample screens.':'Tap the phone to try it with sample data.';
  }
  function pause(reason){reasons.add(reason);clock.suspend();phone.hidePointer();cancelAnimationFrame(raf);raf=0;updateMode();}
  function explore(){
    if(!exploring){
      ++transition;animations.forEach(animation=>animation.cancel());animations=[];
      const displayed=FEATURE_ORDER.indexOf(film.dataset.scene);if(displayed>=0)clock.select(displayed);
    }
    exploring=true;pause('manual');
  }
  function resetAfterExploring(){
    ++transition;animations.forEach(animation=>animation.cancel());animations=[];
    exploring=false;
    reasons.delete('manual');reasons.delete('keyboard');
    clock.select(clock.index);render(clock.index);
  }
  function render(index,{preserve=false}={}){
    const key=FEATURE_ORDER[index],data=FEATURES[key];
    film.dataset.scene=key;
    tabs.forEach(tab=>{const active=tab.dataset.feature===key;tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
    $('#feature-panel').setAttribute('aria-labelledby',`tab-${key}`);
    const label=tabs[index].querySelector('strong').textContent;
    $('#film-kicker').textContent=label;$('#film-title-line').textContent=data.title;$('#film-title-accent').textContent=data.accent;
    $('#film-summary').textContent=data.summary;
    $('#demo-feature-name').textContent=label;
    phone.setFeature(key,{preserve});if(!preserve)phone.render(0);film.style.setProperty('--show-scene-progress','0');
  }
  function animateTo(index,{instant=false,preserve=false}={}){
    const generation=++transition;
    animations.forEach(animation=>animation.cancel());animations=[];
    const targets=[$('.film-copy'),$('.demo-device-stage')];
    if(instant||motionPaused||!visible){render(index,{preserve});return;}
    animations=targets.map(target=>target.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-9px)'}],{duration:220,easing:'ease-in',fill:'forwards'}));
    Promise.all(animations.map(animation=>animation.finished)).then(()=>{
      if(generation!==transition||destroyed)return;
      animations.forEach(animation=>animation.cancel());render(index,{preserve});
      animations=targets.map(target=>target.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:460,easing:'cubic-bezier(.22,1,.36,1)'}));
    }).catch(()=>{});
  }
  function frame(now){
    raf=0;if(!running()){clock.suspend();return;}
    const changed=clock.tick(now,true);
    if(changed)animateTo(clock.index);
    if(film.dataset.scene===FEATURE_ORDER[clock.index])phone.render(clock.elapsed);
    film.style.setProperty('--show-scene-progress',String(clock.progress));
    raf=requestAnimationFrame(frame);
  }
  function schedule(){if(running()&&!raf){clock.suspend();raf=requestAnimationFrame(frame);}}
  function select(key,{manual=false,scroll=false,keyboard=false}={}){
    const index=FEATURE_ORDER.indexOf(key);if(index<0)return;
    if(manual)explore();else{exploring=false;reasons.delete('manual');reasons.delete('keyboard');}
    if(keyboard)pause('keyboard');
    clock.select(index);animateTo(index,{instant:manual||keyboard,preserve:manual});updateMode();
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
  $('#live-demo').addEventListener('focusin',()=>pause('focus'));
  $('#live-demo').addEventListener('focusout',event=>{if(!$('#live-demo').contains(event.relatedTarget)){reasons.delete('focus');updateMode();schedule();}});
  const observer=new IntersectionObserver(entries=>{
    const entry=entries[0];
    visible=entry.intersectionRatio>=.35;
    if(!visible){clock.suspend();cancelAnimationFrame(raf);raf=0;}
    if(!entry.isIntersecting&&!reasons.has('focus')&&(exploring||reasons.has('keyboard')))resetAfterExploring();
    updateMode();
    schedule();
  },{threshold:[0,.15,.35,.6,1]});
  observer.observe($('.demo-device-stage'));
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clock.suspend();cancelAnimationFrame(raf);raf=0;}else schedule();updateMode();});
  render(0);updateMode();
  return{
    select,
    setMotion(value){motionPaused=value;if(value)pause('motion');else{reasons.delete('motion');updateMode();schedule();}},
    setArrival(value){if(value)pause('arrival');else{reasons.delete('arrival');updateMode();schedule();}},
    destroy(){destroyed=true;observer.disconnect();cancelAnimationFrame(raf);animations.forEach(animation=>animation.cancel());phone.destroy();},
  };
}
