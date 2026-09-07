# Level Matching implementation verification

Status: implementation and quotation parser regression fix ready for the user-requested push. The user explicitly requested pushing after being told that live rerun confirmation and output review remain incomplete. This does not constitute a complete writing-quality verification pass.

## Completed checks

- `npm run check`: site audit (34 HTML files) and 87 Node tests pass.
- API tests mock upstream services and cover omitted/invalid structure settings, successful single charging, shared one-repair allowance, persistent malformed output, provider outage, and no-charge failures.
- Pipeline tests cover phrase-length flexibility, complete sentence groups, paragraph boundaries, protected literals, overlapping/invalid records, existing-error budgets, zero-score categories, Custom calibration, atomic two-pass composition, truncated provider output, and escaped rendering.
- Browser fixture: `node scripts/matching-ui-fixture.mjs`, bound to loopback only. Uses real client files with fake auth/API data, not live accounts or generated writing.
- Browser screenshots inspected at desktop (1440×900), short laptop (1366×768), and mobile (390×844). Expanded Custom, My Level, structure controls, expanded originals, and wrapped sentence groups were inspected. Mobile summary wrapping and result-before-filter order were corrected.
- Real keyboard interactions checked radio arrow keys, filter Space, group Enter activation, undo, and visible focus. Structure selection survived refresh, profile/preset switching, return to editor, and a mocked regeneration request.
- Search found text inside a structure group. Copy was verified by pasting into the revision textbox; paragraph breaks and manually edited group text survived. Mock extension payloads matched the accepted text after rejection and after manual edits.
- `/qa-checks` reports six passing browser assertions for paragraph/block breaks, split editable marks, group rejection, filter rejection, and excluding expanded originals/toolbars.
- Removed mandatory tour notice/timer; walkthrough now explains structure before generation. Existing dark panel materials retained, without adding an outer background glow.
- New controls have no animated transitions. Search scrolling respects reduced motion in code; OS-level reduced-motion emulation was not performed.

Testing also found and fixed a pre-existing out-of-scope-variable error in the My Level fingerprint animation. Initial mock-SDK syntax errors were fixture-only and corrected before interaction testing.

## Live evaluation: run completed, review incomplete

The existing production Gemini key was available. With user authorization, the fixed-corpus harness ran in place through the authenticated Railway console; no credential was extracted or added locally. These direct provider evaluations incur model usage but do not debit application accounts or alter deployed application source.

The latest confirmed complete run, `/tmp/bipass-level-full-7`, produced 96 cases: 95 passed structural validation and one failed (`quotes-easy-flow-1`, protected-content overlap). The failed request would return a retryable error without charging in the application, as covered by API tests. Twenty-four legacy baselines were collected separately in an earlier run.

With the user's explicit approval, the rejected quotation artifact was retrieved. The first model response incorrectly changed punctuation inside a quotation and was correctly rejected. Its repair preserved the quotation exactly and shortened `describes the surfers as being` to `describes the surfers as`, but the edit normalizer unnecessarily consumed the unchanged opening quote when anchoring the deletion. The normalizer now prefers a preceding shared word. An exact regression reproduces the repaired model record in both Keep and Flow modes and verifies reconstruction without overlapping the quotation. The full suite passes with this fix.

Earlier runs exposed unsafe or invalid free-form mechanical edits. Preset mechanics now select exact server-generated candidate IDs, with contextual model selection and validation. Candidates preserve tense and protected spans, avoid unknown technical words, and recognize previously generated typos. Custom/Profile generation remains separately calibrated. This latest version is covered by the 87-test suite.

The user approved reading synthetic evaluation artifacts through Railway; that access succeeded. An eight-case quotation rerun was submitted as `/tmp/bipass-level-full-8`, but browser execution timed out, then disconnected. Its execution/completion could not be confirmed. Reconnection attempts and screenshot/DOM reads also timed out. The remaining blocker is browser connectivity, not a missing key or missing approval. No completed manual quality pass rate, final latency/usage totals, or unconditional release approval is claimed.

For an environment where the key is already configured:

```sh
MATCH_EVAL_BASELINE=1 node --env-file=.env scripts/evaluate-level-matching.mjs
```

This runs the 12 fixed drafts through both presets and both structure modes twice (96 outputs), plus 24 legacy baselines. It calls Gemini directly, incurs provider usage, and does not debit application accounts. Artifacts default to `/private/tmp/bipass-match-evaluation`. Each stores source, canonical output, records, stage data, latency, and provider usage; production telemetry never stores draft text. `passed` means generation/structural validation completed, not that writing quality passed. All output artifacts begin with `qualityReview: pending`.

Review each artifact for phrase simplification, Beginner/Student differentiation, safe distributed mechanical slips, existing-error recognition, protected content, factual meaning, and sentence flow. Review stage-one text separately so misspellings do not appear to improve readability. Capture representative actual examples and failures before approving release.

Mechanical ranges are product calibration targets, not empirical definitions of writing ability. Protected-span recognition is conservative and heuristic; validation is not a semantic-equivalence proof. Model classification of existing errors and explanations of unavoidable target shortfalls still require corpus review, despite the user's decision to push now.

## Research basis

Selective splitting, not uniformly short sentences, follows the [sentence-splitting study](https://aclanthology.org/2022.tsar-1.1/). Separate meaning review follows the [reading-comprehension evaluation research](https://aclanthology.org/2024.tacl-1.24/). Detector evasion is not a success metric; the [DAMAGE study](https://aclanthology.org/2025.genaidetect-1.9/) examines detection of adversarially modified generated text.

## Release state

The user requested pushing the current implementation with the verification limitations above disclosed. Existing unrelated `.DS_Store` and video files are excluded. No database migration or standalone workflow was added.
