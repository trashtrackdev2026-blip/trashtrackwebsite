import test from 'node:test';
import assert from 'node:assert/strict';
import { ShowClock, demoFrame, FEATURE_ORDER, SCENE_DURATIONS } from '../dist/show-clock.js';

test('automatic chapters advance in order and loop after their reading time',()=>{
  const clock=new ShowClock([300,400,500,600]);let now=0;clock.tick(now);
  for(const expected of [1,2,3,0]){
    const current=clock.index;while(clock.index===current){now+=50;clock.tick(now);}
    assert.equal(clock.index,expected);
  }
});
test('offscreen and user pauses preserve elapsed time without background catch-up',()=>{
  const clock=new ShowClock();clock.tick(0);clock.tick(80);clock.tick(100,false);
  clock.tick(600000,true);assert.equal(clock.elapsed,80);clock.tick(600050,true);assert.equal(clock.elapsed,130);
});
test('manual chapter selection restarts that chapter rather than skipping its demo',()=>{
  const clock=new ShowClock();clock.tick(0);clock.tick(100);clock.select(2);
  assert.equal(clock.index,2);assert.equal(clock.elapsed,0);clock.tick(90000);assert.equal(clock.elapsed,0);
});
test('a delayed frame cannot jump through several scenes',()=>{
  const clock=new ShowClock();clock.tick(0);clock.tick(900000);assert.equal(clock.index,0);assert.equal(clock.elapsed,100);
});
test('each phone sequence completes before its chapter transitions',()=>{
  const frames=FEATURE_ORDER.map((key,index)=>demoFrame(key,SCENE_DURATIONS[index]-100));
  assert.equal(frames[0].ready,true);assert.equal(frames[1].answer,true);assert.equal(frames[2].complete,true);assert.equal(frames[3].joined,true);
});
test('scan progress and report typing advance to stable, readable final states',()=>{
  assert.equal(demoFrame('assist',2000).scanning,true);assert.equal(demoFrame('assist',4000).result,true);
  assert(demoFrame('reports',2500).text.length<demoFrame('reports',4000).text.length);
  assert.equal(demoFrame('reports',7000).text,'Waste bags beside our street.');assert.equal(demoFrame('reports',7000).review,true);
});
test('the native schedule opens, filters active outcomes, and closes before the next scene',()=>{
  assert.equal(demoFrame('collections',2000).scheduleOpen,true);
  assert.equal(demoFrame('collections',5000).filterActive,true);
  assert.equal(demoFrame('collections',9000).scheduleOpen,false);
  assert.notEqual(demoFrame('collections',8000).step,demoFrame('collections',9000).step);
});
