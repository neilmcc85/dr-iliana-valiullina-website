const CONTACT_EMAIL = 'contact@drilianavaliullina.com';
const FROM_EMAIL = 'Dr. Iliana Valiullina <contact@drilianavaliullina.com>';
const MAX_FIELD_LENGTH = 2000;
const SPAM_PHRASES = [
    'advertising',
    'android app',
    'app developer',
    'app development',
    'backlink',
    'backlinks',
    'business proposal',
    'custom software',
    'development agency',
    'digital marketing',
    'domain authority',
    'guest post',
    'hire developers',
    'ios app',
    'lead generation',
    'marketing agency',
    'mobile app',
    'rank higher',
    'ranking on google',
    'saas development',
    'seo',
    'search engine optimization',
    'social media marketing',
    'software development',
    'sponsored post',
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

        return env.ASSETS.fetch(request);
    }
};

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

    if (payload.website) {
        return jsonResponse({ ok: true });
    }

    const fullName = cleanField(payload.fullName);
    const email = cleanField(payload.email);
    const inquiryType = cleanField(payload.inquiryType || 'Website inquiry');
    const format = cleanField(payload.format || 'Not specified');
    const message = cleanField(payload.message);

    if (!fullName || !isValidEmail(email) || !message) {
        return jsonResponse({ error: 'Please complete all required fields' }, 400);
    }

    if (isLikelySpam({ fullName, email, inquiryType, message })) {
        return jsonResponse({ ok: true });
    }

    const subject = `Website inquiry: ${inquiryType} from ${fullName}`;
    const text = [
        `Name: ${fullName}`,
        `Email: ${email}`,
        `Inquiry type: ${inquiryType}`,
        `Preferred format: ${format}`,
        '',
        message
    ].join('\n');

    const html = `
        <h2>New website inquiry</h2>
        <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Inquiry type:</strong> ${escapeHtml(inquiryType)}</p>
        <p><strong>Preferred format:</strong> ${escapeHtml(format)}</p>
        <hr>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    `;

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

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isLikelySpam({ fullName, email, inquiryType, message }) {
    const combined = `${fullName} ${email} ${inquiryType} ${message}`.toLowerCase();
    const linkCount = (combined.match(/https?:\/\//g) || []).length + (combined.match(/\bwww\./g) || []).length;
    const spamPhraseCount = SPAM_PHRASES.filter((phrase) => combined.includes(phrase)).length;

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
