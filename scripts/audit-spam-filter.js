const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync('worker.js', 'utf8').replace('export default', 'const workerDefault =');
const context = { console, Response, fetch };
vm.createContext(context);
vm.runInContext(source, context);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const phraseCases = [
  {
    name: 'SEO cold pitch',
    expected: true,
    payload: {
      fullName: 'devansh kumar',
      email: 'devansh@designapp.in',
      inquiryType: 'General Inquiry',
      message:
        'S-E-O Offers. Your website is not ranking on Google. We can place your website on Google 1st page. May I send you a Price, SEO Packages?'
    }
  },
  {
    name: 'mobile app cold pitch',
    expected: true,
    payload: {
      fullName: 'Rober thenry',
      email: 'rober@example.com',
      inquiryType: 'General Inquiry',
      message:
        'I build custom mobile apps to help businesses connect better with their customers. Reply and I will share examples and cost details.'
    }
  },
  {
    name: 'legitimate language inquiry',
    expected: false,
    payload: {
      fullName: 'Maria Ivanova',
      email: 'maria@example.com',
      inquiryType: 'Language Lessons Inquiry',
      message:
        'Hello, I would like to book Russian for Lawyers lessons. I am interested in legal terminology and contract language.'
    }
  }
];

for (const testCase of phraseCases) {
  const actual = context.isLikelySpam(testCase.payload);
  if (actual !== testCase.expected) {
    throw new Error(`${testCase.name}: expected ${testCase.expected}, received ${actual}`);
  }
  console.log(`${testCase.name}: ${actual ? 'blocked' : 'allowed'}`);
}

assert(context.isHoneypotTripped({ leave_blank: 'filled by a bot' }), 'filled leave_blank honeypot must trip');
assert(context.isHoneypotTripped({ website: 'http://spam.example' }), 'legacy website honeypot must still trip');
assert(!context.isHoneypotTripped({ leave_blank: '   ', website: '' }), 'blank honeypot must not trip');
assert(!context.isHoneypotTripped({}), 'missing honeypot must not trip');
console.log('honeypot checks: ok');

const now = 1_700_000_000_000;
assert(context.isTooFastSubmission({ formStartedAt: now - 1000 }, now), '1s submit must be too fast');
assert(!context.isTooFastSubmission({ formStartedAt: now - 3000 }, now), '3s submit must be allowed');
assert(context.isTooFastSubmission({}, now), 'missing formStartedAt must be rejected');
assert(context.isTooFastSubmission({ formStartedAt: 'not-a-time' }, now), 'invalid formStartedAt must be rejected');
assert(
  !context.isTooFastSubmission({ formStartedAt: now + 30_000 }, now),
  'clock 30s ahead must still be allowed'
);
assert(
  context.isTooFastSubmission({ formStartedAt: now + 3 * 60 * 1000 }, now),
  'timestamp more than 2 minutes ahead must be rejected'
);
assert(
  context.isTooFastSubmission({ formStartedAt: now - 8 * 24 * 60 * 60 * 1000 }, now),
  'timestamp older than 7 days must be rejected'
);
console.log('submit-time checks: ok');

const hostileAgent = 'Mozilla/5.0\r\nBcc: evil@example.com\u2028</p><script>alert(1)</script>';
const sanitizedAgent = context.sanitizeHeaderValue(hostileAgent, 300);
assert(!/[\r\n\u2028\u2029]/.test(sanitizedAgent), 'sanitized header must be a single line');
assert(sanitizedAgent.includes('<script>'), 'plain-text sanitizer keeps angle brackets for later HTML escaping');
assert(context.sanitizeHeaderValue(` ${'A'.repeat(400)} `, 64).length === 64, 'header values must be truncated');
assert(context.sanitizeHeaderValue('\r\n\t', 32) === '', 'control-only headers collapse to empty');
console.log('header sanitizing: ok');

