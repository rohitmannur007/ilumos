import asyncio, json
from playwright.async_api import async_playwright

URL = "https://ilumos-claim-review.preview.emergentagent.com"
RAW = "/app/walkthrough/raw3"
timings = json.load(open('/app/walkthrough/timings.json'))
TOTAL = timings['total']

# absolute-time schedule (seconds) aligned to narration segments
SCHEDULE = [
    (9.4,  ('click', '[data-testid="use-demo-chart-btn"]')),
    (16.2, ('click', '[data-testid="start-analysis-btn"]')),
    (23.3, ('click', '[data-testid="chart-row-e3"]')),
    (29.6, ('click', '[data-testid="strengthen-reasoning-btn"]')),
    (35.6, ('click', '[data-testid="chat-send-btn"]')),
    (40.5, ('wheel', 320)),
    (50.4, ('click', '[data-testid="preview-impact-btn"]')),
    (58.0, ('click', '[data-testid="show-affected-btn"]')),
    (60.8, ('click', '[data-testid="explain-btn-e7"]')),
    (66.6, ('click', '[data-testid="why-back-btn"]')),
    (67.5, ('click', '[data-testid="apply-change-btn"]')),
    (74.1, ('click', '[data-testid="run-chart-review-btn"]')),
    (76.6, ('click_first', '[data-testid^="open-comparison-btn-"]')),
    (78.9, ('click', '[data-testid="accept-with-rationale-btn"]')),
    (80.7, ('click', '[data-testid="save-resolution-btn"]')),
    (82.6, ('click', '[data-testid="close-chart-review-btn"]')),
    (84.0, ('click', '[data-testid="supervisor-view-btn"]')),
    (87.0, ('click_first', '[data-testid^="replay-btn-"]')),
    (92.6, ('click', '[data-testid="decision-replay-modal-close-btn"]')),
    (94.1, ('click', '[data-testid="case-setup-back-btn"]')),
    (98.0, ('click', '[data-testid="continue-analysis-btn"]')),
    (102.2, ('click', '[data-testid="export-btn"]')),
    (105.5, ('click', '[data-testid="export-final-btn"]')),
]

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(
            viewport={"width": 1440, "height": 810},
            record_video_dir=RAW,
            record_video_size={"width": 1440, "height": 810},
        )
        page = await ctx.new_page()
        await page.goto(URL)
        await page.wait_for_timeout(800)
        loop = asyncio.get_event_loop()
        t0 = loop.time()
        for t, (kind, sel) in SCHEDULE:
            wait = t - (loop.time() - t0)
            if wait > 0:
                await page.wait_for_timeout(int(wait * 1000))
            if kind == 'click':
                await page.click(sel, timeout=8000)
            elif kind == 'click_first':
                await page.locator(sel).first.click(timeout=8000)
            elif kind == 'wheel':
                await page.mouse.wheel(0, sel)
            print('acted at', round(loop.time() - t0, 1), sel)
        remaining = TOTAL - (loop.time() - t0)
        if remaining > 0:
            await page.wait_for_timeout(int(remaining * 1000))
        await ctx.close()
        await browser.close()

asyncio.run(main())
print("RECORDED")
