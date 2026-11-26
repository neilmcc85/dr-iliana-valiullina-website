const CONTACT_EMAIL = 'contact@drilianavaliullina.com';
const FROM_EMAIL = 'Dr. Iliana Valiullina <contact@drilianavaliullina.com>';
const MAX_FIELD_LENGTH = 2000;
const MIN_SUBMIT_MS = 3000;
const MAX_CLOCK_SKEW_MS = 2 * 60 * 1000;
const MAX_FORM_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const METADATA_LIMITS = {
    ip: 64,
    country: 8,
    userAgent: 300
};
const BLOCKED_EMAILS = [
    'devansh@designapp.in'
];
const BLOCKED_EMAIL_DOMAINS = [
    'designapp.in'
];
const SPAM_PHRASES = [
    'advertising',
    'android app',
    'app developer',
    'app development',
    'backlink',
    'backlinks',
    'business proposal',
    'connect better with their customers',
    'cost details',
    'custom software',
    'custom mobile app',
    'custom mobile apps',
    'development agency',
    'digital marketing',
    'domain authority',
    'google 1st page',
    'google first page',
    'guest post',
    'hire developers',
    'ios app',
    'lead generation',
    'marketing agency',
    'major search engines',
    'mobile app',
    'price seo packages',
    'price, seo packages',
    'rank higher',
    'ranking on google',
    'saas development',
    'seo',
    'seo offers',
    'seo packages',
    'search engine optimization',
    'share examples and cost details',
    'social media marketing',
    'software development',
    'sponsored post',
    'targeted visitors',
    'web design',
    'web designer',
    'website design',
    'website redesign',
    'website traffic'
];

const TELEGRAM_LINKS = {
    consultation:
        'https://cal.com/iliana-valiullina/free-15-minute-consultation?utm_source=telegram&utm_medium=bot&utm_campaign=start',
    website: 'https://drilianavaliullina.com/?utm_source=telegram&utm_medium=bot&utm_campaign=start'
};

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === '/api/contact') {
            return handleContactRequest(request, env);
        }

        if (url.pathname === '/api/telegram') {
            return handleTelegramWebhook(request, env);
        }

        if (isNotFoundDocument(url.pathname)) {
            return notFoundDocument(request, env);
        }

        return env.ASSETS.fetch(request);
    }
};

function isNotFoundDocument(pathname) {
    return pathname === '/404' || pathname === '/404/' || pathname === '/404.html';
}

function notFoundDocument(request, env) {
    // 404.html is a real asset at /404, so a direct fetch would be HTTP 200.
    // A missing path makes not_found_handling serve that page with HTTP 404.
    const missing = new URL(request.url);
    missing.pathname = '/__not-found__';
    missing.search = '';
    const method = request.method === 'HEAD' ? 'HEAD' : 'GET';
    return env.ASSETS.fetch(new Request(missing, { method }));
}

async function handleContactRequest(request, env) {
    if (request.method !== 'POST') {
        return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    if (!env.RESEND_API_KEY) {
        return jsonResponse({ error: 'Email service is not configured' }, 500);
    }

    let payload;
    try {
        payload = await request.json();
    } catch {
        return jsonResponse({ error: 'Invalid request' }, 400);
    }

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return jsonResponse({ error: 'Invalid request' }, 400);
    }

    if (isHoneypotTripped(payload) || isTooFastSubmission(payload)) {
        return jsonResponse({ ok: true });
    }

    const fullName = cleanField(payload.fullName);
    const email = cleanField(payload.email);
    const inquiryType = cleanField(payload.inquiryType || 'Website inquiry');
    const format = cleanField(payload.format || 'Not specified');
    const message = cleanField(payload.message);

    const privacyConsent = String(payload.privacyConsent || '').toLowerCase();
    if (!['yes', 'true', 'on', '1'].includes(privacyConsent)) {
        return jsonResponse({ error: 'Please accept the Privacy Policy to continue' }, 400);
    }

    if (!fullName || !isValidEmail(email) || !message) {
        return jsonResponse({ error: 'Please complete all required fields' }, 400);
    }

    if (isLikelySpam({ fullName, email, inquiryType, message })) {
        return jsonResponse({ ok: true });
    }

    const subject = `Website inquiry: ${inquiryType} from ${fullName}`;
    const metadata = readVisitorMetadata(request);
    const { text, html } = buildInquiryEmail({
        fullName,
        email,
        inquiryType,
        format,
        message,
        metadata
    });

    const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: FROM_EMAIL,
            to: [CONTACT_EMAIL],
            reply_to: email,
            subject,
            text,
            html
        })
    });

    if (!resendResponse.ok) {
        const details = await resendResponse.text();
        console.error('Resend error:', details);
        return jsonResponse({ error: 'Unable to send message' }, 502);
    }

    return jsonResponse({ ok: true });
}

