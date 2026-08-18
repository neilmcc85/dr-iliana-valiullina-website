#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

python3 - <<'PY'
from pathlib import Path
p = Path('src/input.css')
t = p.read_text(encoding='utf-8')
marker = """/* Keep brand and primary links from colliding at xl */
@media (min-width: 1280px) {
  nav .nav-primary {
    margin-left: 0.75rem;
    margin-right: 0.5rem;
    column-gap: 1.15rem;
  }
}"""
addition = """/* Keep brand and primary links from colliding at xl */
@media (min-width: 1280px) {
  nav .nav-primary {
    margin-left: 0.5rem;
    margin-right: 0.5rem;
    column-gap: 1rem;
  }

  /* Name stays on one line; logo+name block does not shrink */
  nav[aria-label="Main navigation"] > .max-w-7xl > .flex > .flex.items-center.gap-x-3:first-of-type {
    flex-shrink: 0;
  }
  nav[aria-label="Main navigation"] > .max-w-7xl > .flex > .flex.items-center.gap-x-3:first-of-type .font-semibold {
    white-space: nowrap;
  }

  /* Consultation CTA stays on one line */
  nav[aria-label="Main navigation"] a.btn-primary {
    flex-shrink: 0;
    white-space: nowrap;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  nav[aria-label="Main navigation"] a.btn-primary span {
    white-space: nowrap;
  }
}"""
if marker not in t:
    raise SystemExit('expected nav-primary block not found')
p.write_text(t.replace(marker, addition, 1), encoding='utf-8')
print('patched src/input.css')
PY

npm ci
npm run build
echo Done
