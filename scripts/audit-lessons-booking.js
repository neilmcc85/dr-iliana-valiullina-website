/**
 * /lessons/ must embed only the free consultation.
 * Paid Cal.com event types stay reachable from /language-lessons/.
 * English Cal.com event prices must match live Cal.com; Russian/coaching stay as published.
 */
const fs = require('fs');
const path = require('path');

const paidEvents = [
  'legal-english-lesson',
  'academic',
  'language-lesson',
  '5-lesson-legal-english-package',
  '5-lesson-academic-english-package',
  '5-lesson-language-package',
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
assert(
  (lessons.match(/iliana-valiullina\/[a-z0-9-]+/g) || []).every((match) =>
    match === 'iliana-valiullina/free-15-minute-consultation'
  ),
  'public/lessons/index.html: must not embed or link other Cal.com event types'
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
  lessons.includes('Legal English $100 / 60 min'),
  'public/lessons/index.html: Legal English must show the live Cal.com price $100'
);
assert(
  !lessons.includes('Legal English $120'),
  'public/lessons/index.html: leftover Legal English $120'
);

const prices = fs.readFileSync(path.join('public', 'language-lessons', 'index.html'), 'utf8');
for (const slug of paidEvents) {
  assert(
    prices.includes(`https://cal.com/iliana-valiullina/${slug}`),
    `public/language-lessons/index.html: missing Cal.com link for ${slug}`
  );
}

assert(prices.includes('>Legal English</div>\n                            <div class="mt-2 text-2xl font-semibold">$100</div>'), 'public/language-lessons/index.html: Legal English must be $100');
assert(prices.includes('>Academic English</div>\n                            <div class="mt-2 text-2xl font-semibold text-[#0D3B66]">$85</div>'), 'public/language-lessons/index.html: Academic English must be $85');
assert(prices.includes('>Professional language</div>\n                            <div class="mt-2 text-2xl font-semibold text-[#0D3B66]">$80</div>'), 'public/language-lessons/index.html: Professional language must be $80');
assert(prices.includes('LEGAL ENGLISH</div>\n                        <h3 class="mt-3 text-2xl font-semibold">Packages</h3>\n                        <dl class="mt-5 space-y-3 text-sm">\n                            <div class="flex items-center justify-between gap-4"><dt class="text-white/80">5 lessons</dt><dd class="font-semibold">$440</dd></div>'), 'public/language-lessons/index.html: Legal English 5-pack must be $440');
assert(prices.includes('ACADEMIC ENGLISH</div>\n                        <h3 class="mt-3 text-2xl font-semibold text-[#0D3B66]">Packages</h3>\n                        <dl class="mt-5 space-y-3 text-sm">\n                            <div class="flex items-center justify-between gap-4"><dt class="text-[#4B5563]">5 lessons</dt><dd class="font-semibold text-[#0D3B66]">$390</dd></div>'), 'public/language-lessons/index.html: Academic English 5-pack must be $390');
assert(prices.includes('PROFESSIONAL LANGUAGE</div>\n                        <h3 class="mt-3 text-2xl font-semibold text-[#0D3B66]">Packages</h3>\n                        <dl class="mt-5 space-y-3 text-sm">\n                            <div class="flex items-center justify-between gap-4"><dt class="text-[#4B5563]">5 lessons</dt><dd class="font-semibold text-[#0D3B66]">$360</dd></div>'), 'public/language-lessons/index.html: Professional language 5-pack must be $360');

assert(prices.includes('>Russian for Lawyers</h2>') || prices.includes('>Russian for Lawyers</div>'), 'public/language-lessons/index.html: Russian for Lawyers must remain');
assert(prices.includes('>Russian for Lawyers</div>\n                            <div class="mt-2 text-2xl font-semibold">$120</div>'), 'public/language-lessons/index.html: Russian for Lawyers $120 must stay');
assert(prices.includes('RUSSIAN FOR LAWYERS</div>\n                        <h3 class="mt-3 text-2xl font-semibold">Legal Russian Packages</h3>\n                        <dl class="mt-5 space-y-3 text-sm">\n                            <div class="flex items-center justify-between gap-4"><dt class="text-white/80">5 lessons</dt><dd class="font-semibold">$550</dd></div>'), 'public/language-lessons/index.html: Russian for Lawyers 5-pack $550 must stay');
assert(prices.includes('>Academic coaching</div>\n                            <div class="mt-2 text-2xl font-semibold text-[#0D3B66]">$150</div>'), 'public/language-lessons/index.html: academic coaching $150 must stay');

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
assert(home.includes('Legal English is $100 per 60-minute lesson'), 'public/index.html: homepage must show Legal English $100');
assert(home.includes('Academic English is $85'), 'public/index.html: homepage must show Academic English $85');
assert(home.includes('Professional language is $80'), 'public/index.html: homepage must show Professional language $80');
assert(home.includes('Russian for Lawyers is $120'), 'public/index.html: homepage must keep Russian for Lawyers $120');
assert(home.includes('Book a free 15-minute consult'), 'public/index.html: primary CTA should use the shorter consult label');
assert((home.match(/<header[\s\S]*?btn-primary[\s\S]*?<\/header>/) || []).length === 1, 'public/index.html: hero should keep one primary CTA');
assert(home.includes('Russian for Lawyers · from $120/60min'), 'public/index.html: featured chip must use listed Russian for Lawyers price');
assert(home.includes('Legal English $100/60min'), 'public/index.html: Legal English chip must be $100');
assert(home.includes('Academic English $85'), 'public/index.html: Academic English chip must be $85');
assert(home.includes('Professional language $80'), 'public/index.html: Professional language chip must be $80');
assert(home.includes('Russian for Business $90'), 'public/index.html: Russian for Business chip must be $90');
assert(home.includes('General Russian $60'), 'public/index.html: General Russian chip must be $60');
assert(home.includes('nav-secondary'), 'public/index.html: secondary nav should be visually grouped');
assert(!home.includes('Legal English and Russian for Lawyers are $120'), 'public/index.html: leftover combined $120 English/Russian price line');

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
for (const file of homePages) {
  const html = fs.readFileSync(file, 'utf8');
  const hrefs = chipHrefs(html);
  assert(hrefs.length === homepageChipSlugs.length, `${file}: expected ${homepageChipSlugs.length} lesson chips, found ${hrefs.length}`);
  homepageChipSlugs.forEach((slug, index) => {
    assert(hrefs[index] === calHref(slug, 'homepage'), `${file}: chip ${index + 1} must link to ${slug}`);
  });
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
  if (file === 'public/language-lessons/index.html') {
    assertCardLink(html, '>GENERAL RUSSIAN</div>', '5-lesson-general-russian-package', file);
    assertCardLink(html, '>Legal Russian Packages</h3>', '5-lesson-legal-russian-package', file);
  } else {
    assertCardLink(html, '>General Russian</div>', '5-lesson-general-russian-package', file);
    assertCardLink(html, '>Russian for Lawyers</div>', '5-lesson-legal-russian-package', file);
  }
}

console.log('audit-lessons-booking.js ok');
