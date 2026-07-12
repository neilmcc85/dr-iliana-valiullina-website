const fs = require('fs');
const path = require('path');

const pages = ['ar', 'zh', 'fr', 'ru', 'es'];
const expected = { sections: 6, h2: 6, h3: 10, forms: 1, fields: 6, cards: 4 };
const count = (source, regex) => (source.match(regex) || []).length;

for (const code of pages) {
  const file = `public/${code}/index.html`;
  const source = fs.readFileSync(file, 'utf8');
  const main = (source.match(/<main[\s\S]*?<\/main>/) || [''])[0];
  const actual = {
    sections: count(main, /<section/g),
    h2: count(main, /<h2/g),
    h3: count(main, /<h3/g),
    forms: count(main, /<form/g),
    fields: count(main, /<input|<textarea|<select/g),
    cards: count(main, /service-card/g),
  };

  for (const [key, value] of Object.entries(expected)) {
    if (actual[key] !== value) {
      throw new Error(`${file}: expected ${value} ${key}, found ${actual[key]}`);
    }
  }

  if (code === 'ru' && !source.includes('Иляна Валиуллина')) {
    throw new Error('Russian homepage is missing the corrected spelling Иляна Валиуллина');
  }

  const hrefs = [...source.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  for (const href of hrefs) {
    if (href.startsWith(`/${code}/`) && !href.includes('#')) {
      const target = path.join('public', href.replace(/^\//, '').replace(/\/$/, '/index.html'));
      if (!fs.existsSync(target)) {
        throw new Error(`${file}: broken localized link ${href}`);
      }
    }
  }

  console.log(`${file} ok`, actual);
}