const metadata = context.readVisitorMetadata({
  headers: {
    get(name) {
      const values = {
        'CF-Connecting-IP': '203.0.113.10\r\nBcc: evil@example.com',
        'CF-IPCountry': 'BR<script>',
        'User-Agent': hostileAgent
      };
      return values[name] || null;
    }
  }
});
assert(metadata.ip === '203.0.113.10 Bcc: evil@example.com', 'IP must be single-line');
assert(!metadata.ip.includes('\n') && !metadata.ip.includes('\r'), 'IP must not contain newlines');
assert(metadata.country === 'BR<scrip', 'country must be truncated to 8 characters');
assert(metadata.country.length <= 8, 'country length cap');

const built = context.buildInquiryEmail({
  fullName: 'Maria Ivanova',
  email: 'maria@example.com',
  inquiryType: 'Language Lessons',
  format: 'Online',
  message: 'Hello from a real student.',
  metadata
});
assert(built.text.endsWith(`User-Agent: ${metadata.userAgent}`), 'metadata footer must be at the bottom of the text email');
assert(built.text.includes('IP: 203.0.113.10 Bcc: evil@example.com'), 'text email must include the sanitized IP');
assert(built.text.includes('Country: BR<scrip'), 'text email must include the sanitized country');
assert(!built.text.includes('\r'), 'text email must not contain CR from headers');
assert(!built.html.includes('<script>'), 'HTML email must not include raw script markup from headers');
assert(built.html.includes('&lt;script&gt;'), 'HTML email must escape header markup');
assert(built.html.includes('Technical metadata (spam prevention)'), 'HTML email must include the metadata footer');
assert(
  built.html.indexOf('Hello from a real student.') < built.html.lastIndexOf('Technical metadata'),
  'HTML metadata must come after the message'
);
const unknown = context.readVisitorMetadata({ headers: { get() { return null; } } });
assert(unknown.ip === 'unknown' && unknown.country === 'unknown' && unknown.userAgent === 'unknown', 'missing headers use unknown');
console.log('metadata footer: ok');

const resendCalls = [];
context.fetch = async (url, options) => {
  resendCalls.push({ url, body: JSON.parse(options.body) });
  return { ok: true, async text() { return ''; } };
};

function formRequest(payload, headerMap = {}) {
  const lower = Object.fromEntries(Object.entries(headerMap).map(([key, value]) => [key.toLowerCase(), value]));
  return {
    method: 'POST',
    headers: {
      get(name) {
        return Object.prototype.hasOwnProperty.call(lower, String(name).toLowerCase())
          ? lower[String(name).toLowerCase()]
          : null;
      }
    },
    async json() {
      return payload;
    }
  };
}

function legitimatePayload(overrides = {}) {
  return {
    fullName: 'Maria Ivanova',
    email: 'maria@example.com',
    inquiryType: 'Language Lessons',
    format: 'Online',
    message: 'I would like to book Russian for Lawyers lessons.',
    privacyConsent: 'yes',
    website: '',
    formStartedAt: Date.now() - 10_000,
    ...overrides
  };
}

async function post(payload, headerMap) {
  const response = await context.handleContactRequest(formRequest(payload, headerMap), {
    RESEND_API_KEY: 'test-key'
  });
  return { status: response.status, body: await response.json() };
}

