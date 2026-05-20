#!/usr/bin/env python3
"""
crawl_site.py — Crawl megathinkonline.com and save content to data/site.json

Usage:
    pip install requests beautifulsoup4
    python scripts/crawl_site.py

Run this whenever site content changes (or automate via GitHub Actions).
"""

import json
import re
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("❌ Missing libraries. Run: pip install requests beautifulsoup4")
    raise

BASE = "https://www.megathinkonline.com/en-hk"
PAGES = [
    "/",
    "/courses/",
    "/find-a-tutor/",
    "/services/",
    "/about/",
    "/contact/",
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; MegaThinkBot/1.0; "
        "+https://www.megathinkonline.com)"
    )
}
OUTPUT_PATH = Path(__file__).parent.parent / "data" / "site.json"
MAX_CHARS_PER_PAGE = 5000


def clean_text(soup: BeautifulSoup) -> str:
    """Strip nav/footer/scripts, collapse whitespace."""
    for tag in soup(["nav", "footer", "header", "script", "style", "noscript", "svg"]):
        tag.decompose()
    text = soup.get_text(separator=" ")
    text = re.sub(r"\s+", " ", text).strip()
    return text[:MAX_CHARS_PER_PAGE]


def crawl(path: str) -> dict:
    url = BASE + path
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    return {"url": url, "content": clean_text(soup)}


def main():
    pages = []
    for path in PAGES:
        try:
            page = crawl(path)
            pages.append(page)
            preview = page["content"][:80].replace("\n", " ")
            print(f"✅ {BASE + path}\n   {preview}…")
        except Exception as exc:
            print(f"❌ {BASE + path}: {exc}")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(pages, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Saved {len(pages)} pages → {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
