/**
 * /lessons/ embeds only the free consultation.
 * A direct button may link to the $75 / 60-minute Legal English lesson on Cal.com.
 * /language-lessons/ lists single 60-minute lessons only. Package events are not linked.
 * English Cal.com event prices must match live Cal.com; Russian/coaching stay as published.
 */
const fs = require('fs');
const path = require('path');

const singleLessonEvents = [
  'legal-english-lesson',
  'academic',
  'language-lesson',
  'general-russian',
  'russian-for-business',
  'russian-for-lawyers',
  'russian-legal-terminology',
];

const removedPackageEvents = [
  '5-lesson-legal-english-package',
  '5-lesson-academic-english-package',
  '5-lesson-language-package',
  '5-lesson-general-russian-package',
  '5-lesson-legal-russian-package',
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const lessons = fs.readFileSync(path.join('public', 'lessons', 'index.html'), 'utf8');

assert(!lessons.includes('booking-picker'), 'public/lessons/index.html: event picker must be removed');
assert(!lessons.includes('BOOKING_OPTIONS'), 'public/lessons/index.html: BOOKING_OPTIONS must be removed');
assert(!lessons.includes('data-booking-option'), 'public/lessons/index.html: picker buttons must be removed');
assert(
  lessons.includes("calLink: 'iliana-valiullina/free-15-minute-consultation'"),
  'public/lessons/index.html: embed must point at the free consultation event'
);
const lessonsCalLinks = lessons.match(/iliana-valiullina\/[a-z0-9-]+/g) || [];
const allowedLessonsCal = new Set([
  'iliana-valiullina/free-15-minute-consultation',
  'iliana-valiullina/legal-english-lesson',
]);
assert(
  lessonsCalLinks.length > 0 && lessonsCalLinks.every((match) => allowedLessonsCal.has(match)),
  'public/lessons/index.html: only the free consultation and the Legal English lesson may use Cal.com'
);
assert(
  (lessons.match(/calLink:\s*'iliana-valiullina\/[^']+'/g) || []).join('\n') ===
    "calLink: 'iliana-valiullina/free-15-minute-consultation'",
  'public/lessons/index.html: the embed must stay on the free consultation'
);
assert(
  (lessons.match(/href="https:\/\/cal\.com\/iliana-valiullina\/legal-english-lesson"/g) || []).length === 1,
  'public/lessons/index.html: Legal English booking button must link directly to the Cal.com event'
);
assert(
  lessons.includes('Book Legal English') && lessons.includes('$75 / 60 min') && lessons.includes('$75 / 60 minutes'),
  'public/lessons/index.html: Legal English booking CTA must show $75 / 60 minutes'
);
assert(lessons.includes('href="/language-lessons/"'), 'public/lessons/index.html: See all prices must stay');
assert(
  lessons.includes('education and language training, not legal advice'),
  'public/lessons/index.html: education disclaimer must stay'
);
assert(
  lessons.includes('contact@drilianavaliullina.com'),
  'public/lessons/index.html: contact email must stay'
);
assert(
  lessons.includes('Legal English $75 / 60 min'),
  'public/lessons/index.html: Legal English must show the live Cal.com price $75'
);
assert(
  !lessons.includes('Legal English $120'),
  'public/lessons/index.html: leftover Legal English $120'
);

const prices = fs.readFileSync(path.join('public', 'language-lessons', 'index.html'), 'utf8');
for (const slug of singleLessonEvents) {
  assert(
    prices.includes(`https://cal.com/iliana-valiullina/${slug}`),
    `public/language-lessons/index.html: missing Cal.com link for ${slug}`
  );
}

assert(prices.includes('>Legal English</div>\n                            <div class="mt-2 text-2xl font-semibold">$75</div>'), 'public/language-lessons/index.html: Legal English must be $75');
assert(prices.includes('>Academic English</div>\n                            <div class="mt-2 text-2xl font-semibold text-[#0D3B66]">$85</div>'), 'public/language-lessons/index.html: Academic English must be $85');
assert(prices.includes('>Professional language</div>\n                            <div class="mt-2 text-2xl font-semibold text-[#0D3B66]">$80</div>'), 'public/language-lessons/index.html: Professional language must be $80');
assert(prices.includes('>General Russian</div>\n                            <div class="mt-2 text-2xl font-semibold text-[#0D3B66]">$60</div>'), 'public/language-lessons/index.html: General Russian must be $60');
assert(prices.includes('>Russian for Business</div>\n                            <div class="mt-2 text-2xl font-semibold text-[#0D3B66]">$90</div>'), 'public/language-lessons/index.html: Russian for Business must be $90');
assert(prices.includes('>Russian for Lawyers</h2>') || prices.includes('>Russian for Lawyers</div>'), 'public/language-lessons/index.html: Russian for Lawyers must remain');
assert(prices.includes('>Russian for Lawyers</div>\n                            <div class="mt-2 text-2xl font-semibold">$120</div>'), 'public/language-lessons/index.html: Russian for Lawyers $120 must stay');
assert(prices.includes('>Russian Legal Terminology</div>\n                            <div class="mt-2 text-2xl font-semibold text-[#0D3B66]">$150</div>'), 'public/language-lessons/index.html: Russian Legal Terminology must be $150');
assert(prices.includes('>Academic coaching</div>\n                            <div class="mt-2 text-2xl font-semibold text-[#0D3B66]">$150</div>'), 'public/language-lessons/index.html: academic coaching $150 must stay');
assert(prices.includes('Book a free 15-minute consultation'), 'public/language-lessons/index.html: free consultation CTA must stay');

const leftoverEnglish = [
  [/>Legal English<\/div>\s*<div class="mt-2 text-2xl font-semibold">\$120<\/div>/, 'Legal English $120'],
  [/LEGAL ENGLISH<\/div>[\s\S]{0,200}5 lessons<\/dt><dd class="font-semibold">\$550<\/dd>/, 'Legal English 5-pack $550'],
  [/>Academic English<\/div>\s*<div class="mt-2 text-2xl font-semibold text-\[#0D3B66\]">\$90<\/div>/, 'Academic English $90'],
  [/>Professional language<\/div>\s*<div class="mt-2 text-2xl font-semibold text-\[#0D3B66\]">\$90<\/div>/, 'Professional language $90'],
];
for (const [pattern, label] of leftoverEnglish) {
  assert(!pattern.test(prices), `public/language-lessons/index.html: leftover ${label}`);
}

const home = fs.readFileSync(path.join('public', 'index.html'), 'utf8');
assert(home.includes('Legal English is $75 per 60-minute lesson'), 'public/index.html: homepage must show Legal English $75');
assert(home.includes('Academic English is $85'), 'public/index.html: homepage must show Academic English $85');
assert(home.includes('Professional language is $80'), 'public/index.html: homepage must show Professional language $80');
assert(home.includes('Russian for Lawyers is $120'), 'public/index.html: homepage must keep Russian for Lawyers $120');
assert(home.includes('Book a free 15-minute consult'), 'public/index.html: primary CTA should use the shorter consult label');
assert((home.match(/<header[\s\S]*?btn-primary[\s\S]*?<\/header>/) || []).length === 1, 'public/index.html: hero should keep one primary CTA');
assert(home.includes('Russian for Lawyers · from $120/60min'), 'public/index.html: featured chip must use listed Russian for Lawyers price');
assert(home.includes('Legal English $75/60min'), 'public/index.html: Legal English chip must be $75');
assert(home.includes('Academic English $85'), 'public/index.html: Academic English chip must be $85');
assert(home.includes('Professional language $80'), 'public/index.html: Professional language chip must be $80');
assert(home.includes('Russian for Business $90'), 'public/index.html: Russian for Business chip must be $90');
assert(home.includes('General Russian $60'), 'public/index.html: General Russian chip must be $60');
assert(home.includes('nav-secondary'), 'public/index.html: secondary nav should be visually grouped');
assert(!home.includes('Legal English and Russian for Lawyers are $120'), 'public/index.html: leftover combined $120 English/Russian price line');

const staleLegalEnglishPrice = /\$100\b|100 \$|100 美元|100 دولاراً|"price": "100"/;

const lessonsPriceCopy = {
  'public/lessons/index.html': 'Legal English $75 / 60 min',
  'public/zh/lessons/index.html': '法律英语 75 美元 / 60 分钟',
  'public/fr/lessons/index.html': 'Anglais juridique 75 $ / 60 min',
  'public/es/lessons/index.html': 'Inglés jurídico 75 $ / 60 min',
  'public/ru/lessons/index.html': 'Юридический английский 75 $ / 60 мин',
  'public/ar/lessons/index.html': 'الإنجليزية القانونية 75 دولاراً / 60 دقيقة',
};

const englishLessonPages = [
  'public/lessons/index.html',
  'public/language-lessons/index.html',
  'public/zh/lessons/index.html',
  'public/fr/lessons/index.html',
  'public/es/lessons/index.html',
  'public/ru/lessons/index.html',
  'public/ar/lessons/index.html',
];
for (const file of englishLessonPages) {
  const source = fs.readFileSync(file, 'utf8');
  assert(!/Legal English \$120/.test(source), `${file}: leftover Legal English $120`);
  assert(!staleLegalEnglishPrice.test(source), `${file}: leftover Legal English price $100`);
  if (lessonsPriceCopy[file]) {
    assert(source.includes(lessonsPriceCopy[file]), `${file}: Legal English single lesson must be $75`);
  }
}

const homepageChipSlugs = [
  'russian-for-lawyers',
  'legal-english-lesson',
  'academic',
  'language-lesson',
  'russian-for-business',
  'general-russian',
];

function chipHrefs(html) {
  return [...html.matchAll(/<a href="([^"]+)" class="lesson-chip(?: lesson-chip-featured)?">/g)].map((match) => match[1]);
}

function calHref(slug, medium) {
  return `https://cal.com/iliana-valiullina/${slug}?utm_source=site&amp;utm_medium=${medium}&amp;utm_campaign=${slug}`;
}

const homePages = [
  'public/index.html',
  'public/ar/index.html',
  'public/zh/index.html',
  'public/fr/index.html',
  'public/ru/index.html',
  'public/es/index.html',
];
const homepageLegalEnglishPrice = {
  'public/index.html': ['Legal English $75/60min', 'Legal English is $75 per 60-minute lesson'],
  'public/fr/index.html': ['Anglais juridique 75 $/60 min', 'L’anglais juridique est à 75 $ la leçon de 60 minutes'],
  'public/es/index.html': ['Inglés jurídico 75 $/60 min', 'El inglés jurídico cuesta 75 $ por clase de 60 minutos'],
  'public/ru/index.html': ['Юридический английский 75 $/60 мин', 'Юридический английский — 75 $ за занятие 60 минут'],
  'public/zh/index.html': ['法律英语 75 美元/60分钟', '法律英语为每节 60 分钟 75 美元'],
  'public/ar/index.html': ['الإنجليزية القانونية 75 $/60 دقيقة', 'الإنجليزية القانونية بسعر 75 دولاراً للدرس الواحد (60 دقيقة)'],
};

for (const file of homePages) {
  const html = fs.readFileSync(file, 'utf8');
  const hrefs = chipHrefs(html);
  assert(hrefs.length === homepageChipSlugs.length, `${file}: expected ${homepageChipSlugs.length} lesson chips, found ${hrefs.length}`);
  homepageChipSlugs.forEach((slug, index) => {
    assert(hrefs[index] === calHref(slug, 'homepage'), `${file}: chip ${index + 1} must link to ${slug}`);
  });
  assert(
    /"price": "75",\s*"itemOffered":\s*\{\s*"@type": "Service",\s*"name": "Legal English Lesson"/.test(html),
    `${file}: Legal English JSON-LD price must be 75`
  );
  assert(!staleLegalEnglishPrice.test(html), `${file}: leftover Legal English price $100`);
  for (const snippet of homepageLegalEnglishPrice[file]) {
    assert(html.includes(snippet), `${file}: missing Legal English $75 copy: ${snippet}`);
  }
}

function assertCardLink(html, marker, slug, file) {
  const start = html.indexOf(marker);
  assert(start !== -1, `${file}: missing ${marker}`);
  const window = html.slice(start, start + 1400);
  assert(window.includes(calHref(slug, 'language-lessons')), `${file}: ${marker} must link to ${slug}`);
}

const languageLessonPages = [
  'public/language-lessons/index.html',
  'public/ar/language-lessons/index.html',
  'public/zh/language-lessons/index.html',
  'public/fr/language-lessons/index.html',
  'public/ru/language-lessons/index.html',
  'public/es/language-lessons/index.html',
];
for (const file of languageLessonPages) {
  const html = fs.readFileSync(file, 'utf8');
  assertCardLink(html, '>General Russian</div>', 'general-russian', file);
  assertCardLink(html, '>Russian for Business</div>', 'russian-for-business', file);
  assertCardLink(html, '>Russian for Lawyers</div>', 'russian-for-lawyers', file);
  assertCardLink(html, '>Russian Legal Terminology</div>', 'russian-legal-terminology', file);
  for (const slug of singleLessonEvents) {
    assert(html.includes(`https://cal.com/iliana-valiullina/${slug}`), `${file}: missing single-lesson Cal.com link for ${slug}`);
  }
  for (const slug of removedPackageEvents) {
    assert(!html.includes(slug), `${file}: package Cal.com link must be removed (${slug})`);
  }
  assert(!/5 · \$|10 · \$|20 · \$/.test(html), `${file}: package price lines must be removed`);
  assert(!/\b(5|10|20) lessons\b/i.test(html), `${file}: lesson package rows must be removed`);
  assert(html.includes('>Legal English</div>\n                            <div class="mt-2 text-2xl font-semibold">$75</div>'), `${file}: Legal English must be $75`);
  assert(!staleLegalEnglishPrice.test(html), `${file}: leftover Legal English price $100`);
  assert(html.includes('$75') && html.includes('$120') && html.includes('$150') && html.includes('$90') && html.includes('$60') && html.includes('$80') && html.includes('$85'), `${file}: single-lesson prices must stay`);
}

console.log('audit-lessons-booking.js ok');
