import asyncio
from playwright.async_api import async_playwright

URL = "https://ilumos-claim-review.preview.emergentagent.com"
RAW = "/app/walkthrough/raw2"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(
            viewport={"width": 1440, "height": 810},
            record_video_dir=RAW,
            record_video_size={"width": 1440, "height": 810},
        )
        page = await ctx.new_page()

        async def pause(ms):
            await page.wait_for_timeout(ms)

        await page.goto(URL)
        await pause(3500)

        # 1. Setup -> demo chart -> start
        await page.click('[data-testid="use-demo-chart-btn"]')
        await pause(3600)
        await page.click('[data-testid="start-analysis-btn"]')
        await pause(2600)

        # 2. Element 3 -> strengthen -> send -> read response
        await page.click('[data-testid="chart-row-e3"]')
        await pause(2000)
        await page.click('[data-testid="strengthen-reasoning-btn"]')
        await pause(1200)
        await page.click('[data-testid="chat-send-btn"]')
        await pause(6800)
        await page.mouse.wheel(0, 320)
        await pause(3200)

        # 3. Preview impact -> graph -> show affected -> why E7 -> back
        await page.click('[data-testid="preview-impact-btn"]')
        await pause(3400)
        await page.click('[data-testid="show-affected-btn"]')
        await pause(2200)
        await page.click('[data-testid="explain-btn-e7"]')
        await pause(4200)
        await page.click('[data-testid="why-back-btn"]')
        await pause(1200)

        # 4. Apply change
        await page.click('[data-testid="apply-change-btn"]')
        await pause(3000)

        # 5. Chart review -> comparison -> accept with rationale -> save
        await page.click('[data-testid="run-chart-review-btn"]')
        await pause(2600)
        await page.locator('[data-testid^="open-comparison-btn-"]').first.click()
        await pause(2600)
        await page.click('[data-testid="accept-with-rationale-btn"]')
        await pause(1800)
        await page.click('[data-testid="save-resolution-btn"]')
        await pause(3000)
        await page.click('[data-testid="close-chart-review-btn"]')
        await pause(1800)

        # 6. Supervisor view -> replay
        await page.click('[data-testid="supervisor-view-btn"]')
        await pause(3000)
        await page.locator('[data-testid^="replay-btn-"]').first.click()
        await pause(5200)
        await page.click('[data-testid="decision-replay-modal-close-btn"]')
        await pause(1200)

        # 7. Case Setup round trip
        await page.click('[data-testid="case-setup-back-btn"]')
        await pause(3200)
        await page.click('[data-testid="continue-analysis-btn"]')
        await pause(2800)

        # 8. Export
        await page.click('[data-testid="export-btn"]')
        await pause(2200)
        await page.click('[data-testid="export-final-btn"]')
        await pause(3400)

        await ctx.close()
        await browser.close()

asyncio.run(main())
print("RECORDED")
