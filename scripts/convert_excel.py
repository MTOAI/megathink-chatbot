#!/usr/bin/env python3
"""
convert_excel.py — Convert your tutor Excel file to data/tutors.json

Usage:
    pip install pandas openpyxl
    python scripts/convert_excel.py path/to/tutors.xlsx

Expected Excel columns (case-insensitive, spaces become underscores):
    Name | Subjects | Curriculum | Level | Languages | Availability | Experience | Bio | Contact Link

Multiple values in a cell should be comma-separated, e.g.:
    Subjects: "IB Mathematics AA, IB Physics"
    Languages: "English, Cantonese"
"""

import sys
import json
import re
from pathlib import Path

try:
    import pandas as pd
except ImportError:
    print("❌ pandas not installed. Run: pip install pandas openpyxl")
    sys.exit(1)


LIST_FIELDS = {"subjects", "curriculum", "level", "languages"}
OUTPUT_PATH = Path(__file__).parent.parent / "data" / "tutors.json"


def normalise_col(col: str) -> str:
    """Lowercase, strip, replace spaces/hyphens with underscores."""
    return re.sub(r"[\s\-]+", "_", col.strip().lower())


def parse_cell(value, is_list: bool) -> object:
    """Return a list or string from a cell value."""
    if pd.isna(value) or value == "":
        return [] if is_list else ""
    text = str(value).strip()
    if is_list:
        return [v.strip() for v in text.split(",") if v.strip()]
    return text


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/convert_excel.py path/to/tutors.xlsx")
        sys.exit(1)

    xlsx_path = Path(sys.argv[1])
    if not xlsx_path.exists():
        print(f"❌ File not found: {xlsx_path}")
        sys.exit(1)

    print(f"📖 Reading {xlsx_path} ...")
    df = pd.read_excel(xlsx_path, engine="openpyxl")
    df.columns = [normalise_col(c) for c in df.columns]

    tutors = []
    for _, row in df.iterrows():
        tutor = {}
        for col in df.columns:
            is_list = col in LIST_FIELDS
            tutor[col] = parse_cell(row.get(col), is_list)
        tutors.append(tutor)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(tutors, f, ensure_ascii=False, indent=2)

    print(f"✅ Exported {len(tutors)} tutors → {OUTPUT_PATH}")
    print("\nSample entry:")
    print(json.dumps(tutors[0], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
