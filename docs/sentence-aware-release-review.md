# Sentence-aware Level Matching: release review

Status: initial implementation pushed as `9d66376`. The user requested a deploy/test/fix workflow. Live application smoke tests are now possible; the full evaluation matrix remains **unverified**, not passed.

## Changes

- Beginner and Student send automatic, level-specific sentence policies. Manual Custom has a compact switch and Balanced / Shorter / More connected styles. My Level uses supported v4 evidence; older profiles remain structure-locked under automatic mode.
- Custom preferences are separate from result policy, profile, and mistake-setting snapshots. Returning to the app or changing a profile cannot rewrite an earlier result's snapshot. History clears snapshots when opening its plain-text entries.
- Server-measured distributions cover all sample prose. Deterministic sampling includes at most 80 sentences, evenly distributed within the supplied samples. Model clause classifications and short observation excerpts must reference real supplied IDs. Stored profiles contain derived measurements and observation support counts, not excerpts.
- Fewer than 200 words or 12 classified sentences means Limited sample. Conflicting sample tendencies remain mixed. The existing 50-word-per-sample minimum, vocabulary scores and mechanical targets are unchanged.

## Completed checks

- `npm run check`: site audit covering 34 HTML files and 102 automated tests.
- Tests cover automatic / manual / legacy profile routing, invalid combinations, single charging and no-charge errors, v4 storage and result snapshots, truncation, invented evidence, deterministic sampling, short and mixed estimates.
- Nine hand-labelled clause fixtures cover shared-subject verbs, independent and subordinate clauses, compound-complex sentences, fragments, quotations, abbreviations and ambiguity. Unit tests verify fixture plumbing and validation, **not live model classification accuracy**.
- Browser checks use real application HTML, CSS and JavaScript with an explicitly fake local account/API. Desktop, 1366×768 short-laptop, and 390×844 mobile layouts were inspected using fixed-size same-origin frames. The browser viewport override did not reliably apply to the intended tab.
- Keyboard switch activation, native select focus, Custom-only visibility, style retention across level switching and refresh, and keyboard disclosure of writing measurements were exercised. No new enclosing card, glow or animation was added to the structure controls.
- Initial My Level matching and editor regeneration both sent `auto` with the saved profile; result labels showed Your sentence style.
- A long Structure group wrapped on mobile. Rejection copied the original; undo copied the rewrite. Keyboard filtering restored original text, and the fake extension endpoint received that currently accepted text.
- Manual text insertion was reflected in copied text. Whole-result replacement and exact copying passed outside the responsive frame; the framed browser control initially inserted instead of replacing. Prefix search correctly reported two occurrences across the sentence group and remaining text; Enter-to-reveal was exercised.

## Initial isolated evaluation: blocked, not passed

The user explicitly approved copying this branch's source and synthetic fixtures into a temporary directory in the private Railway service, using the existing credential in place without changing deployed files. The submitted run could not be confirmed: the console disconnected, reconnect/reload did not recover it, and the dedicated console reported **WebSocket connection failed**. No provider outputs, completed-run totals, latency, usage, repair rate or quality improvements are claimed for this change.

## Post-deployment smoke review

The public app served the new controls and asset versions. Two real, billed matching requests used the same 73-word synthetic timetable draft through the signed-in app, one Beginner and one Student (292 credits each). Both produced validated, atomic Structure groups. No extension upload was performed.

The original two long sentences became four in both runs. Beginner produced 74 words and simplified "taking into account" to "consider". Student produced 80 words and simplified "concentrate" to "focus", but did not show the desired compound-friendly distinction. The surrounding generic flow instruction still told every mode to split complex sentences, weakening the selected policy.

A follow-up removes that universal splitting instruction, explicitly preserves useful compound connections for Student/Balanced, and asks Beginner to choose simpler common verbs too. A regression test checks the instruction separation. This is a calibration change motivated by observed outputs, not proof that all future outputs meet the intended mix. Full pre-imperfection traces, provider usage, repair rate and exact latency were not available through these UI runs.

`scripts/evaluate-sentence-aware.mjs` prepares:

- 12 fixed drafts × six preset/Custom policies × two runs;
- four contrasting synthetic profiles × three held-out drafts × two runs;
- profile analysis, short/conflicting samples, clause fixtures, refinement, and preset baseline comparisons;
- source, validated pre-imperfection wording, final text, change records, timing, usage and validation/repair metrics in local evaluation artifacts.

`scripts/build-sentence-evaluation.mjs` emits an isolated temporary-service command. Regenerate the command from the final source before rerunning. A successful model/API response is only a validation result; every release example still needs separate meaning review. Do not use detector scores or customer samples.

## Deferred writing-quality verification

1. Restore service-console access and establish whether the first evaluation actually started before rerunning.
2. Run the matrix, inspect pre-imperfection outputs and protected text, review meaning separately, calibrate/fix any failures, and record representative real outputs and limitations.
3. Rerun local and browser checks after any calibration changes.

The original pre-push live-review gate was deferred at the user's request. Only task files are included in the commit; unrelated `.DS_Store` and video files remain untouched.
