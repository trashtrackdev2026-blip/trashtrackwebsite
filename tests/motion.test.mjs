import test from 'node:test';
import assert from 'node:assert/strict';
import { filmFrame, featureScrollTarget } from '../dist/motion-math.js';

test('scrolling forward and backward selects all four feature chapters', () => {
  const travel = 2800;
  for (const index of [0,1,2,3,2,1,0]) {
    const target = featureScrollTarget(820, travel, index);
    const frame = filmFrame(820-target, travel);
    assert.equal(frame.index,index);
    assert.equal(frame.open,1);
    assert.equal(frame.enter,1);
    assert.equal(frame.out,1);
  }
});
test('first headline and final feature stay visible at timeline bounds', () => {
  assert.equal(filmFrame(100,2800).index,0);
  assert.equal(filmFrame(0,2800).enter,1);
  const final=filmFrame(-5000,2800);
  assert.equal(final.index,3);
  assert.equal(final.out,1);
  assert.equal(final.open,1);
});
test('paused motion keeps every scene readable, including during transitions', () => {
  for (const top of [0,-710,-1430,-2150,-2800]) {
    const frame=filmFrame(top,2800,4,true);
    assert.equal(frame.enter,1);assert.equal(frame.accent,1);assert.equal(frame.open,1);assert.equal(frame.out,1);
  }
});
test('small viewports and out-of-range jumps produce finite values', () => {
  for (const top of [100,0,-1,-10000]) {
    const frame=filmFrame(top,0);
    for(const name of ['progress','phase','enter','accent','open','out']) assert(Number.isFinite(frame[name])&&frame[name]>=0&&frame[name]<=1);
  }
  assert.equal(featureScrollTarget(500,2000,-3),featureScrollTarget(500,2000,0));
  assert.equal(featureScrollTarget(500,2000,99),featureScrollTarget(500,2000,3));
});
