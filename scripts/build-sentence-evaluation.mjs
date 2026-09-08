// Emit a credential-free, isolated /tmp evaluation command for the service console.
// No deployed files are modified. The credential remains in the service environment.
import { readFileSync } from 'node:fs';
import { brotliCompressSync } from 'node:zlib';
const names = ['server.js', 'billing-rates.js', 'level-matching.js', 'match-result.js', 'preset-edits.js', 'structure-settings.js', 'sentence-patterns.js', 'scripts/evaluate-sentence-aware.mjs', 'test/fixtures/matching-drafts.json', 'test/fixtures/synthetic-profiles.json', 'test/fixtures/clause-labels.json'];
const files = Object.fromEntries(names.map(name => [name, readFileSync(new URL('../' + name, import.meta.url), 'utf8')]));
files['package.json'] = '{"type":"module"}';
const packed = brotliCompressSync(Buffer.from(JSON.stringify(files))).toString('base64');
const run = process.argv[2] || '1';
if (!/^[a-z0-9-]+$/.test(run)) throw new Error('Invalid run ID');
const script = `import{brotliDecompressSync}from"node:zlib";import{mkdtempSync,mkdirSync,writeFileSync,symlinkSync}from"node:fs";import{dirname,join}from"node:path";import{pathToFileURL}from"node:url";const d=mkdtempSync("/tmp/bipass-sentence-code-");const files=JSON.parse(brotliDecompressSync(Buffer.from("${packed}","base64")));for(const[name,body]of Object.entries(files)){const p=join(d,name);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,body)}symlinkSync("/app/node_modules",join(d,"node_modules"));process.env.MATCH_EVAL_DIR="/tmp/bipass-sentence-${run}";process.env.MATCH_EVAL_BASELINE_MODULE="file:///app/level-matching.js";await import(pathToFileURL(join(d,"scripts/evaluate-sentence-aware.mjs")))`;
const command = `node --input-type=module -e '${script}' > /tmp/bipass-sentence-${run}.log 2>&1 &`;
// Railway closes a terminal connection on a paste above 32 KiB. Emit bounded,
// collision-safe chunks when requested; the final command launches only after
// every part is assembled. All writes stay in the approved temporary directory.
if (process.argv.includes('--chunks')) {
  const parts = Array.from({ length: Math.ceil(command.length / 14000) }, (_, i) => command.slice(i * 14000, (i + 1) * 14000));
  const prefix = `/tmp/bipass-sentence-command-${run}`;
  for (const [i, part] of parts.entries()) console.log(`node -e 'require("fs").writeFileSync("${prefix}-${i}",Buffer.from("${Buffer.from(part).toString('base64')}","base64"),{flag:"wx"})'`);
  console.log(`node -e 'const f=require("fs");f.writeFileSync("${prefix}.sh",Buffer.concat(${JSON.stringify(parts.map((_, i) => `${prefix}-${i}`))}.map(p=>f.readFileSync(p))),{flag:"wx"})' && bash ${prefix}.sh`);
} else console.log(command);
