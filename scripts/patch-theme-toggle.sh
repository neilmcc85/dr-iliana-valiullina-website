#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

python3 - <<'PY'
from pathlib import Path
p = Path('src/input.css')
t = p.read_text(encoding='utf-8')

old = """.theme-toggle {
  width: 2.5rem;
  height: 2.5rem;
  line-height: 1;
}"""
new = """.theme-toggle {
  /* Match EN language control: same height, rounded-2xl pill, not a mismatched circle */
  width: auto;
  min-width: 2.25rem;
  height: 2.25rem;
  padding: 0 0.65rem;
  border-radius: 1rem;
  line-height: 1;
  font-size: 0.95rem;
}"""
if old not in t:
    raise SystemExit('theme-toggle base block not found')
t = t.replace(old, new, 1)

old2 = """html[data-theme="dark"] .theme-toggle {
  background-color: #102337;
  border-color: #E4C56F !important;
  color: #EED389 !important;
}"""
new2 = """html[data-theme="dark"] .theme-toggle {
  background-color: transparent;
  border-color: #263B50 !important;
  color: #EED389 !important;
}
html[data-theme="dark"] .theme-toggle:hover {
  background-color: #1a2d42 !important;
}"""
if old2 not in t:
    raise SystemExit('theme-toggle dark block not found')
t = t.replace(old2, new2, 1)

p.write_text(t, encoding='utf-8')
print('patched theme-toggle')
PY

npm ci
npm run build
echo Done
