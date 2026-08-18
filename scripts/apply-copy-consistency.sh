#!/usr/bin/env bash
# One-shot, idempotent copy fixes for public HTML.
# Safe to re-run. Does not change prices, design, or tracking.
set -euo pipefail
cd "$(dirname "$0")/.."

# Homepage twitter description: language lessons (not English-only)
if grep -q 'Public USD prices for English lessons\.' public/index.html; then
  sed -i 's/Public USD prices for English lessons\./Public USD prices for language lessons./' public/index.html
  echo "Updated public/index.html twitter description"
else
  echo "public/index.html already OK or pattern missing"
fi

# Academic meta: CEUB completed
if grep -q 'university teaching at CEUB in 2025/26' public/academic/index.html; then
  sed -i 's/university teaching at CEUB in 2025\/26/university teaching at CEUB (completed 2025–2026)/' public/academic/index.html
  echo "Updated public/academic/index.html meta"
else
  echo "public/academic/index.html already OK or pattern missing"
fi

# Language-lessons disclaimer
if ! grep -q 'not legal advice' public/language-lessons/index.html; then
  sed -i 's/Twenty-lesson English blocks are available on request\./Twenty-lesson English blocks are available on request. Legal-language lessons are education and language training, not legal advice./' public/language-lessons/index.html
  echo "Updated public/language-lessons/index.html disclaimer"
else
  echo "public/language-lessons/index.html already has disclaimer"
fi

# Lessons page disclaimer (insert after intro paragraph if missing)
if ! grep -q 'not legal advice' public/lessons/index.html; then
  python3 - <<'PY'
from pathlib import Path
p = Path('public/lessons/index.html')
t = p.read_text(encoding='utf-8')
old = '''                    <p class="mt-3 text-sm sm:text-base text-[#4B5563] leading-relaxed">
                        Dr. Iliana Valiullina — international law scholar. Online one-to-one lessons for lawyers, academics, and professionals.
                    </p>'''
new = old + '''
                    <p class="mt-3 text-sm text-[#6B7280] leading-relaxed">
                        Legal English and related language lessons are education and language training, not legal advice.
                    </p>'''
if old in t:
    p.write_text(t.replace(old, new, 1), encoding='utf-8')
    print('Updated public/lessons/index.html disclaimer')
else:
    print('public/lessons/index.html intro block not found; skip')
PY
else
  echo "public/lessons/index.html already has disclaimer"
fi

echo "Done. Review git diff, then commit."
