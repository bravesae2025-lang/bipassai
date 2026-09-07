(function attachMatchResult(root) {
  const categories = ['word', 'grammar', 'tense', 'punct', 'caps', 'spelling', 'structure'];
  const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const textHtml = value => escape(value).replace(/\n/g, '<br>');

  function validateChanges(source, changes) {
    if (typeof source !== 'string' || !Array.isArray(changes)) throw new Error('Invalid change records');
    let end = 0;
    for (const change of changes) {
      if (!Number.isInteger(change.start) || !Number.isInteger(change.end)
          || change.start < end || change.end <= change.start || change.end > source.length
          || change.original !== source.slice(change.start, change.end)
          || typeof change.replacement !== 'string' || !change.replacement.trim()
          || !Array.isArray(change.categories) || !change.categories.length
          || change.categories.some(cat => !categories.includes(cat))) throw new Error('Invalid change records');
      end = change.end;
    }
  }

  function applyChanges(source, changes) {
    validateChanges(source, changes);
    let cursor = 0, result = '';
    for (const change of changes) {
      result += source.slice(cursor, change.start) + change.replacement;
      cursor = change.end;
    }
    return result + source.slice(cursor);
  }

  function render(source, changes) {
    validateChanges(source, changes);
    let cursor = 0, html = '';
    for (const change of changes) {
      html += textHtml(source.slice(cursor, change.start));
      const structure = change.categories.includes('structure');
      const cats = structure ? ['structure'] : change.categories;
      const attr = cats.length === 1 ? `data-cat="${cats[0]}"` : `data-cats="${cats.join(' ')}" data-cat="${cats[0]}"`;
      html += `<span class="word-change-pair${structure ? ' structure-change' : ''}" ${attr}>`;
      if (structure) html += '<span class="structure-tools" contenteditable="false"><span>Structure</span><button type="button" class="structure-original-toggle" aria-expanded="false">Show original</button><button type="button" class="structure-reject">Reject group</button><span class="structure-help">Rejecting restores this whole group, including its wording.</span></span>';
      html += `<mark class="word-changed">${textHtml(change.replacement)}</mark><span class="word-original" contenteditable="false">${textHtml(change.original)}</span></span>`;
      cursor = change.end;
    }
    return html + textHtml(source.slice(cursor));
  }

  function fromResponse(data, source) {
    if (!Array.isArray(data?.changes) || typeof data.cleanText !== 'string') return null;
    const cleanText = applyChanges(source, data.changes);
    if (cleanText !== data.cleanText) throw new Error('The result did not match its change records. Please try again.');
    return { cleanText, html: render(source, data.changes), total: data.changes.length };
  }

  // Detached innerText drops <br> boundaries. Read explicit line breaks and
  // contenteditable block breaks without including review controls or originals.
  function acceptedText(element) {
    const clone = element.cloneNode(true);
    const plain = node => {
      if (node.nodeType === 3) return node.nodeValue;
      if (node.nodeName === 'BR') return '\n';
      let value = '';
      for (const child of node.childNodes) {
        const block = /^(DIV|P|LI)$/.test(child.nodeName);
        if (block && value && !value.endsWith('\n')) value += '\n';
        value += plain(child);
        if (block && child.nextSibling && !value.endsWith('\n')) value += '\n';
      }
      return value;
    };
    clone.querySelectorAll('.word-change-pair').forEach(pair => {
      const rejected = pair.classList.contains('change-reverted') || pair.classList.contains('change-dismissed');
      const node = rejected ? pair.querySelector('.word-original') : pair.cloneNode(true);
      if (!rejected) node.querySelectorAll('.word-original, .structure-tools').forEach(child => child.remove());
      pair.replaceWith(element.ownerDocument.createTextNode(node ? plain(node) : ''));
    });
    clone.querySelectorAll('.word-original, .structure-tools, mark.word-changed.change-reverted, mark.word-changed.change-dismissed').forEach(node => node.remove());
    return plain(clone).trim();
  }

  root.BipassMatchResult = Object.freeze({ categories, validateChanges, applyChanges, render, fromResponse, acceptedText });
})(globalThis);