(async () => {
  const honeypot = await post(legitimatePayload({ leave_blank: 'https://spam.example' }));
  assert(honeypot.status === 200 && honeypot.body.ok === true, 'honeypot must be a silent success');
  assert(resendCalls.length === 0, 'honeypot must not send email');

  const tooFast = await post(legitimatePayload({ formStartedAt: Date.now() }));
  assert(tooFast.status === 200 && tooFast.body.ok === true, 'instant submit must be a silent success');
  assert(resendCalls.length === 0, 'instant submit must not send email');

  const directProbe = await post({
    fullName: 'Attacker',
    email: 'a@b.co',
    inquiryType: 'General Inquiry',
    message: 'probe',
    privacyConsent: 'yes'
  });
  assert(directProbe.status === 200 && directProbe.body.ok === true, 'direct probe without formStartedAt must be a silent success');
  assert(resendCalls.length === 0, 'direct probe must not send email');

  const missingConsent = await post(legitimatePayload({ privacyConsent: '' }));
  assert(missingConsent.status === 400, 'missing privacy consent stays a 400');
  assert(resendCalls.length === 0, 'invalid consent must not send email');

  const phraseSpam = await post(legitimatePayload({
    fullName: 'devansh kumar',
    email: 'devansh@designapp.in',
    message: 'SEO packages and a https://spam.example link'
  }));
  assert(phraseSpam.status === 200 && phraseSpam.body.ok === true, 'phrase spam stays a silent success');
  assert(resendCalls.length === 0, 'phrase spam must not send email');

  const sent = await post(legitimatePayload(), {
    'CF-Connecting-IP': '203.0.113.44\r\nBcc: evil@example.com',
    'CF-IPCountry': 'GB',
    'User-Agent': hostileAgent
  });
  assert(sent.status === 200 && sent.body.ok === true, 'slow legitimate inquiry must succeed');
  assert(resendCalls.length === 1, 'legitimate inquiry must send one email');
  const email = resendCalls[0].body;
  assert(email.to[0] === 'contact@drilianavaliullina.com', 'inquiry email must go to the contact address');
  assert(email.reply_to === 'maria@example.com', 'reply-to stays the visitor email');
  assert(!email.subject.includes('203.0.113.44'), 'metadata must not be copied into the subject header');
  assert(!email.subject.includes('\n') && !email.subject.includes('\r'), 'subject must stay a single line');
  assert(email.text.includes('IP: 203.0.113.44 Bcc: evil@example.com'), 'sent text must include the sanitized IP');
  assert(email.text.includes('Country: GB'), 'sent text must include the country');
  assert(email.text.trim().endsWith('User-Agent: Mozilla/5.0 Bcc: evil@example.com </p>&lt;script&gt;alert(1)&lt;/script&gt;') === false, 'text footer is not HTML-escaped');
  assert(email.text.includes('User-Agent: Mozilla/5.0 Bcc: evil@example.com </p><script>alert(1)</script>'), 'sent text must keep a single-line user agent');
  assert(!email.text.includes('\r'), 'sent text must not contain header CR');
  assert(!email.html.includes('<script>'), 'sent HTML must not contain raw script from the user agent');
  assert(email.html.includes('&lt;/script&gt;'), 'sent HTML must escape the user agent');
  assert(
    email.text.indexOf('I would like to book Russian for Lawyers lessons.') < email.text.indexOf('Technical metadata (spam prevention):'),
    'metadata footer must follow the message'
  );
  console.log('contact handler: ok');

  const homePages = [
    'public/index.html',
    'public/ar/index.html',
    'public/zh/index.html',
    'public/fr/index.html',
    'public/ru/index.html',
    'public/es/index.html'
  ];
  const honeypotMarkup = /<div class="contact-honeypot" aria-hidden="true">\s*<label for="hp-leave-blank">Leave blank<\/label>\s*<input type="text" id="hp-leave-blank" name="leave_blank" tabindex="-1" autocomplete="off" data-1p-ignore="true" data-lpignore="true" data-bwignore="true">\s*<\/div>/;
  for (const file of homePages) {
    const html = fs.readFileSync(file, 'utf8');
    assert(honeypotMarkup.test(html), `${file}: honeypot must be accessible-hidden with tabindex and autocomplete off`);
    assert(html.includes('const formStartedAt = Date.now();'), `${file}: form timer must start when the form is set up`);
    assert(html.includes('payload.formStartedAt = formStartedAt;'), `${file}: submit payload must include formStartedAt`);
    assert(!html.includes('name="website"'), `${file}: honeypot must not use an autofill name`);
    assert(!html.includes('contact-company'), `${file}: honeypot must not use a company id`);
    assert(!html.includes('>Company<'), `${file}: honeypot must not be labeled Company`);
  }
  console.log('contact form markup: ok');

  const privacyPages = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'index.html' && path.basename(dir) === 'privacy') privacyPages.push(full);
    }
  }
  walk('public');
  assert(privacyPages.length >= 1, 'at least the English privacy page must exist');
  for (const file of privacyPages) {
    const html = fs.readFileSync(file, 'utf8');
    assert(
      html.includes('Basic technical metadata (such as IP address) is logged for spam prevention.'),
      `${file}: privacy page must note metadata logged for spam prevention`
    );
  }
  console.log(`privacy note: ok (${privacyPages.length} page${privacyPages.length === 1 ? '' : 's'})`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
