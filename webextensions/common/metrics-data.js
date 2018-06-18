/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

const gItems = [];

const now = Date.now();
const gInitialTime = now;
let gLastTime    = now;
let gDeltaBetweenLastItem = 0;

export function add(label) {
  const now = Date.now();
  gItems.push({
    label: label,
    delta: now - gLastTime
  });
  gDeltaBetweenLastItem = now - gInitialTime;
  gLastTime = now;
}

export async function addAsync(label, asyncTask) {
  const start = Date.now();
  if (typeof asyncTask == 'function')
    asyncTask = asyncTask();
  return asyncTask.then(result => {
    gItems.push({
      label: `(async) ${label}`,
      delta: Date.now() - start,
      async: true
    });
    return result;
  });
}

export function toString() {
  const logs = gItems.map(item => `${item.delta || 0}: ${item.label}`);
  return `total ${gDeltaBetweenLastItem} msec\n${logs.join('\n')}`;
}

