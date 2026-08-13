import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:3000';
const cdpUrl = process.env.CDP_URL || 'http://127.0.0.1:9222';
const screenshotDir = resolve(root, 'screenshots');
let sequence = 0;

mkdirSync(screenshotDir, {recursive: true});

function connect(url) {
  return new Promise((resolveConnection, reject) => {
    const socket = new WebSocket(url);
    const pending = new Map();
    socket.addEventListener('open', () => {
      resolveConnection({
        socket,
        send(method, params = {}) {
          const id = ++sequence;
          socket.send(JSON.stringify({id, method, params}));
          return new Promise((resolveResult, rejectResult) => {
            pending.set(id, {resolveResult, rejectResult});
          });
        },
      });
    });
    socket.addEventListener('error', reject);
    socket.addEventListener('message', ({data}) => {
      const message = JSON.parse(data);
      if (!message.id || !pending.has(message.id)) return;
      const {resolveResult, rejectResult} = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) rejectResult(new Error(message.error.message));
      else resolveResult(message.result);
    });
  });
}

const wait = (ms) => new Promise((resolveWait) => setTimeout(resolveWait, ms));

async function openPage(viewport, reducedMotion = false) {
  const target = await fetch(`${cdpUrl}/json/new?${encodeURIComponent('about:blank')}`, {
    method: 'PUT',
  }).then((response) => response.json());
  const client = await connect(target.webSocketDebuggerUrl);
  await Promise.all([
    client.send('Page.enable'),
    client.send('Runtime.enable'),
    client.send('Network.enable'),
    client.send('Emulation.setDeviceMetricsOverride', viewport),
    client.send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{name: 'prefers-reduced-motion', value: reducedMotion ? 'reduce' : 'no-preference'}],
    }),
  ]);
  return {client, target};
}

async function evaluate(client, expression) {
  const {result, exceptionDetails} = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.text || 'Browser evaluation failed');
  return result.value;
}

async function navigate(client, url) {
  await client.send('Page.navigate', {url});
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const state = await evaluate(client, 'document.readyState');
    if (state === 'complete') return;
    await wait(50);
  }
  throw new Error(`Timed out loading ${url}`);
}

async function click(client, selector) {
  const point = await evaluate(client, `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
  })()`);
  if (!point) throw new Error(`Missing control: ${selector}`);
  await client.send('Input.dispatchMouseEvent', {type: 'mouseMoved', x: point.x, y: point.y});
  await client.send('Input.dispatchMouseEvent', {type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1});
  await client.send('Input.dispatchMouseEvent', {type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1});
}

async function wheel(client, deltaY) {
  await client.send('Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: 200,
    y: 400,
    deltaX: 0,
    deltaY,
  });
}

async function wheelTo(client, selector, offset = 80) {
  const distance = await evaluate(client, `document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect().top - ${offset}`);
  await wheel(client, distance);
  await wait(550);
}

async function screenshot(client, name) {
  const {data} = await client.send('Page.captureScreenshot', {format: 'png', fromSurface: true});
  writeFileSync(resolve(screenshotDir, name), Buffer.from(data, 'base64'));
}

async function closePage(target, client) {
  client.socket.close();
  await fetch(`${cdpUrl}/json/close/${target.id}`);
}

function check(condition, message, failures) {
  if (!condition) failures.push(message);
}

const failures = [];

