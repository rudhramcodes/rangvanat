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

test('checkout includes mobile collapsible summary toggle and accessible address fields', () => {
 const html = renderToStaticMarkup(<StoreContext.Provider value={{settings:{demoMode:false},cart:[{key:'item-1',title:'Handspun Kurta',size:'L',quantity:1,price:3400,image:'/images/hero-home.jpg'}],customer:null,couponCode:''}}><CheckoutPage navigate={()=>{}} onOrderComplete={()=>{}} /></StoreContext.Provider>);
 // Mobile collapsible summary button
 assert.match(html, /Show order summary/);
 assert.match(html, /aria-controls="mobile-order-summary-panel"/);
 assert.match(html, /aria-expanded="false"/);

 // Form inputs with proper IDs and noValidate
 assert.match(html, /<form[^>]*noValidate/);
 assert.match(html, /id="checkout-name"/);
 assert.match(html, /id="checkout-email"/);
 assert.match(html, /id="checkout-phone"/);
 assert.match(html, /id="checkout-addressLine1"/);
 assert.match(html, /id="checkout-city"/);
 assert.match(html, /id="checkout-pincode"/);
 assert.match(html, /id="checkout-state"/);
});
