/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
'use strict';

import {
  log as internalLogger,
  configs
} from './common.js';
import EventListenerManager from './EventListenerManager.js';

// eslint-disable-next-line no-unused-vars
function log(...args) {
  if (configs.logFor['common/contextual-identities'])
    internalLogger(...args);
}

const gContextualIdentities = new Map();

export function get(id) {
  return gContextualIdentities.get(id);
}

export function getCount() {
  return gContextualIdentities.size;
}

export function forEach(callback) {
  for (const identity of gContextualIdentities.values()) {
    callback(identity);
  }
}

export function startObserve() {
  if (!browser.contextualIdentities)
    return;
  browser.contextualIdentities.onCreated.addListener(onContextualIdentityCreated);
  browser.contextualIdentities.onRemoved.addListener(onContextualIdentityRemoved);
  browser.contextualIdentities.onUpdated.addListener(onContextualIdentityUpdated);
}

export function endObserve() {
  if (!browser.contextualIdentities)
    return;
  browser.contextualIdentities.onCreated.removeListener(onContextualIdentityCreated);
  browser.contextualIdentities.onRemoved.removeListener(onContextualIdentityRemoved);
  browser.contextualIdentities.onUpdated.removeListener(onContextualIdentityUpdated);
}

export async function init() {
  if (!browser.contextualIdentities)
    return;
  const identities = await browser.contextualIdentities.query({});
  for (const identity of identities) {
    gContextualIdentities.set(identity.cookieStoreId, identity);
  }
}

export const onUpdated = new EventListenerManager();

function onContextualIdentityCreated(createdInfo) {
  const identity = createdInfo.contextualIdentity;
  gContextualIdentities.set(identity.cookieStoreId, identity);
  onUpdated.dispatch();
}

function onContextualIdentityRemoved(removedInfo) {
  const identity = removedInfo.contextualIdentity;
  delete gContextualIdentities.delete(identity.cookieStoreId);
  onUpdated.dispatch();
}

function onContextualIdentityUpdated(updatedInfo) {
  const identity = updatedInfo.contextualIdentity;
  gContextualIdentities.set(identity.cookieStoreId, identity);
  onUpdated.dispatch();
}
