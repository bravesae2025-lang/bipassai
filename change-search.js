(function attachChangeSearch(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.BipassChangeSearch = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function makeChangeSearch() {
  const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;

  function tokenize(value) {
    return String(value || '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(/’/g, "'")
      .match(WORD_PATTERN) || [];
  }

  function sameWords(value, query) {
    const valueWords = tokenize(value);
    const queryWords = tokenize(query);
    return queryWords.length > 0
      && valueWords.length === queryWords.length
      && valueWords.every((word, index) => word === queryWords[index]);
  }

  function countOccurrences(text, query) {
    const textWords = tokenize(text);
    const queryWords = tokenize(query);
    if (!queryWords.length || textWords.length < queryWords.length) return 0;

    let count = 0;
    for (let index = 0; index <= textWords.length - queryWords.length; index += 1) {
      if (queryWords.every((word, offset) => textWords[index + offset] === word)) count += 1;
    }
    return count;
  }

  function containsWords(value, query) {
    return countOccurrences(value, query) > 0;
  }

  function displayQuery(query) {
    return tokenize(query).join(' ');
  }

  return { tokenize, sameWords, containsWords, countOccurrences, displayQuery };
});
