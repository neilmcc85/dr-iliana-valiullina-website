"""Patch site HTML for privacy/cookies/terms links, form consent, cookie notice."""
from pathlib import Path
import re

ROOT = Path(r"C:\GrokProjects\dr-iliana-valiullina-website\public")

LEGAL_LINKS = (
    '<a href="/privacy/" class="hover:text-[#0D3B66]">Privacy</a>\n'
    "                    <a href=\"/cookies/\" class=\"hover:text-[#0D3B66]\">Cookies</a>\n"
    "                    <a href=\"/terms/\" class=\"hover:text-[#0D3B66]\">Terms</a>"
)

CONSENT_BLOCK = """
                            <label class="flex items-start gap-x-3 text-sm text-[#4B5563] leading-relaxed cursor-pointer">
                                <input type="checkbox" name="privacyConsent" value="yes" required
                                       class="mt-1 h-4 w-4 rounded border-[#D1D5DB] text-[#0D3B66] focus:ring-[#C2A34F]">
                                <span>I agree to the processing of my details as described in the
                                    <a href="/privacy/" class="font-semibold text-[#0D3B66] hover:text-[#C2A34F]">Privacy Policy</a>.</span>
                            </label>
"""

COOKIE_SCRIPT = '<script src="/js/cookie-notice.js" defer></script>'


def footer_has_legal(footer: str) -> bool:
    return '/privacy/' in footer and '/cookies/' in footer and '/terms/' in footer


def ensure_legal_links(html: str) -> str:
    if '</footer>' not in html:
        return html

    # Only patch first footer
    before, rest = html.split('</footer>', 1)
    footer_start = before.rfind('<footer')
    if footer_start == -1:
        return html
    head = before[:footer_start]
    footer = before[footer_start:]
    if footer_has_legal(footer):
        return html

    # Prefer inserting before a Contact-ish link
    contact_re = re.compile(
        r'(<a href="(?:/#contact|#contact)"[^>]*>.*?</a>)',
        re.I,
    )
    if contact_re.search(footer):
        footer = contact_re.sub(LEGAL_LINKS + r'\n                    \1', footer, count=1)
    else:
        # Append inside first footer link flex group
        m = re.search(
            r'(<div class="flex flex-wrap gap-x-7 gap-y-2 text-\[#4B5563\]">)(.*?)(</div>)',
            footer,
            flags=re.S,
        )
        if m:
            footer = (
                footer[: m.start()]
                + m.group(1)
                + m.group(2)
                + '\n                    '
                + LEGAL_LINKS
                + '\n                '
                + m.group(3)
                + footer[m.end() :]
            )
        else:
            # Fallback: add a legal row before footer close content
            footer = footer.replace(
                '</div>\n        </div>\n    ',
                f'<div class="flex flex-wrap gap-x-7 gap-y-2 text-[#4B5563] mt-4">{LEGAL_LINKS}</div>\n            </div>\n        </div>\n    ',
                1,
            )

    return head + footer + '</footer>' + rest


def ensure_consent(html: str) -> str:
    if 'name="privacyConsent"' in html or 'id="contact-form"' not in html:
        return html
    if 'name="website"' in html:
        return html.replace(
            '<input type="text" name="website"',
            CONSENT_BLOCK + '\n                            <input type="text" name="website"',
            1,
        )
    return re.sub(
        r'(<button type="submit")',
        CONSENT_BLOCK + r'\n                            \1',
        html,
        count=1,
    )


def ensure_cookie_script(html: str) -> str:
    if 'cookie-notice.js' in html or '</body>' not in html:
        return html
    return html.replace('</body>', f'    {COOKIE_SCRIPT}\n</body>', 1)


def patch_file(path: Path) -> bool:
    original = path.read_text(encoding='utf-8')
    html = ensure_cookie_script(ensure_consent(ensure_legal_links(original)))
    if html != original:
        path.write_text(html, encoding='utf-8', newline='\n')
        return True
    return False


changed = []
for path in sorted(ROOT.rglob('*.html')):
    if patch_file(path):
        changed.append(str(path.relative_to(ROOT)))

print(f'Updated {len(changed)} files')
for c in changed:
    print(' -', c)
