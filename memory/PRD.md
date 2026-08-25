# iLumos — Claim Review Intelligence

## Original problem statement
Build a submission-ready Lumenci PM take-home prototype: a frontend-first claim-chart refinement workspace where a material reasoning change on one element (E3) surfaces downstream impact (E7/E9) via a dependency model, with impact preview, why-affected explanations, human-in-the-loop accept/edit/reject/undo, chart-level review, supervisor read-only review center, decision replay provenance, and export. Deterministic simulated AI; fictional US123456 vs Acme Thermostat demo data; static-deployable.

## Architecture
- React 19 + Tailwind SPA, fully client-side, no backend calls.
- `/app/frontend/src/ilumos/data.js` — case, 10 claim elements, 11 evidence objects, dependency model (E3→E7, E3→E9), AI instructions, hero proposal, default rationale.
- `/app/frontend/src/ilumos/store.jsx` — context + useReducer; session state (files, elements, messagesByElement, decisions, issues, undoStack, pendingProposal) is independent of navigation state (`screen`, `reviewOpen`, `modal`); `analysisExists` tracks analysis lifecycle separately from `screen`.
- Components in `/app/frontend/src/ilumos/components/` — SetupScreen, Header, LeftPanel, ClaimChart, Investigation, ImpactModal (+WhyModal), ChartReview (+ResolveModal), SupervisorView, ReplayModal, ExportModal, AboutModal, bits (Modal/StatusChip/EvidenceChip/SourceModal).
- Navigation: hash sync (#setup/#workspace/#supervisor/#review) + hashchange listener; ← Case Setup control in Header, ChartReview, and every modal chrome.

## User personas
- Patent Analyst (Rohit): upload, investigate, refine, accept/edit/reject, undo, correct evidence, resolve issues, export.
- Supervising Reviewer (Sarah): read-only Review Center, high-impact decisions, activity filters, decision replay.

## Core requirements (static)
Golden path: setup → E3 → strengthen → preview impact → why affected → apply → E7/E9 flagged → chart review → accept with rationale → 10/10 → supervisor → replay → export. Edge cases: wrong evidence (E2→arch12), no-evidence refusal (ai_refusal ≠ unsupported_assertion), undo, file upload/index/remove, per-element chat isolation, source preview per evidenceId.

## Implemented (July 2026)
- Full prototype: all screens, dependency impact engine, decision model, replay, deterministic AI intents.
- Case Setup ↔ Analysis navigation: `analysisExists` lifecycle flag, ← Case Setup from workspace/supervisor/chart-review/modals, Continue analysis on setup, session badge, duplicate-file guard, replace-chart confirmation, hash-based browser back support, toast overlap fix (bottom-left).
- Real binary .docx export via docx UMD vendored at `frontend/public/vendor/docx.umd.js`, lazy-loaded at export time (webpack/babel could not process the docx ESM/CJS builds — vendoring avoids the toolchain entirely).
- Escape keyboard shortcut: toggles workspace ↔ Case Setup, closes Chart Review overlay, modals keep their own Escape handling.
- GitHub Pages readiness: `homepage: "./"` in package.json, `.nojekyll` in public, verified `yarn build` output with relative asset paths; deploy instructions in README.
- Walkthrough video `walkthrough/iLumos-walkthrough.mp4` (75 s) + timestamped narration script `walkthrough/WALKTHROUGH.md` + re-record script `walkthrough/record_walkthrough.py`.
- Fixed: visual-edits dev plugin wraps dynamic JSX expressions in display:contents spans, which silently breaks SVG <text> children — ImpactGraph rebuilt with HTML nodes/labels over SVG edge paths.
- Fixed: custom Tailwind `accent` palette key collided with shadcn's `accent` (later key wins) making accent buttons washed out — renamed to `brand`.
- Narrated walkthrough: `walkthrough/iLumos-walkthrough-narrated.mp4` (114 s, OpenAI tts-1-hd onyx voice, timings.json drives the recorder so actions sync with narration); silent 75 s cut + 30 s demo GIF (README) also produced.
- GitHub Pages: `.github/workflows/pages.yml` (Actions-based deploy on push to main), git repo initialized at /app with secrets excluded, README badges + GIF + 3 deploy options.
- Mobile polish: below xl the workspace gets a tab bar (Claim Chart / Investigation / Case & Documents); selecting an element auto-switches to Investigation; header wraps; impact graph scrolls horizontally; verified 390px no page overflow.
- Craft pass (framer-motion + lenis): masked line-by-line hero reveal on Case Setup, fictional ACME thermostat SVG product card with spotlight + 3D mouse tilt (translateZ depth), spring modal entrances, staggered chart-row and replay-timeline reveals, lenis momentum scrolling. Deliberately skipped marquee/manifesto/stock photography — the assignment spec explicitly forbids marketing-page patterns.
- Distribution: clean git repo at /app (platform internals excluded), `/app/ilumos-github-ready.zip` = git archive of HEAD, ready to unzip → init → push.
- `SUBMISSION.md` — evaluator-facing checklist: link slots, publish steps, golden path, edge cases, real-vs-simulated table.
- `walkthrough/mux_voiceover.sh` — one-command helper to mux a human-recorded voiceover onto the silent cut.

## Backlog
- P1: user pushes the repo to their GitHub and enables Pages (manual flow chosen; steps in README + finish notes).
- P2: human-recorded narration if AI voiceover isn't preferred.

## Tested
Golden path, resolve flow, undo, wrong-evidence, no-evidence, navigation round-trips with full state preservation, browser back/forward, replace-chart confirm cancel, modal safety. All via browser automation on the preview URL.
