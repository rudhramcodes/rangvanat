import {test} from 'node:test';
import assert from 'node:assert/strict';
import {trackingSteps} from '../src/lib/orderTracking.js';
test('tracking distinguishes completed, current, upcoming and terminal stages',()=>{
  assert.deepEqual(trackingSteps('in_stitching').map(s=>s.state),['complete','current','upcoming','upcoming']);
  assert.equal(trackingSteps('in_stitching')[1].description,'In progress');
  assert.ok(trackingSteps('delivered').every(s=>s.state==='complete'));
  assert.equal(trackingSteps('cancelled').length,1);
  assert.equal(trackingSteps('cancelled')[0].state,'cancelled');
  assert.ok(trackingSteps(undefined).every(s=>s.state==='upcoming'));
});
test('expired reservations explain why a new checkout is needed',()=>{
  assert.equal(trackingSteps('cancelled',true)[0].label,'Checkout expired');
});
