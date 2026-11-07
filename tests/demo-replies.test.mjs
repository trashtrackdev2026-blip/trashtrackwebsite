import {exampleReply} from '../dist/demo-replies.js';
import test from 'node:test';
import assert from 'node:assert/strict';
test('example chat answers the entered topic instead of repeating a fixed bottle response',()=>{
  assert.match(exampleReply('What about BANANA peels?').text,/peels/);
  assert.match(exampleReply('Where is my collection schedule?').text,/View Full Schedule/);
  assert.match(exampleReply('How can I report dumping?').text,/description/);
});
test('unknown preview questions stay bounded to supported examples',()=>{
  assert.equal(exampleReply('Hello!').title,'Let’s try an example.');
  assert.match(exampleReply('<script>alert(1)</script>').text,/sample replies/);
  assert.match(exampleReply('Can I recycle this plastic bottle?').text,/local collection/);
});
