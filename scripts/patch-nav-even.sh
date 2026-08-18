#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

python3 - <<'PY'
from pathlib import Path
p = Path('src/input.css')
t = p.read_text(encoding='utf-8')
start = t.find('/* Keep brand and primary links from colliding at xl */')
if start < 0:
    raise SystemExit('start marker not found')
# Find the closing of that @media block (next top-level rule after it)
end = t.find('.nav-link:hover', start)
if end < 0:
    raise SystemExit('end marker not found')
replacement = '''/* Even horizontal spacing: brand | centered links | CTA */
@media (min-width: 1280px) {
  nav[aria-label="Main navigation"] > .max-w-7xl > .flex {
    gap: 1.25rem;
  }

  nav .nav-primary {
    flex: 1 1 auto;
    justify-content: center;
    margin-left: 1.25rem;
    margin-right: 1.25rem;
    column-gap: 1.35rem;
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
}

'''
t = t[:start] + replacement + t[end:]
p.write_text(t, encoding='utf-8')
print('patched src/input.css')
PY

npm ci
npm run build
echo Done
