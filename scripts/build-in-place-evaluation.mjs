// Build a credential-free command for an authenticated service console. The
// provider key stays in that service's environment; only fixed corpus drafts
// are sent to Gemini. This does not modify deployed application files.
import { readFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const mode = process.argv[2] || 'smoke';
const run = process.argv[3] || '1';
if (!['smoke', 'full'].includes(mode)) throw new Error('Use smoke or full');
if (!/^[a-z0-9-]+$/.test(run)) throw new Error('Use a short alphanumeric run identifier');
const result = read('match-result.js');
const matching = read('preset-edits.js') + '\n' + read('level-matching.js')
  .replace("import './match-result.js';", '')
  .replace("import { presetEditPalette, selectedPresetEdits } from './preset-edits.js';", '');
const harness = read('scripts/evaluate-level-matching.mjs')
  .replace(/import \{ runLevelMatching[^\n]+\n/, '')
  .replace("from '../server.js'", "from 'file:///app/server.js'")
  .replace(/const corpus = JSON.parse\(readFileSync\(new URL\([^\n]+\n/, `const corpus = ${read('test/fixtures/matching-drafts.json')};\n`);
const packed = deflateSync(Buffer.from(result + '\n' + matching + '\n' + harness)).toString('base64');
const settings = mode === 'smoke' ? 'MATCH_EVAL_CASE=formal MATCH_EVAL_REPEATS=1' : 'MATCH_EVAL_BASELINE=1';
console.log(`${settings} MATCH_EVAL_DIR=/tmp/bipass-level-${mode}-${run} node --input-type=module -e 'import {inflateSync} from "node:zlib"; await import("data:text/javascript;base64,"+inflateSync(Buffer.from("${packed}","base64")).toString("base64"))'`);
