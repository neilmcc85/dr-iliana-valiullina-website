(() => {
    const STORAGE_KEY = 'cookie-notice-ack';
    try {
        if (localStorage.getItem(STORAGE_KEY) === '1') return;
    } catch {
        /* continue and show notice */
    }

    const bar = document.createElement('div');
    bar.id = 'cookie-notice';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-live', 'polite');
    bar.setAttribute('aria-label', 'Cookie notice');
    bar.style.cssText = [
        'position:fixed',
        'left:0',
        'right:0',
        'bottom:0',
        'z-index:60',
        'padding:14px 16px',
        'background:#0D3B66',
        'color:#F8F7F4',
        'box-shadow:0 -8px 24px rgba(13,59,102,0.18)'
    ].join(';');

    bar.innerHTML = `
        <div style="max-width:72rem;margin:0 auto;display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;justify-content:space-between;font-size:13px;line-height:1.45;">
            <p style="margin:0;max-width:48rem;">
                This site uses essential storage (theme preference) and may load third-party tools for fonts and booking.
                We do not use advertising trackers on this website.
                See the <a href="/cookies/" style="color:#F8E9B8;text-decoration:underline;">Cookie Policy</a>
                and <a href="/privacy/" style="color:#F8E9B8;text-decoration:underline;">Privacy Policy</a>.
            </p>
            <button type="button" id="cookie-notice-ack"
                style="flex-shrink:0;border:0;border-radius:999px;background:#C2A34F;color:#0D3B66;font-weight:600;padding:10px 18px;cursor:pointer;">
                Got it
            </button>
        </div>
    `;

    const mount = () => {
        document.body.appendChild(bar);
        document.getElementById('cookie-notice-ack')?.addEventListener('click', () => {
            try {
                localStorage.setItem(STORAGE_KEY, '1');
            } catch {}
            bar.remove();
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mount);
    } else {
        mount();
    }
})();
