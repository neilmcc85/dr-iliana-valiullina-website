/**
 * /lessons/ must embed only the free consultation.
 * Paid Cal.com event types stay reachable from /language-lessons/.
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

const prices = fs.readFileSync(path.join('public', 'language-lessons', 'index.html'), 'utf8');
for (const slug of paidEvents) {
  assert(
    prices.includes(`https://cal.com/iliana-valiullina/${slug}`),
    `public/language-lessons/index.html: missing Cal.com link for ${slug}`
  );
}

const listedPrices = ['$120', '$90', '$150', '$60', '$550', '$420'];
for (const price of listedPrices) {
  assert(prices.includes(price), `public/language-lessons/index.html: missing listed price ${price}`);
}

console.log('audit-lessons-booking.js ok');
