#!/usr/bin/env bash
# Restore src/input.css from main, then apply nav-lead spacing fix only.
set -euo pipefail
cd "$(dirname "$0")/.."

git fetch origin main
git checkout origin/main -- src/input.css

python3 - <<'PY'
from pathlib import Path
p = Path('src/input.css')
t = p.read_text(encoding='utf-8')
old = """.nav-link-lead {
  white-space: normal;
  max-width: 11.5rem;
  line-height: 1.25;
}"""
new = """.nav-link-lead {
  display: inline-block;
  white-space: normal;
  max-width: 12.75rem;
  line-height: 1.35;
  text-wrap: balance;
}

/* Keep brand and primary links from colliding at xl */
@media (min-width: 1280px) {
  nav .nav-primary {
    margin-left: 0.75rem;
    margin-right: 0.5rem;
    column-gap: 1.15rem;
  }
}"""
if old not in t:
    raise SystemExit('nav-link-lead block not found on main copy')
t = t.replace(old, new, 1)
old2 = """  html[lang="ru"] nav .nav-link-lead {
    max-width: 10.5rem;
  }"""
new2 = """  html[lang="ru"] nav .nav-link-lead {
    max-width: 12rem;
  }"""
if old2 in t:
    t = t.replace(old2, new2, 1)
p.write_text(t, encoding='utf-8')
print('patched src/input.css')
PY

npm ci
npm run build
echo Done
