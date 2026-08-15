/**
 * Point locale book CTAs to EN /lessons/
 * (the only page with a working Cal.com embed).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'public');
const locales = ['ar', 'zh', 'fr', 'ru', 'es'];

const lessonsNote = {
  ar: '                    <p class="mt-4 text-sm text-[#6B7280]">التقويم والحجز متوفران باللغة الإنجليزية على <a href="/lessons/" class="font-semibold text-[#0D3B66] hover:text-[#C2A34F]">صفحة الحجز</a>.</p>',
  zh: '                    <p class="mt-4 text-sm text-[#6B7280]">预约日历为英文页面：请前往 <a href="/lessons/" class="font-semibold text-[#0D3B66] hover:text-[#C2A34F]">预约页</a>。</p>',
  fr: '                    <p class="mt-4 text-sm text-[#6B7280]">Le calendrier de réservation est en anglais : <a href="/lessons/" class="font-semibold text-[#0D3B66] hover:text-[#C2A34F]">ouvrir la page de réservation</a>.</p>',
  ru: '                    <p class="mt-4 text-sm text-[#6B7280]">Календарь записи на английском: <a href="/lessons/" class="font-semibold text-[#0D3B66] hover:text-[#C2A34F]">открыть страницу записи</a>.</p>',
  es: '                    <p class="mt-4 text-sm text-[#6B7280]">El calendario de reserva está en inglés: <a href="/lessons/" class="font-semibold text-[#0D3B66] hover:text-[#C2A34F]">abrir la página de reserva</a>.</p>',
};

let changed = 0;

function writeIfChanged(filePath, before, after, label) {
  if (before === after) {
    console.warn('no change:', label);
    return;
  }
  fs.writeFileSync(filePath, after, 'utf8');
  changed += 1;
  console.log('updated', label);
}

for (const lang of locales) {
  const homePath = path.join(root, lang, 'index.html');
  const home = fs.readFileSync(homePath, 'utf8');
  if (!home.includes('href="/lessons/"')) {
    console.warn('homepage missing /lessons/ CTA:', lang);
  }

  const pages = [
    'lessons',
    'language-lessons',
    'academic-coaching',
    'online-intensive-programmes',
    'online-courses-russian-law',
  ];

  for (const page of pages) {
    const filePath = path.join(root, lang, page, 'index.html');
    if (!fs.existsSync(filePath)) continue;
    const before = fs.readFileSync(filePath, 'utf8');
    let html = before;

    const bookBtn = `href="/${lang}/lessons/" class="inline-flex px-7 py-3.5 rounded-2xl bg-[#0D3B66]`;
    const bookBtnFixed = `href="/lessons/" class="inline-flex px-7 py-3.5 rounded-2xl bg-[#0D3B66]`;
    if (!html.includes(bookBtn) && !html.includes(bookBtnFixed)) {
      console.warn('book button missing:', `${lang}/${page}`);
    }
    html = html.split(bookBtn).join(bookBtnFixed);

    if (page === 'lessons') {
      const note = lessonsNote[lang];
      if (!html.includes('data-booking-en-note')) {
        const marker = '<div class="mt-8 flex flex-wrap gap-4">';
        const start = html.indexOf(marker);
        if (start !== -1) {
          let depth = 0;
          let i = start;
          let end = -1;
          while (i < html.length) {
            if (html.startsWith('<div', i)) {
              depth += 1;
              i = html.indexOf('>', i) + 1;
              continue;
            }
            if (html.startsWith('</div>', i)) {
              depth -= 1;
              if (depth === 0) {
                end = i + 6;
                break;
              }
              i += 6;
              continue;
            }
            i += 1;
          }
          if (end !== -1) {
            html =
              html.slice(0, end) +
              `\n                    ${note.replace('<p class="mt-4', '<p data-booking-en-note class="mt-4')}` +
              html.slice(end);
          }
        }
      }
    }

    writeIfChanged(filePath, before, html, `${lang}/${page}/index.html`);
  }
}

console.log(`done, ${changed} files changed`);