// Desktop: use the visible nav anchor, then exercise pause, play, and offscreen pause.
{
  const {client, target} = await openPage({width: 1440, height: 900, deviceScaleFactor: 1, mobile: false});
  await navigate(client, `${baseUrl}/`);
  await evaluate(client, 'document.fonts.ready.then(() => true)');
  await wait(300);
  await evaluate(client, `(() => {
    window.__autotyperQaShift = 0;
    window.__autotyperQaShiftSources = [];
    window.__autotyperQaObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          window.__autotyperQaShift += entry.value;
          window.__autotyperQaShiftSources.push({
            value: entry.value,
            sources: (entry.sources || []).map((source) => ({
              node: source.node?.id || source.node?.className || source.node?.tagName || 'unknown',
              previous: source.previousRect,
              current: source.currentRect,
            })),
          });
        }
      }
    });
    window.__autotyperQaObserver.observe({type: 'layout-shift', buffered: false});
  })()`);
  await click(client, 'a.nav-link[href="#auto-typer"]');
  await wait(1400);
  const initial = await evaluate(client, `(() => {
    const section = document.getElementById('auto-typer').getBoundingClientRect();
    const card = document.querySelector('.autotyper-film-card').getBoundingClientRect();
    const video = document.getElementById('autotyper-film');
    return {
      hash: location.hash,
      sectionTop: section.top,
      cardTop: card.top,
      cardBottom: card.bottom,
      cardWidth: card.width,
      videoTime: video.currentTime,
      videoPaused: video.paused,
      videoReady: video.readyState,
      overflow: document.documentElement.scrollWidth - innerWidth,
      bodyCursor: getComputedStyle(document.body).cursor,
      navCursor: getComputedStyle(document.querySelector('a.nav-link')).cursor,
      canvasCount: document.querySelectorAll('body > canvas').length,
    };
  })()`);
  check(initial.hash === '#auto-typer', 'desktop nav link did not reach #auto-typer', failures);
  check(initial.sectionTop > -2 && initial.sectionTop < 3, `desktop section anchor landed at ${initial.sectionTop}px`, failures);
  check(initial.cardWidth > 900, `desktop film card is unexpectedly narrow (${initial.cardWidth}px)`, failures);
  check(initial.videoReady >= 2, `desktop video readyState is ${initial.videoReady}`, failures);
  check(!initial.videoPaused && initial.videoTime > 0.15, 'desktop film did not autoplay once visible', failures);
  check(initial.overflow <= 1, `desktop horizontal overflow is ${initial.overflow}px`, failures);
  check(initial.bodyCursor !== 'none', `desktop body cursor is ${initial.bodyCursor}`, failures);
  check(initial.navCursor === 'pointer', `desktop nav cursor is ${initial.navCursor}`, failures);
  check(initial.canvasCount === 0, `desktop loaded ${initial.canvasCount} custom cursor canvas`, failures);

  await wheelTo(client, '.autotyper-film-card', 112);
  await screenshot(client, 'autotyper-desktop.png');
  await click(client, '#autotyper-film-toggle');
  await wait(350);
  const paused = await evaluate(client, `({paused: document.getElementById('autotyper-film').paused, label: document.getElementById('autotyper-film-toggle').ariaLabel})`);
  check(paused.paused && paused.label.startsWith('Play'), 'desktop pause control did not pause the film', failures);
  await click(client, '#autotyper-film-toggle');
  await wait(500);
  const resumed = await evaluate(client, `({paused: document.getElementById('autotyper-film').paused, time: document.getElementById('autotyper-film').currentTime})`);
  check(!resumed.paused && resumed.time > initial.videoTime, 'desktop play control did not resume the film', failures);
  await wheel(client, 1900);
  await wait(500);
  const afterScroll = await evaluate(client, `({paused: document.getElementById('autotyper-film').paused, shift: window.__autotyperQaShift || 0})`);
  check(afterScroll.paused, 'desktop film kept playing while offscreen', failures);
  check(afterScroll.shift < 0.05, `desktop cumulative layout shift was ${afterScroll.shift}`, failures);

  // Repeatedly traverse the page to catch fixed-layer repaint or geometry bugs.
  for (let index = 0; index < 12; index += 1) {
    await wheel(client, index % 2 === 0 ? 680 : -680);
    await wait(55);
  }
  const stressed = await evaluate(client, `(() => ({
    overflow: document.documentElement.scrollWidth - innerWidth,
    shift: window.__autotyperQaShift || 0,
    shiftSources: window.__autotyperQaShiftSources || [],
    canvasCount: document.querySelectorAll('body > canvas').length,
    filmWidth: document.querySelector('.autotyper-film-card').getBoundingClientRect().width,
  }))()`);
  check(stressed.overflow <= 1, `desktop overflow changed after scroll stress (${stressed.overflow}px)`, failures);
  check(stressed.shift < 0.05, `desktop layout shifted during scroll stress (${stressed.shift}): ${JSON.stringify(stressed.shiftSources)}`, failures);
  check(stressed.canvasCount === 0, `desktop still has ${stressed.canvasCount} viewport cursor canvas`, failures);
  check(Math.abs(stressed.filmWidth - initial.cardWidth) < 1, 'desktop film width changed during scroll stress', failures);
  await closePage(target, client);
}

// Mobile: scroll with wheel input, confirm the single-column layout, then stress the scroll path.
{
  const {client, target} = await openPage({width: 390, height: 844, deviceScaleFactor: 1, mobile: true});
  await navigate(client, `${baseUrl}/`);
  await wheelTo(client, '#auto-typer', 18);
  const mobileHeader = await evaluate(client, `(() => {
    const section = document.getElementById('auto-typer').getBoundingClientRect();
    const title = document.getElementById('autotyper-title').getBoundingClientRect();
    return {
      sectionTop: section.top,
      titleLeft: title.left,
      titleRight: title.right,
      ctaLeft: document.querySelector('.autotyper-store-link').getBoundingClientRect().left,
      ctaRight: document.querySelector('.autotyper-store-link').getBoundingClientRect().right,
      overflow: document.documentElement.scrollWidth - innerWidth,
    };
  })()`);
  check(Math.abs(mobileHeader.sectionTop - 18) < 4, `mobile section landed at ${mobileHeader.sectionTop}px`, failures);
  check(mobileHeader.ctaLeft >= 0 && mobileHeader.ctaRight <= 390, 'mobile CTA is clipped horizontally', failures);
  check(mobileHeader.titleLeft >= 0 && mobileHeader.titleRight <= 390, 'mobile title is clipped horizontally', failures);
  check(mobileHeader.overflow <= 1, `mobile horizontal overflow is ${mobileHeader.overflow}px`, failures);
  await screenshot(client, 'autotyper-mobile-header.png');

  await wheelTo(client, '.autotyper-film-card', 80);
  await wait(800);
  const mobileFilmBefore = await evaluate(client, `(() => {
    const card = document.querySelector('.autotyper-film-card').getBoundingClientRect();
    const video = document.getElementById('autotyper-film');
    return {left: card.left, right: card.right, width: card.width, height: card.height, paused: video.paused};
  })()`);
  check(mobileFilmBefore.left >= 0 && mobileFilmBefore.right <= 390, 'mobile film card is clipped', failures);
  check(!mobileFilmBefore.paused, 'mobile film did not play while visible', failures);
  await screenshot(client, 'autotyper-mobile.png');
  for (let index = 0; index < 8; index += 1) {
    await wheel(client, index % 2 === 0 ? 70 : -70);
    await wait(40);
  }
  const mobileFilmAfter = await evaluate(client, `(() => {
    const card = document.querySelector('.autotyper-film-card').getBoundingClientRect();
    return {width: card.width, height: card.height};
  })()`);
  check(Math.abs(mobileFilmAfter.width - mobileFilmBefore.width) < 1, 'mobile film width changed while scrolling', failures);
  check(Math.abs(mobileFilmAfter.height - mobileFilmBefore.height) < 1, 'mobile film height changed while scrolling', failures);
  await closePage(target, client);
}

