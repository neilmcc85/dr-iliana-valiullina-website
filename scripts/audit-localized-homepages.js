const fs = require('fs');
const path = require('path');

const pages = ['ar', 'zh', 'fr', 'ru', 'es'];
const expected = { sections: 3, h2: 3, h3: 5, forms: 1, fields: 7, cards: 4 };
const count = (source, regex) => (source.match(regex) || []).length;
const hedge = /lower end of the proposed range|where fixed package prices are ready/;

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

  if (!source.includes('mailto:contact@drilianavaliullina.com')) {
    throw new Error(`${file}: missing contact email`);
  }

  if (hedge.test(source)) {
    throw new Error(`${file}: hedge copy still present`);
  }

  if (!source.includes('href="/lessons/"')) {
    throw new Error(`${file}: booking CTA should point to /lessons/`);
  }

  if (source.includes('CLIENT FEEDBACK') || source.includes('Leave feedback')) {
    throw new Error(`${file}: empty client feedback block should be hidden`);
  }

  if (!source.includes(`href="/${code}/academic/"`)) {
    throw new Error(`${file}: missing localized academic profile link`);
  }

  if (!fs.existsSync(path.join('public', code, 'academic', 'index.html'))) {
    throw new Error(`${file}: missing localized academic page`);
  }

  if (/I am an Associate Professor|Je suis[^<]*professeure associée et|Soy académica de derecho internacional, profesora asociada/.test(source)) {
    throw new Error(`${file}: stale present-tense CEUB appointment`);
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
