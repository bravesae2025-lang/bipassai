# Sentence-aware Level Matching: release review

Status (2026-09-08): **user approved deployment before remaining live verification**. Local fixes pass 117 automated tests and the 34-page audit. The user explicitly requested pushing these fixes and checking the live website afterward because the Railway console continues to fail. This changes the release order, not the quality evidence: final live verification remains incomplete. The separate THB 10 total test ceiling still applies; no further bulk matrix is authorized.

## Approved capped follow-up

The user approved **at most THB 10 total** for remaining targeted checks and a website check. No paid calls have been sent under this new allowance. Do not resume the bulk matrix or interpret the user's separate THB 1,000 account budget as a testing allowance.

`scripts/verify-capped-profile.mjs` prepares one fixed connected-profile check with a THB 2 ceiling, leaving THB 8 reserved for a website request. It reserves worst-case output plus a conservative UTF-8-byte input bound before sending, uses THB 40/USD including conversion/fee headroom, retains the current 8,192-token thinking setting, and lowers the test-only output ceiling to 16,384. It permits one provider call and stops at validation failure without a paid repair. It refuses to rerun the same output directory. This check has **not executed**; only its syntax was checked.

Both embedded and dedicated Railway consoles returned **WebSocket connection failed**. Reconnection was attempted without making model requests or changing billing. Current follow-up spend: **THB 0**. The reported billing-limit change remains unverified, and no release/push is claimed.

## Funded resumption

- The first funded run completed 150 jobs: 142 validated, two matching failures and six profile analyses rejected by the provider's schema-complexity limit. Removing nested outer array bounds from the provider schema fixed that incompatibility; server-side size and evidence limits remain enforced.
- A profiles-only rerun completed 31 jobs: all seven analysis/refinement jobs and 22 of 24 held-out matches validated. Two matching failures were safely rejected for invalid edit scope. Clause estimation still overclaims the ambiguous `They saw her duck.` fixture; it is not a guaranteed parser.
- Reviewing accepted writing revealed contextual grammar errors (`visited to`, `make the scheme bigger the scheme`) and empty filler frames. The wording stage now supplies complete grammatical text first, with exact agreement required between that text and its edit records. This checks record completeness, not semantic correctness.
- An 18-case targeted run validated 15. One exceeded the mechanical budget; two exposed a deterministic grouping bug when Structure records included inter-sentence whitespace. The grouping bug is fixed with a regression test. The shared one-repair allowance and strict failure/no-charge behavior remain unchanged.
- The complete-text candidate `/tmp/bipass-sentence-final-review-20260908` completed 175 jobs: 144 validated, 31 rejected. All seven analysis/refinement jobs passed; 18 of 24 profile matches validated. Usage: 1,167,043 total tokens across 263 successful provider responses. Eighteen successful jobs used repair; 80 stage-validation failures were recorded overall. Successful-job median latency was 17.17 seconds, p90 31.54 seconds. These are validation results, **not** 144 quality approvals.
- Exact mismatch feedback improved the targeted retest `/tmp/bipass-sentence-repair-review-20260908` to 22/24 validated. Remaining failures: duplicated surrounding phrase in formal Beginner and overlapping technical Custom records. Neither was accepted. This run also used conservative protection of modal qualifiers (can/may/must etc.), added after an accepted earlier rewrite changed `can affect` into `affects`.
- Further local corrections: phrase-length reduction no longer triggers a whole-output truncation guard (complete-output and Structure-group guards remain); supported v4 clause evidence explicitly takes priority over generic legacy "simple writing" descriptions. Limited or mixed profiles do not receive a dominant clause instruction. The connected held-out profile previously split too much despite correctly measured compound usage, motivating this change.
- Latest full candidate: `/tmp/bipass-sentence-release-candidate-20260908`. One profile analysis succeeded, then the provider rejected the next with **"Your project has exceeded its monthly spending cap."** The harness stopped scheduling immediately: two recorded jobs, one valid analysis, zero matching jobs run. No full pass of this candidate is claimed. Raising the cap requires the user's billing decision; no billing settings were changed.
- Browser rechecks: saved Custom Shorter preference survives refresh; My Level initial matching and regeneration send the saved automatic profile policy; manual replacement copies exactly and the mock extension receives that replacement. Mobile long-group rejection and undo both copy the correct currently accepted text, including inside the responsive iframe.
- Scoped accessibility review used the [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md): labelled native controls, keyboard focus, conditional visibility and wrapping were checked. No new UI styling or glow was introduced by these verification fixes.

Funded historical artifacts: `/tmp/bipass-sentence-funded-20260908`, `/tmp/bipass-sentence-profiles-funded-20260908`, and `/tmp/bipass-sentence-context-20260908`. All use synthetic fixtures only; these are temporary service files, not permanent archives.

### Funded-run usage and remaining gates