// Cursor regression: blogs formerly loaded the custom canvas while app pages
// hid the system cursor without loading it. Verify both surfaces plus text input.
{
  const {client, target} = await openPage({width: 1440, height: 900, deviceScaleFactor: 1, mobile: false});
  await navigate(client, `${baseUrl}/blog/`);
  await client.send('Input.dispatchMouseEvent', {type: 'mouseMoved', x: 720, y: 420});
  await wheel(client, 900);
  await wait(250);
  const blogCursor = await evaluate(client, `(() => {
    const link = document.querySelector('a');
    return {
      body: getComputedStyle(document.body).cursor,
      link: link ? getComputedStyle(link).cursor : null,
      canvases: document.querySelectorAll('body > canvas').length,
      cursorScripts: [...document.scripts].filter((script) => /cursor\\.js/.test(script.src)).length,
    };
  })()`);
  check(blogCursor.body !== 'none', `blog body cursor is ${blogCursor.body}`, failures);
  check(blogCursor.link === 'pointer', `blog link cursor is ${blogCursor.link}`, failures);
  check(blogCursor.canvases === 0, `blog loaded ${blogCursor.canvases} custom cursor canvas`, failures);
  check(blogCursor.cursorScripts === 0, `blog loaded ${blogCursor.cursorScripts} custom cursor script`, failures);

  await navigate(client, `${baseUrl}/login.html`);
  const loginCursor = await evaluate(client, `(() => ({
    body: getComputedStyle(document.body).cursor,
    input: getComputedStyle(document.querySelector('input')).cursor,
    button: getComputedStyle(document.querySelector('button')).cursor,
    canvases: document.querySelectorAll('body > canvas').length,
  }))()`);
  check(loginCursor.body !== 'none', `login body cursor is ${loginCursor.body}`, failures);
  check(loginCursor.input === 'text', `login input cursor is ${loginCursor.input}`, failures);
  check(loginCursor.button === 'pointer', `login button cursor is ${loginCursor.button}`, failures);
  check(loginCursor.canvases === 0, `login loaded ${loginCursor.canvases} custom cursor canvas`, failures);
  await closePage(target, client);
}

// Reduced motion: the poster remains, while autoplay and its control are removed.
{
  const {client, target} = await openPage({width: 1440, height: 900, deviceScaleFactor: 1, mobile: false}, true);
  await navigate(client, `${baseUrl}/#auto-typer`);
  await wait(500);
  const reduced = await evaluate(client, `(() => {
    const video = document.getElementById('autotyper-film');
    const poster = document.querySelector('.autotyper-film-poster');
    const toggle = document.getElementById('autotyper-film-toggle');
    return {
      videoDisplay: getComputedStyle(video).display,
      toggleDisplay: getComputedStyle(toggle).display,
      posterDisplay: getComputedStyle(poster).display,
      paused: video.paused,
    };
  })()`);
  check(reduced.videoDisplay === 'none', `reduced-motion video display is ${reduced.videoDisplay}`, failures);
  check(reduced.toggleDisplay === 'none', `reduced-motion toggle display is ${reduced.toggleDisplay}`, failures);
  check(reduced.posterDisplay !== 'none', 'reduced-motion poster is hidden', failures);
  check(reduced.paused, 'reduced-motion video is still playing', failures);
  await wheelTo(client, '.autotyper-film-card', 112);
  await screenshot(client, 'autotyper-reduced-motion.png');
  await closePage(target, client);
}

if (failures.length) {
  console.error(`Auto Typer browser QA failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log('Browser QA passed: stable system cursors, desktop controls, offscreen pause, mobile scroll stability, and reduced-motion poster.');
}
