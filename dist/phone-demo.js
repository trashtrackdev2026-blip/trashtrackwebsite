import { demoFrame } from './show-clock.js';

const OUTCOMES = ['all-outcomes','active','completed','unfinished'];
const CONCERNS = {overflow:'Garbage Overflow',dumping:'Illegal Dumping',missed:'Missed Collection',other:'Other'};
const INFO = {
  notifications:['Notifications','You’re all caught up in this example. Collection and community updates appear here in the Android app.'],
  learning:['Learning Materials','Learning materials will appear here when published. The Android app brings your community’s published materials together.'],
  guide:['Waste guide','Keep recyclables clean and dry. Separate biodegradable waste. Follow your barangay’s posted collection and segregation guidance.'],
  'event-qr':['Event attendance','The Android app uses an event QR code for attendance. This website demonstrates the layout with example data.'],
  'profile-info':['Personal Information','Maria Santos · Poblacion, Balete. This is an example profile used to show the Android app’s interface.'],
  settings:['Settings','Your account preferences live in the Android app. Website animation controls are below the phone preview.'],
  help:['Help & Support','Open the Android app for account and community support. This preview lets you explore the main screens.'],
  about:['About TrashTrack','A little care. A greener Balete. Collection schedules, waste guidance, reports, and community events in one app.'],
  logout:['Example account','This preview uses a sample profile. You can continue exploring without signing in.'],
};

