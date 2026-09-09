import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function fixture({ failure = false } = {}) {
  const elements = new Map();
  const dialog = new EventTarget();
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = value => { dialog.returnValue = value; dialog.open = false; dialog.dispatchEvent(new Event('close')); };
  elements.set('history-delete-dialog', dialog);
  const get = id => {
    if (!elements.has(id)) elements.set(id, { textContent: '', focus() {} });
    return elements.get(id);
  };
  const deleted = [], notices = [];
  const context = vm.createContext({
    document: { getElementById: get },
    window: { bipassAuth: { client: { from: table => ({ delete: () => ({ eq: async (key, id) => {
      assert.equal(table, 'results'); assert.equal(key, 'id'); deleted.push(id);
      return { error: failure ? new Error('offline') : null };
    } }) }) } } },
    sessionStorage: { getItem: () => null, removeItem() {} },
    notice: message => notices.push(message),
  });
  const source = fs.readFileSync(new URL('../history.js', import.meta.url), 'utf8').replace(/init\(\);\s*$/, '');
  vm.runInContext(source, context);
  vm.runInContext("allResults = [{ id: 'only-approved', text: '<unsafe> synthetic draft', created_at: '2026-09-08T07:45:00Z' }]; renderFiltered = () => {}; showToast = notice;", context);
  let handler;
  context.bindCardActions({ dataset: {}, addEventListener: (type, callback) => { handler = callback; } });
  const button = { dataset: { id: 'only-approved' }, disabled: false };
  const click = () => handler({ target: { closest: selector => selector === '.history-btn-delete' ? button : null } });
  return { dialog, get, deleted, notices, click, context, button };
}

test('History deletion waits for explicit in-page confirmation and only deletes the selected ID', async () => {
  const f = fixture();
  const pending = f.click();
  assert.equal(f.dialog.open, true);
  assert.deepEqual(f.deleted, []);
  assert.equal(f.get('history-delete-preview').textContent, '<unsafe> synthetic draft');
  await f.click(); // Double clicks must not create a second deletion.
  f.dialog.close('delete');
  await pending;
  assert.deepEqual(f.deleted, ['only-approved']);
  assert.equal(vm.runInContext('allResults.length', f.context), 0);
  assert.equal(f.notices[0], 'Saved result deleted');
});

test('History Cancel and Escape leave saved results untouched', async () => {
  for (const value of ['cancel', '']) {
    const f = fixture();
    const pending = f.click();
    f.dialog.close(value);
    await pending;
    assert.deepEqual(f.deleted, []);
    assert.equal(vm.runInContext('allResults.length', f.context), 1);
  }
});

test('History deletion failure preserves the result and releases the submission lock', async () => {
  const f = fixture({ failure: true });
  const pending = f.click();
  f.dialog.close('delete');
  await pending;
  assert.equal(vm.runInContext('allResults.length', f.context), 1);
  assert.equal(vm.runInContext('deleteRequestPending', f.context), false);
  assert.equal(f.button.disabled, false);
  assert.match(f.notices[0], /could not be deleted/);
});

test('History confirmation has accessible labels, an irreversible warning, and Cancel focus', () => {
  const html = fs.readFileSync(new URL('../history.html', import.meta.url), 'utf8');
  assert.match(html, /<dialog[^>]+aria-labelledby="history-delete-title"[^>]+aria-describedby="history-delete-warning"/);
  assert.match(html, /value="cancel" autofocus/);
  assert.match(html, /cannot be undone/);
  assert.match(html, /<form method="dialog">/);
});