| Run | Jobs / validated | Provider-reported total tokens |
| --- | ---: | ---: |
| Funded first run | 150 / 142 | 819,555 |
| Profile schema retest | 31 / 29 | 212,330 |
| Complete-text targeted check | 18 / 15 | 170,805 |
| Complete-text full matrix | 175 / 144 | 1,167,043 |
| Precise repair + qualifier retest | 24 / 22 | 232,749 |
| Latest candidate, cap-blocked | 2 / 1 | 7,374 |

Total for these funded evaluations: **2,609,856 provider-reported tokens**, excluding the minimal connectivity diagnostic. Provider tokens are not app credits or a dollar invoice. The harness bypasses customer history/charging; API credit behavior is separately covered by tests.

The latest candidate's phrase-truncation correction and measured-profile priority still need live evaluation. Complete factual review, consistent Student/compound-profile calibration, and the final full-candidate writing gate remain open. Earlier accepted outputs exposed meaning drift and weak profile adherence, so passing structural validation alone is insufficient. Do not commit/push this as fully verified.

Representative reviewed improvement (pre-imperfections): Beginner changed the formal library passage into more direct statements beginning "The new library scheme greatly improved access to books. Before, some students had trouble getting the right books." Student retained more connected clauses. Technical Beginner changed "converts" to "changes" and "held constant" to "kept the same", while Student retained the technical wording. The chosen Beginner formal output had 12 mechanical slips over 99 eligible words; Student had seven over 102. These are individual examples, not proof of consistent performance across the corpus.

Read-only summary of the completed 175-job matrix: all 37 validated preset outputs were within their mechanical-count range. Among validated results only, Beginner sentence counts summed to 123→134, Student 98→88, Shorter 119→137, Connected 128→106, and Custom Keep 110→110. Different failure sets mean these are not matched-pair averages; counts do not establish clause types or meaning. Beginner removed all predefined difficult phrases in its validated cases; Student retained one. The report helper is `scripts/summarize-sentence-evaluation.mjs` and makes no provider calls.

## Full-run findings — 2026-09-08

The private Railway console recovered. The approved synthetic-only harness ran in the service using its credential in place. No API key was copied, app credits charged, customer samples analysed, real profiles saved, detector services contacted, or billing settings changed.

| Run | Recorded jobs | Validated responses | Provider usage reported |
| --- | ---: | ---: | ---: |
| Deployed `f552e31` | 157 | 148 | 1,003,840 total tokens across 322 successful provider responses |
| First isolated fixes | 199 | 72 | 585,808 total tokens across 172 successful provider responses |
| Latest isolated candidate | 174 | 0 | No successful provider response |

**Validated does not mean writing-quality approved.** The first run covered all 12 drafts × six policies × two runs, but three profile analyses failed, so only the remaining profile reached held-out matching. It had nine failed jobs and 14 successful matching-stage repairs. The second run included four successful full-profile analyses and successful refinement; six jobs failed validation and 121 were rejected after the provider balance ran out. Eleven matching-stage repairs succeeded before that interruption. The latest candidate had 174 provider-balance failures; no latest-candidate writing-quality pass is claimed.

A separate minimal diagnostic returned HTTP 429 with the explicit message **“Your prepayment credits are depleted.”** This is not an inferred temporary rate limit. It affects app generation on the same project. Adding credit or changing billing requires the user; no attempt was made to do either. The harness now stops scheduling on 401/403/429 instead of exhausting its queue against a blocked provider.

### Defects reproduced and local changes

- Profile observations sometimes exceeded 12 words or supplied four evidence objects. Exact-source and size validation remain strict; schema bounds, actionable feedback, and at most one evidence repair were added. All four full profiles and refinement passed in the intermediate run; the final short-sample schema fix still needs live verification.
- Refinement's `gemini-2.5-flash-lite` endpoint rejected this project as unavailable. Refinement now uses the same `gemini-2.5-flash` model that successfully analysed the samples. This replacement passed live refinement once. Model lifecycle background: [Google Gemini deprecations](https://ai.google.dev/gemini-api/docs/deprecations).
- Word replacements produced `the teachers' what they saw`. Added a possessive-context regression and validation check.
- A Student rewrite used `..., This ...` and `..., They ...` as sentence joins. Added a pre-imperfection comma-splice regression/check and clearer coordination instructions.
- The model selected Structure records in locked Custom mode, changed quoted terminal punctuation while joining sentences, and proposed empty deletion replacements. Stage-specific category schemas and more explicit safe-repair instructions address these cases without weakening protected-text validation. Final live rechecks remain blocked.
- All-zero Custom/Profile mechanical settings made an unnecessary provider call, which could invent existing-error records and fail an otherwise valid result. This stage is now an exact no-op with telemetry; configured nonzero mechanics and all preset targets remain unchanged. Unit tests cover the no-op and charge/routing contracts.
- The terminal disconnected above its 32 KiB paste limit. The evaluation builder now offers `--chunks`; do not paste the original full command directly.

