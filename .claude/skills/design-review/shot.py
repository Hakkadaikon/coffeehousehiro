"""Screenshot each section at desktop (1440px) and mobile (390px) widths.

Usage: python shot.py OUT_DIR [BASE_URL]   (BASE_URL defaults to http://localhost:3000)
"""

import asyncio
import os
import sys

from playwright.async_api import async_playwright

SECTIONS = {"hero": "section >> nth=0", "about": "#about", "menu": "#menu", "order": "#order", "access": "#access"}
VIEWPORTS = {"desktop": {"width": 1440, "height": 900}, "mobile": {"width": 390, "height": 844}}


async def main(out: str, url: str) -> None:
    os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for vp_name, vp in VIEWPORTS.items():
            page = await browser.new_page(viewport=vp)
            await page.goto(url, wait_until="networkidle")
            # Scroll through the page so whileInView animations finish before shooting.
            height = await page.evaluate("document.body.scrollHeight")
            for y in range(0, height, 300):
                await page.evaluate(f"window.scrollTo(0, {y})")
                await page.wait_for_timeout(120)
            await page.wait_for_timeout(1200)
            await page.evaluate("window.scrollTo(0, 0)")
            for name, selector in SECTIONS.items():
                await page.locator(selector).first.screenshot(path=f"{out}/{vp_name}-{name}.png")
            await page.close()
        await browser.close()


asyncio.run(main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "http://localhost:3000"))
