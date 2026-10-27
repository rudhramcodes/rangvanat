import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Settings} from '../src/modules/settings/settings.model.js';
import {preventDemoOrders} from '../src/modules/orders/demo-guard.js';

test('demo mode rejects order/payment calls and database errors fail closed', async()=>{
 const original=Settings.findOne;
 try {
  let forwarded=false, code, body;
  const res={status(n){code=n;return this;},json(v){body=v;return this;}};
  Settings.findOne=()=>({lean:async()=>({demoMode:true})});
  await preventDemoOrders({},res,()=>{forwarded=true;});
  assert.equal(code,403);assert.equal(body.success,false);assert.equal(forwarded,false);
  Settings.findOne=()=>({lean:async()=>({demoMode:false})});
  await preventDemoOrders({},res,()=>{forwarded=true;});assert.equal(forwarded,true);
  const error=new Error('database unavailable');let received;
  Settings.findOne=()=>({lean:async()=>{throw error;}});
  await preventDemoOrders({},res,e=>{received=e;});assert.equal(received,error);
 }finally{Settings.findOne=original;}
});