async function handleTelegramWebhook(request, env) {
    if (request.method === 'GET') {
        return new Response('Telegram webhook endpoint is active.', {
            status: 200,
            headers: { 'Content-Type': 'text/plain' }
        });
    }

    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    if (!env.TELEGRAM_BOT_TOKEN) {
        console.error('Telegram webhook received but TELEGRAM_BOT_TOKEN is not configured.');
        return new Response('ok', { status: 200 });
    }

    if (
        env.TELEGRAM_WEBHOOK_SECRET &&
        request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.TELEGRAM_WEBHOOK_SECRET
    ) {
        return new Response('unauthorized', { status: 401 });
    }

    let update;
    try {
        update = await request.json();
    } catch {
        return new Response('ok', { status: 200 });
    }

    const message = update.message;
    if (!message?.text || !message.chat?.id) {
        return new Response('ok', { status: 200 });
    }

    const command = message.text.trim().split(/\s+/)[0].toLowerCase();

    if (command === '/start' || command === '/help' || command === '/book') {
        await sendTelegramMessage(env.TELEGRAM_BOT_TOKEN, message.chat.id, buildTelegramWelcomeMessage());
    }

    return new Response('ok', { status: 200 });
}

function buildTelegramWelcomeMessage() {
    return [
        '<b>Dr. Iliana Valiullina</b>',
        'Legal English · Academic English · International Law',
        '',
        'Online lessons for lawyers, academics, and professionals.',
        'Languages: English, Russian, Tatar, Bashkort.',
        '',
        '<b>Free 15-minute consultation</b> (intro call, not a full lesson):',
        `<a href="${TELEGRAM_LINKS.consultation}">Book on Cal.com</a>`,
        '',
        'Website:',
        `<a href="${TELEGRAM_LINKS.website}">drilianavaliullina.com</a>`
    ].join('\n');
}

async function sendTelegramMessage(token, chatId, text) {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
            disable_web_page_preview: false
        })
    });

    if (!response.ok) {
        const details = await response.text();
        console.error('Telegram sendMessage error:', details);
    }
}

function cleanField(value) {
    return String(value || '').trim().slice(0, MAX_FIELD_LENGTH);
}

function honeypotValue(payload, key) {
    return String(payload && payload[key] || '').trim();
}

function isHoneypotTripped(payload) {
    // `website` remains for any older client that still posts that field.
    // The live field is `leave_blank`, which is not an autofill token.
    return Boolean(honeypotValue(payload, 'leave_blank') || honeypotValue(payload, 'website'));
}

function isTooFastSubmission(payload, now = Date.now()) {
    const started = Number(payload && payload.formStartedAt);
    if (!Number.isFinite(started)) return true;
    const elapsed = now - started;
    if (elapsed < -MAX_CLOCK_SKEW_MS || elapsed > MAX_FORM_AGE_MS) return true;
    if (elapsed >= 0 && elapsed < MIN_SUBMIT_MS) return true;
    return false;
}

function sanitizeHeaderValue(value, maxLength) {
    return String(value == null ? '' : value)
        .replace(/[\u0000-\u001F\u007F\u2028\u2029]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxLength);
}

function readVisitorMetadata(request) {
    const headers = request && request.headers;
    const read = (name) => (headers && typeof headers.get === 'function' ? headers.get(name) : '');
    return {
        ip: sanitizeHeaderValue(read('CF-Connecting-IP'), METADATA_LIMITS.ip) || 'unknown',
        country: sanitizeHeaderValue(read('CF-IPCountry'), METADATA_LIMITS.country) || 'unknown',
        userAgent: sanitizeHeaderValue(read('User-Agent'), METADATA_LIMITS.userAgent) || 'unknown'
    };
}

function buildInquiryEmail({ fullName, email, inquiryType, format, message, metadata }) {
    const text = [
        `Name: ${fullName}`,
        `Email: ${email}`,
        `Inquiry type: ${inquiryType}`,
        `Preferred format: ${format}`,
        '',
        message,
        '',
        '---',
        'Technical metadata (spam prevention):',
        `IP: ${metadata.ip}`,
        `Country: ${metadata.country}`,
        `User-Agent: ${metadata.userAgent}`
    ].join('\n');

    const html = `
        <h2>New website inquiry</h2>
        <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Inquiry type:</strong> ${escapeHtml(inquiryType)}</p>
        <p><strong>Preferred format:</strong> ${escapeHtml(format)}</p>
        <hr>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
        <hr>
        <p><strong>Technical metadata (spam prevention)</strong><br>
        IP: ${escapeHtml(metadata.ip)}<br>
        Country: ${escapeHtml(metadata.country)}<br>
        User-Agent: ${escapeHtml(metadata.userAgent)}</p>
    `;

    return { text, html };
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isLikelySpam({ fullName, email, inquiryType, message }) {
    const combined = `${fullName} ${email} ${inquiryType} ${message}`.toLowerCase();
    const normalizedEmail = email.toLowerCase();
    const emailDomain = normalizedEmail.split('@')[1] || '';
    const linkCount = (combined.match(/https?:\/\//g) || []).length + (combined.match(/\bwww\./g) || []).length;
    const spamPhraseCount = SPAM_PHRASES.filter((phrase) => combined.includes(phrase)).length;

    if (BLOCKED_EMAILS.includes(normalizedEmail)) return true;
    if (BLOCKED_EMAIL_DOMAINS.includes(emailDomain)) return true;
    if (spamPhraseCount >= 1 && linkCount >= 1) return true;
    if (spamPhraseCount >= 2) return true;
    if (linkCount >= 3) return true;

    return false;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
        }
    });
}
