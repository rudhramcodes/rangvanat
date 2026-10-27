import React from 'react';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { api } from '../src/api/client.js';
import ShopPage from '../src/pages/ShopPage.jsx';
import StoreContext from '../src/context/store.js';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
globalThis.window = dom.window;
dom.window.matchMedia = () => ({ matches: true });
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.React = React;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { render, fireEvent, waitFor, cleanup } = await import('@testing-library/react');

test('catalog filters reset pagination, clear selection, and expose request failures', async () => {
  const originalProducts = api.getProducts;
  const originalCollections = api.getCollections;
  const requests = [];
  api.getCollections = async () => [{ collectionId: 'flora', name: 'The Flora Edit' }];
  api.getProducts = async params => {
    requests.push(params);
    return params.category === 'Dress' ? { error: 'Try again shortly' } : { products: [{ slug: `piece-${params.page}`, title: 'Cotton piece', price: 5000 }], pagination: { total: 25 } };
  };
  try {
    const view = render(<StoreContext.Provider value={{ isInWishlist: () => false, toggleWishlist() {}, addToCart() {} }}><ShopPage navigate={() => {}} /></StoreContext.Provider>);
    await view.findByLabelText('Next page');
    fireEvent.click(view.getByLabelText('Next page'));
    await waitFor(() => assert.equal(requests.at(-1).page, 2));
    fireEvent.click(view.getAllByLabelText('The Flora Edit')[0]);
    await waitFor(() => { assert.equal(requests.at(-1).page, 1); assert.equal(requests.at(-1).collection, 'flora'); });
    fireEvent.click(view.getByLabelText('Remove The Flora Edit filter'));
    await waitFor(() => assert.equal(requests.at(-1).collection, 'all'));
    fireEvent.click(view.getAllByLabelText('Dress')[0]);
    await view.findByText('Try again shortly');
    const count = requests.length;
    fireEvent.click(view.getByText('Try again'));
    await waitFor(() => assert.equal(requests.length, count + 1));
  } finally { cleanup(); api.getProducts = originalProducts; api.getCollections = originalCollections; }
});
