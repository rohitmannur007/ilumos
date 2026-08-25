# iLumos Walkthrough — narration script

Deliverables:
- `iLumos-walkthrough-narrated.mp4` (114 s) — narrated version, voiceover generated with OpenAI tts-1-hd (onyx) and timed to each action. **Use this one for the submission.**
- `iLumos-walkthrough.mp4` (75 s) — silent fast cut of the same golden path.
- `iLumos-demo.gif` (30 s) — the signature impact-preview moment, embedded in the README.

The narrated video's voiceover was produced from the condensed script in `make_voice.py`
(segment timings in `timings.json`; the recorder `record_narrated.py` plays the UI in sync
with those timestamps).

The table below is the long-form script — use it as captions or for a live re-record.

| Time | On screen | Narration |
|------|-----------|-----------|
| 0:00 | Case Setup | "This is iLumos — Claim Review Intelligence. A claim chart isn't a set of independent rows; it's a connected set of analytical decisions. I'll load the fictional demo case, US123456 vs Acme Thermostat." |
| 0:04 | Demo chart indexing | "One click loads the claim chart and four fictional Acme documents, indexed for evidence search." |
| 0:08 | Analyst Workspace | "The workspace: case and documents on the left, the ten-element claim chart in the center, and an element investigation panel on the right. Review readiness is computed live — eight of ten elements ready, one open dependency, one evidence gap." |
| 0:12 | Element 3 selected | "Element 3 — the learning-algorithm limitation — is flagged with an evidence gap. Its reasoning asserts machine learning, but no source says that." |
| 0:16 | Strengthen reasoning | "I ask the assistant to strengthen the reasoning. Watch the staged analysis: it reviews the element, searches the uploaded sources, compares evidence chains, and checks downstream impact." |
| 0:24 | Structured AI response | "The answer is structured: finding, evidence with exact citations, interpretation, limitation, proposed action, and impact. Crucially, it refuses to invent an ML implementation — and it warns of a potential downstream effect on Elements 7 and 9." |
| 0:29 | Reasoning Impact | "Before anything changes, I preview the impact. iLumos calculated related decisions from the dependency model: impact level HIGH, two affected decisions, two shared evidence chains." |
| 0:33 | Affected decisions | "Here are the affected decisions, and here is exactly why Element 7 is affected — shared concept, shared evidence, and the actual before-and-after text. This is a potential reasoning dependency; analyst judgment required." |
| 0:41 | Apply change | "I apply the change. Element 3 becomes evidence-backed, and Elements 7 and 9 are flagged for review — the chart updates, readiness recalculates, and the decision is logged." |
| 0:46 | Claim Chart Review | "Chart review shows the open dependency between Element 3 and Element 7 with a side-by-side comparison of the two analytical positions." |
| 0:51 | Accept with rationale | "I accept with a rationale — Element 7 has an additional limiting condition, so the broader treatment is intentional. Ten of ten elements ready, zero open issues, zero unsupported AI assertions." |
| 0:58 | Supervisor View | "Sarah, the supervising reviewer, gets a read-only Review Center: high-impact decisions, and honest recent decision activity — AI proposal, analyst acceptance, impact detection, resolution." |
| 1:02 | Decision Replay | "Decision replay answers 'why does this sentence look like this now?' — original text, AI proposal, evidence added, impact detected, analyst resolution, current state. All generated from stored decision objects." |
| 1:09 | ← Case Setup | "One more thing: the analyst can jump back to Case Setup at any point — nothing is lost. The files are still there, the session is still active, and 'Continue analysis' returns to the exact same workspace." |
| 1:14 | Export | "Finally, export produces a real Word document with the final chart, evidence citations, full decision history, and reviewer rationale. That's iLumos: when the analyst changes one claim-chart decision, iLumos shows what else that decision might affect." |

Not covered by the video (kept under 3 minutes): the wrong-evidence correction on Element 2,
the no-evidence refusal on Element 3, and undo. All are interactive in the app.