### Representative pre-imperfection review

The dense 73-word timetable fixture remained almost unchanged for deployed Student. After the first instruction adjustment, Beginner produced six more directly expressed sentences, beginning:

> The school had introduced a new timetable to give students more time to finish their work. But several teachers said that the longer afternoon lessons made it harder for students to focus.

Student's second intermediate run produced three sentences, beginning:

> The school had set up a new timetable so students would have more time to finish their work, but some teachers said that the longer afternoon lessons made it harder for students to focus.

That is more connected but still compound-complex, not evidence of the requested mostly compound tendency. Student's other run contained the malformed joins noted above. The latest prompt explicitly addresses nested attribution and unnecessary dependent clauses, but it has **not** produced a live output yet.

Intermediate profile analysis distinguished compound-oriented and complex-oriented samples and marked conflicting samples as mixed/limited. The nine clause fixtures scored 8/9 against the hand labels; `They saw her duck.` was called simple rather than uncertain. These remain model estimates, not guaranteed syntactic measurements. Complete held-out profile matching, baseline comparisons, mechanical-density review across every output, and full factual/meaning review are unfinished.

### Functional review in this turn

- `npm run check`: 111 tests and the 34-page site audit pass; `git diff --check` passes.
- Rechecked 390px mobile and 1366×768 laptop Custom controls, visible focus, switch keyboard activation, native select changes, conditional visibility, preference retention across level switching, wrapping and scrolling. Previous desktop checks remain recorded below; no new CSS was introduced this turn.
- Keyboard-expanded mobile writing-habit details wrap and scroll. The counts are clearly labelled as estimates.
- Atomic rejection, undo, keyboard filtering, prefix search and exact accepted-text copy were rechecked. Responsive-frame clipboard access initially failed; top-level copying passed, and the local-only frame fixture now grants clipboard permissions. This is a test-fixture constraint, not a claimed production copy defect.
- Mock extension upload returned success after filtering. No real extension upload occurred. Remaining browser regression checks should be completed after the live rerun.

### Resume requirements

1. User restores the Gemini project's prepaid balance; do not request or extract its existing API key.
2. Run the latest source using a new isolated run ID and `--chunks`, with quota fail-fast enabled. Preserve and review outputs before deployment removes temporary artifacts.
3. Review all required writing and held-out profile cases, fix remaining failures, recheck browser interactions and project tests, then commit/push. Do not represent the current local fixes as fully verified.

Existing raw run artifacts are in the private service under `/tmp/bipass-sentence-verify-20260908`, `/tmp/bipass-sentence-verify-fix-20260908`, and `/tmp/bipass-sentence-verified-20260908`. They are temporary and can disappear on deployment/restart. Representative findings and counts above are saved locally.

## Changes

- Beginner and Student send automatic, level-specific sentence policies. Manual Custom has a compact switch and Balanced / Shorter / More connected styles. My Level uses supported v4 evidence; older profiles remain structure-locked under automatic mode.
- Custom preferences are separate from result policy, profile, and mistake-setting snapshots. Returning to the app or changing a profile cannot rewrite an earlier result's snapshot. History clears snapshots when opening its plain-text entries.
- Server-measured distributions cover all sample prose. Deterministic sampling includes at most 80 sentences, evenly distributed within the supplied samples. Model clause classifications and short observation excerpts must reference real supplied IDs. Stored profiles contain derived measurements and observation support counts, not excerpts.
- Fewer than 200 words or 12 classified sentences means Limited sample. Conflicting sample tendencies remain mixed. The existing 50-word-per-sample minimum, vocabulary scores and mechanical targets are unchanged.

## Completed checks

- `npm run check`: site audit covering 34 HTML files and 105 automated tests.
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

A real Custom-off request preserved all four sentence boundaries, the quotation, `Smith (2020)`, `12.5%`, `cannot`, and the exact URL. It simplified five phrases but introduced `at at` where a replacement met unchanged text. A second fix checks the complete wording-stage output for newly introduced duplicate function words and routes that failure through the existing single repair allowance. Tests reproduce the boundary problem, verify repair, and retain existing repetitions and legitimate `that that` constructions. No mechanical target or charging behavior changed.

After Railway marked `d470597` active, the Custom retest returned `More details are at https://example.org/research.` without duplication, preserving all protected strings and the structure lock. Student's retest used three sentences rather than four, but exposed another phrase-context error: mid-clause `consequently` became `So` after the subject. A further validation check rejects that specific invalid connector substitution, while permitting sentence-initial `So`, `and so`, and whole-clause Structure rewrites. This uses the same repair allowance; it does not claim to validate all grammar or meaning automatically.

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
