import asyncio, json, os, subprocess
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

from emergentintegrations.llm.openai import OpenAITextToSpeech

OUT = '/app/walkthrough/voice'
GAP = 0.7
LEAD = 0.5

SEGMENTS = [
    "This is iLumos, claim review intelligence. A claim chart isn't a collection of independent rows. It's a connected set of analytical decisions.",
    "One click loads the demo chart and four fictional Acme documents, indexed for evidence search.",
    "Ten claim elements. Review readiness is computed live: eight ready, one open dependency, one evidence gap.",
    "Element three has an evidence gap. It claims machine learning, but no source actually says that.",
    "I'll ask the assistant to strengthen the reasoning. It reviews the element, searches the sources, compares evidence chains, and checks downstream impact.",
    "The answer is structured: finding, evidence, interpretation, limitation, proposed action. And it warns of downstream effects on elements seven and nine.",
    "Before anything changes, I preview the impact. High impact: two affected decisions, two shared evidence chains.",
    "Here's exactly why element seven is affected: shared concept, shared evidence, and the actual before-and-after text. Analyst judgment required.",
    "Applying the change. Elements seven and nine are flagged for review, and every step is logged.",
    "Chart review shows the dependency side by side. I accept with a rationale: the broader treatment is intentional. Ten of ten ready. Zero open issues.",
    "The supervisor gets a read-only review center, and a decision replay that explains why this sentence looks like this now, from original text to final state.",
    "The analyst can return to case setup at any time. Nothing is lost. Continue analysis restores the exact same workspace.",
    "Export produces a real Word document with the final chart, evidence, decision history, and rationale. That's iLumos: change one decision, and see what else it affects.",
]

def dur(path):
    out = subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path])
    return float(out.strip())

async def main():
    os.makedirs(OUT, exist_ok=True)
    tts = OpenAITextToSpeech(api_key=os.environ['EMERGENT_LLM_KEY'])
    timings = []
    t = LEAD
    for i, text in enumerate(SEGMENTS):
        path = f'{OUT}/seg_{i:02d}.mp3'
        audio = await tts.generate_speech(text=text, model='tts-1-hd', voice='onyx')
        with open(path, 'wb') as f:
            f.write(audio)
        d = dur(path)
        timings.append({'i': i, 'start': round(t, 2), 'duration': round(d, 2), 'text': text[:60]})
        print(f'seg {i:02d}: start={t:.2f}s dur={d:.2f}s')
        t += d + GAP
    total = t - GAP + 1.5
    with open('/app/walkthrough/timings.json', 'w') as f:
        json.dump({'segments': timings, 'total': round(total, 2)}, f, indent=1)
    print('TOTAL', round(total, 2))

asyncio.run(main())