export class PhoneDemo {
  constructor(root, { onInteract, onNavigate, canAnimate }) {
    Object.assign(this,{root,onInteract,onNavigate,canAnimate,timers:[]});
    root.addEventListener('click', event => {
      const navigation=event.target.closest('[data-demo-goto]');
      if(navigation){
        this.onInteract();this.hidePointer();
        if(navigation.dataset.demoGoto==='you')this.setFeature('you');
        else this.onNavigate(navigation.dataset.demoGoto);
        if(navigation.hasAttribute('data-open-scan'))this.setAssistMode('scan');
        return;
      }
      const button=event.target.closest('[data-demo-action]');
      if(!button)return;
      this.onInteract();this.hidePointer();this.act(button.dataset.demoAction);
    });
    root.addEventListener('input', event=>{
      this.onInteract();this.hidePointer();this.find('#demo-report-hint').hidden=true;
      if(event.target.id==='demo-report-text')this.updateCount();
      if(event.target.id==='demo-event-search')this.filterEvents(this.eventFilter);
    });
    root.addEventListener('keydown',event=>{if(event.key==='Escape'){this.showSchedule(false);this.find('.demo-info-sheet').hidden=true;}});
    this.setFeature('collections');
  }
  find(selector){return this.root.querySelector(selector);}
  all(selector){return [...this.root.querySelectorAll(selector)];}
  later(fn,delay){const timer=setTimeout(fn,delay);this.timers.push(timer);return timer;}
  clearTimers(){this.timers.forEach(clearTimeout);this.timers=[];}
  setFeature(key){
    this.clearTimers();this.key=key;this.step=-1;this.lastText='';this.joined=false;this.attachment=false;this.location=false;
    this.all('[data-demo-screen]').forEach(screen=>{screen.hidden=screen.dataset.demoScreen!==key;screen.scrollTop=0;});
    this.all('.demo-bottom-nav [data-demo-goto]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.demoGoto===key)));
    this.all('.demo-schedule,.demo-scanning-beam,.demo-scan-result,.demo-scan-question,.demo-chat-conversation,.demo-review-sheet,.demo-report-complete,.demo-event-details,.demo-event-joined,.demo-info-sheet,#demo-report-hint').forEach(element=>element.hidden=true);
    this.find('.demo-chat-welcome').hidden=false;
    this.find('#demo-report-text').value='';this.updateCount();
    this.find('#demo-event-search').value='';
    this.selectConcern('overflow');this.filterSchedule('all-outcomes');this.setAssistMode('chat');this.setScanState(false,false);
    this.setAttachment(false);this.setLocation(false);this.showEventDetails(false);this.showJoined(false);this.filterEvents('upcoming');
    this.showSchedule(false);this.hidePointer();
  }
  showSchedule(show){this.find('.demo-schedule').hidden=!show;this.find('[data-demo-action="schedule"]').setAttribute('aria-expanded',String(show));}
  filterSchedule(outcome){
    OUTCOMES.forEach(value=>{const button=this.find(`[data-demo-action="${value}"]`);button.classList.toggle('active',value===outcome);button.setAttribute('aria-pressed',String(value===outcome));});
    const empty=outcome==='completed'||outcome==='unfinished';
    this.find('.demo-schedule-record').hidden=empty;this.find('.demo-schedule-empty').hidden=!empty;
  }
  selectConcern(kind){
    this.concern=kind;
    Object.keys(CONCERNS).forEach(value=>{const button=this.find(`[data-demo-action="${value}"]`);button.classList.toggle('active',value===kind);button.setAttribute('aria-pressed',String(value===kind));});
    this.find('.demo-review-kind').textContent=CONCERNS[kind];
  }
  updateCount(){this.find('#demo-character-count').textContent=`${this.find('#demo-report-text').value.length}/5000`;}
  setAttachment(value){this.attachment=value;this.find('#demo-attachment-label').textContent=value?'✓ Example photo added (1/5)':'＋ Add photos or videos (0/5)';this.find('.demo-attachment').classList.toggle('has-example',value);}
  setLocation(value){this.location=value;this.find('#demo-location-label').textContent=value?'Poblacion, Balete · Example':'No location selected';this.find('#demo-review-location').textContent=value?'Poblacion, Balete · Example':'No location selected';}
  setAssistMode(mode){
    this.find('.demo-chat-panel').hidden=mode!=='chat';this.find('.demo-scan-panel').hidden=mode!=='scan';
    for(const value of ['chat','scan']){const button=this.find(`[data-demo-action="${value}-tab"]`);button.classList.toggle('active',value===mode);button.setAttribute('aria-pressed',String(value===mode));}
  }
  showAnswer(){this.setAssistMode('chat');this.find('.demo-chat-welcome').hidden=true;this.find('.demo-chat-conversation').hidden=false;this.find('[data-demo-screen="assist"]').scrollTop=0;}
  render(elapsed){
    if(this.key==='you')return;
    const frame=demoFrame(this.key,elapsed);
    if(this.key==='reports'&&frame.text!==this.lastText){this.find('#demo-report-text').value=frame.text;this.lastText=frame.text;this.updateCount();}
    if(this.key==='assist')this.find('.demo-scan-window').style.setProperty('--scan-progress',String(frame.scanProgress));
    if(frame.step===this.step)return;
    this.step=frame.step;
    if(this.key==='collections'){
      this.showSchedule(frame.scheduleOpen);if(frame.filterActive)this.filterSchedule('active');
    }else if(this.key==='assist'){
      if(frame.scanning||frame.result)this.setAssistMode('scan');
      this.setScanState(frame.scanning,frame.result);if(frame.answer)this.showAnswer();
    }else if(this.key==='reports'){
      this.setLocation(frame.location);this.setAttachment(frame.location);
      this.find('.demo-review-sheet').hidden=!frame.review||frame.complete;this.find('.demo-report-complete').hidden=!frame.complete;
      if(frame.review){this.find('#demo-review-description').textContent=this.find('#demo-report-text').value;this.find('[data-demo-screen="reports"]').scrollTop=0;}
    }else{this.showEventDetails(frame.details);this.showJoined(frame.joined);}
    if(frame.pointer)this.pointTo(frame.pointer);else this.hidePointer();
  }
  setScanState(scanning,result){
    this.find('.demo-scanning-beam').hidden=!scanning;
    this.find('.demo-scan-window').classList.toggle('is-scanning',scanning);this.find('.demo-scan-window').classList.toggle('is-complete',result);
    this.find('.demo-scan-result').hidden=!result;this.find('.demo-scan-question').hidden=!result;
    this.find('#demo-scan-button-label').textContent=scanning?'Looking at this example…':result?'Scan example again':'Scan example item';
    this.find('[data-demo-action="scan"]').disabled=scanning;
  }
  showEventDetails(show){
    this.find('.demo-event-details').hidden=!show;
    const button=this.find('[data-demo-action="details"]');button.textContent=show?'Less Detail':'View Details';button.setAttribute('aria-expanded',String(show));
  }
  showJoined(joined){
    this.joined=joined;this.find('.demo-event-joined').hidden=!joined;
    const button=this.find('[data-demo-action="join"]');button.textContent=joined?'Registered ✓':'Register Now';button.disabled=joined;
  }
  filterEvents(filter){
    this.eventFilter=filter;
    for(const value of ['upcoming','participation','archive']){const button=this.find(`[data-demo-action="${value}"]`);button.classList.toggle('active',value===filter);button.setAttribute('aria-pressed',String(value===filter));}
    const search=this.find('#demo-event-search').value.trim().toLowerCase();
    const empty=filter==='archive'||(filter==='participation'&&!this.joined)||!('lakeside clean-up poblacion balete'.includes(search));
    this.find('.demo-event-card').hidden=empty;this.find('.demo-events-empty').hidden=!empty;
  }
  act(action){
    if(action==='schedule')this.showSchedule(true);
    else if(action==='close-schedule')this.showSchedule(false);
    else if(OUTCOMES.includes(action))this.filterSchedule(action);
    else if(action==='chat-tab'||action==='scan-tab'){this.clearTimers();this.setScanState(false,false);this.setAssistMode(action==='chat-tab'?'chat':'scan');}
    else if(action==='scan'){
      this.clearTimers();this.setScanState(true,false);this.find('.demo-scan-window').style.setProperty('--scan-progress','.5');
      this.later(()=>{this.setScanState(false,true);this.scrollWithin(this.find('.demo-scan-result'));},this.canAnimate()?1600:0);
    }else if(action==='ask')this.showAnswer();
    else if(CONCERNS[action])this.selectConcern(action);
    else if(action==='attachment')this.setAttachment(!this.attachment);
    else if(action==='location')this.setLocation(!this.location);
    else if(action==='review'){
      const text=this.find('#demo-report-text').value.trim();
      if(!text){this.find('#demo-report-hint').hidden=false;this.find('#demo-report-text').focus();return;}
      this.find('#demo-review-description').textContent=text;this.find('.demo-review-sheet').hidden=false;this.find('[data-demo-screen="reports"]').scrollTop=0;
    }else if(action==='finish'){this.find('.demo-review-sheet').hidden=true;this.find('.demo-report-complete').hidden=false;}
    else if(action==='edit-report')this.find('.demo-review-sheet').hidden=true;
    else if(action==='details'){this.showEventDetails(this.find('.demo-event-details').hidden);this.scrollWithin(this.find('.demo-event-actions'));}
    else if(action==='join'){this.showJoined(true);this.scrollWithin(this.find('.demo-event-joined'));}
    else if(['upcoming','participation','archive'].includes(action))this.filterEvents(action);
    else if(action==='close-info')this.find('.demo-info-sheet').hidden=true;
    else if(INFO[action]){const [title,text]=INFO[action];this.find('#demo-info-title').textContent=title;this.find('#demo-info-text').textContent=text;this.find('.demo-info-sheet').hidden=false;}
  }
  scrollWithin(target){
    const screen=target.closest('[data-demo-screen]');if(!screen)return;
    const top=target.getBoundingClientRect().top-screen.getBoundingClientRect().top+screen.scrollTop;
    screen.scrollTo({top:Math.max(0,top-screen.clientHeight*.5),behavior:this.canAnimate()?'smooth':'instant'});
  }
  pointTo(name){
    const target=this.find(`[data-pointer="${name}"]`);if(!target||target.hidden)return;
    this.scrollWithin(target);
    this.pointerTimer=this.later(()=>{
      const rect=target.getBoundingClientRect(),base=this.root.getBoundingClientRect(),pointer=this.find('.demo-pointer');
      pointer.style.left=`${rect.left-base.left+rect.width*.7}px`;pointer.style.top=`${rect.top-base.top+rect.height*.55}px`;
      pointer.hidden=false;pointer.classList.remove('is-tapping');void pointer.offsetWidth;pointer.classList.add('is-tapping');
    },this.canAnimate()?200:0);
  }
  hidePointer(){clearTimeout(this.pointerTimer);this.find('.demo-pointer').hidden=true;}
  destroy(){this.clearTimers();}
}
