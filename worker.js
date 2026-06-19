const CONTACT_EMAIL = 'contact@drilianavaliullina.com';
const FROM_EMAIL = 'Dr. Iliana Valiullina <contact@drilianavaliullina.com>';
const MAX_FIELD_LENGTH = 2000;

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === '/api/contact') {
            return handleContactRequest(request, env);
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

function cleanField(value) {
    return String(value || '').trim().slice(0, MAX_FIELD_LENGTH);
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
