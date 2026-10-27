import React from 'react';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import StoreContext from '../src/context/store.js';
import CheckoutPage from '../src/pages/CheckoutPage.jsx';
globalThis.React = React;
test('demo checkout keeps product details and address form visible', () => {
 const html = renderToStaticMarkup(<StoreContext.Provider value={{settings:{demoMode:true},cart:[{key:'sample-M',title:'Sample Khadi Jacket',size:'M',quantity:2,price:5950,image:'/images/hero-home.jpg'}],customer:null,couponCode:''}}><CheckoutPage navigate={()=>{}} onOrderComplete={()=>{}} /></StoreContext.Provider>);
 assert.match(html,/Sample Khadi Jacket/);
 assert.match(html,/Size: M/);
 assert.match(html,/Qty: 2/);
 assert.match(html,/Full Name/);
 assert.match(html,/Demo checkout/);
 assert.doesNotMatch(html,/Explore the demo\./);
});
