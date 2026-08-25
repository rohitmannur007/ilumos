# iLumos — Submission

**Product:** iLumos — Claim Review Intelligence
**Thesis:** A patent claim chart is not a collection of independent rows — it is a connected set of analytical decisions. When the analyst changes one claim-chart decision, iLumos shows what else that decision might affect.

## Links

| | |
|---|---|
| **Live demo (GitHub Pages)** | ⬜ `https://<your-user>.github.io/<repo>/` *(fill in after enabling Pages — see below)* |
| **Interim live preview** | https://ilumos-claim-review.preview.emergentagent.com *(Emergent preview — usable today; replace with the Pages URL for submission)* |
| **Repository** | ⬜ `https://github.com/<your-user>/<repo>` *(fill in after push)* |
| **Walkthrough video (1:54, narrated)** | `walkthrough/iLumos-walkthrough-narrated.mp4` in this repo — ⬜ add hosted link if you upload it elsewhere |
| Demo GIF | `walkthrough/iLumos-demo.gif` (also embedded in README) |

No login, no API keys, no backend — the demo opens straight into Case Setup.

## Publishing the live demo (two commands + one toggle)

```bash
# inside the unzipped ilumos-github-ready folder
git init -b main && git add -A && git commit -m "iLumos prototype"
git remote add origin https://github.com/<your-user>/<repo>.git && git push -u origin main
```

Then: repo **Settings → Pages → Source: GitHub Actions**. The included workflow
(`.github/workflows/pages.yml`) builds `frontend/` and publishes on every push to `main`.
The Pages URL appears in the workflow run's deploy step output.

## Golden-path demo (what to show the evaluator)

1. **Case Setup** → *Use demo claim chart* → watch upload → indexing → ready → **Start analysis**
2. Workspace opens: 10-element claim chart, live **Review Readiness** (8/10, 1 open dependency, 1 evidence gap)
3. Click **Element 3 · Learning algorithm** (the hero element, flagged with an evidence gap)
4. Click **Strengthen reasoning** → send the prefilled message
5. Watch the staged AI processing, then the structured answer: Finding · Evidence · Interpretation · Limitation · Proposed action · Impact, with a before/after diff
6. Click **Preview impact** — the signature moment: dependency graph shows **E3 → E7** and **E3 → E9** with real relationship labels
7. **Show affected decisions** → **Explain** on Element 7 → "Why is Element 7 affected?" (shared concept, shared evidence, actual before/after, *analyst judgment required*)
8. **Apply change & review affected elements** → E7/E9 flagged in the chart, readiness recalculates, toast confirms
9. **Run Chart Review** → open the E3 ↔ E7 comparison → **Accept with rationale** → save → **10/10 ready, 0 open issues**
10. **Supervisor View** (read-only): high-impact decision card, recent decision activity (filters: All / AI / Analyst / Review)
11. **View reasoning replay**: Original → AI proposal → Evidence added → Impact detected → Analyst resolution → Current state
12. **← Case Setup** → files and session intact → **Continue analysis** → exact same workspace returns (or press `Esc`)
13. **Export** → real `.docx` with final chart, evidence citations, decision history, and reviewer rationale

## Edge cases worth trying

- **Wrong evidence:** Element 2 → *This evidence is wrong* → AI concedes, searches remaining documents, offers Acme Technical Architecture p.12 → *Use source*
- **No evidence:** Element 3 → *Find ML implementation evidence* → AI refuses to infer; *Leave unresolved* records a review event — **not** counted as an unsupported AI assertion (final metric stays 0)
- **Undo:** after applying the E3 refinement → *Undo last refinement* restores reasoning, evidence, status, and recalculates dependencies
- **Upload:** any local `.xlsx/.csv` chart and `.pdf/.docx/.txt` documents; invalid extensions show a meaningful error; remove works
- **Element-scoped chat:** Element 3's conversation never leaks into Element 7
- **Source previews:** every citation chip opens the correct source (arch27 ≠ guide14)

## What is real vs simulated

| Real | Simulated (deterministic, stated in About) |
|---|---|
| Full interaction model, dependency engine, undo, provenance, replay | AI responses (scripted, evidence-grounded) |
| File selection, progress, indexing states, validation | Document parsing/indexing |
| Real `.docx` export with complete provenance | Patent/prior-art search (not attempted) |
| All metrics derived from live state | Acme Thermostat data (fictional) |

iLumos does not provide legal advice or legal conclusions.

## Tech

React 19 + Tailwind, fully static (`frontend/`), no backend, no env vars, no secrets.
Run: `cd frontend && yarn install && yarn start` · Build: `yarn build` · Deploy: GitHub Actions workflow included.
Motion: framer-motion (reveals, springs) + lenis (smooth scroll). Export: docx (vendored UMD, lazy-loaded).
