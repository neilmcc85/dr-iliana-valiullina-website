#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

python3 - <<'PY'
from pathlib import Path

root = Path('public')

# 1) Include language-switcher.js next to cookie-notice.js on all pages
old_script = '<script src="/js/cookie-notice.js" defer></script>'
new_script = (
    '<script src="/js/cookie-notice.js" defer></script>\n'
    '    <script src="/js/language-switcher.js" defer></script>'
)

script_count = 0
for path in root.rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    if 'language-switcher.js' in text:
        continue
    if old_script not in text:
        continue
    path.write_text(text.replace(old_script, new_script), encoding='utf-8')
    script_count += 1
    print('script', path)

# 2) Replace text "Menu" mobile buttons with compact icon buttons (English money pages)
old_menu = (
    '<button id="mobile-menu-btn" class="xl:hidden px-4 py-2 text-sm font-semibold '
    'rounded-2xl border border-[#0D3B66] text-[#0D3B66]" aria-label="Toggle menu" '
    'aria-controls="mobile-menu" aria-expanded="false">Menu</button>'
)
new_menu = (
    '<button id="mobile-menu-btn" class="xl:hidden w-10 h-10 flex items-center justify-center '
    'text-[#0D3B66] hover:bg-[#F1EDE4] rounded-2xl border border-[#D1D5DB] transition-colors" '
    'aria-label="Toggle menu" aria-controls="mobile-menu" aria-expanded="false">'
    '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'
    '<path d="M4 7h16v2H4V7Zm0 4h16v2H4v-2Zm0 4h16v2H4v-2Z"/></svg></button>'
)

menu_count = 0
for path in root.rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    if old_menu not in text:
        continue
    path.write_text(text.replace(old_menu, new_menu), encoding='utf-8')
    menu_count += 1
    print('menu', path)

print(f'Done. scripts={script_count} menus={menu_count}')
PY
