#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

python3 - <<'PY'
from pathlib import Path
p = Path('src/input.css')
t = p.read_text(encoding='utf-8')
old = """.nav-link-lead {
  display: inline-block;
  white-space: normal;
  max-width: 12.75rem;
  line-height: 1.35;
  text-wrap: balance;
}"""
new = """.nav-link-lead {
  display: inline-block;
  white-space: normal;
  max-width: 10.25rem;
  min-width: 9.5rem;
  line-height: 1.35;
  flex-shrink: 0;
  text-wrap: balance;
}"""
if old not in t:
    raise SystemExit('nav-link-lead block not found')
p.write_text(t.replace(old, new, 1), encoding='utf-8')
print('patched nav-link-lead')
PY

npm ci
npm run build
echo Done
