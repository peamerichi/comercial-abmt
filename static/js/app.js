/* ABMT Commercial System - SPA Frontend v2 */

/* Lucide Icons - Inline SVG Helper */
const LI = (name, size = 16) => {
    const s = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"`;
    const icons = {
        'layout-dashboard': `<svg ${s}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
        'file-text': `<svg ${s}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
        'package': `<svg ${s}><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>`,
        'users': `<svg ${s}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        'bell': `<svg ${s}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
        'sticky-note': `<svg ${s}><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/></svg>`,
        'wallet': `<svg ${s}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`,
        'settings': `<svg ${s}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
        'trending-up': `<svg ${s}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
        'search': `<svg ${s}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
        'trophy': `<svg ${s}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
        'target': `<svg ${s}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
        'zap': `<svg ${s}><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>`,
        'map': `<svg ${s}><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/></svg>`,
        'flame': `<svg ${s}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
        'message-circle': `<svg ${s}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>`,
        'pin': `<svg ${s}><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>`,
        'alert-triangle': `<svg ${s}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
        'eye': `<svg ${s}><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`,
        'eye-off': `<svg ${s}><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>`,
        'x': `<svg ${s}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
        'send': `<svg ${s}><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>`,
        'edit': `<svg ${s}><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>`,
        'map-pin': `<svg ${s}><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`,
        'weight': `<svg ${s}><circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.23A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.46A2 2 0 0 0 17.48 8Z"/></svg>`,
        'monitor': `<svg ${s}><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`,
        'dollar-sign': `<svg ${s}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
        'bar-chart-3': `<svg ${s}><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>`,
        'clipboard': `<svg ${s}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>`,
        'upload': `<svg ${s}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>`,
        'download': `<svg ${s}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`,
        'book-open': `<svg ${s}><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>`,
        'calendar': `<svg ${s}><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`,
        'clock': `<svg ${s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
        'check': `<svg ${s}><path d="M20 6 9 17l-5-5"/></svg>`,
        'info': `<svg ${s}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
        'arrow-up-right': `<svg ${s}><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>`,
        'chevron-down': `<svg ${s}><path d="m6 9 6 6 6-6"/></svg>`,
        'plus': `<svg ${s}><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
        'history': `<svg ${s}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>`,
        'receipt': `<svg ${s}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></svg>`,
        'bot': `<svg ${s}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`,
        'list': `<svg ${s}><path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/></svg>`,
        'pie-chart': `<svg ${s}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`,
        'factory': `<svg ${s}><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/></svg>`,
        'coins': `<svg ${s}><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>`,
        'menu': `<svg ${s}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`,
        'arrow-up': `<svg ${s}><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>`,
        'arrow-down': `<svg ${s}><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>`,
        'inbox': `<svg ${s}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
        'sparkles': `<svg ${s}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`,
        'undo-2': `<svg ${s}><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>`,
        'check-circle': `<svg ${s}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
        'x-circle': `<svg ${s}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
        'alert-circle': `<svg ${s}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
        'refresh-cw': `<svg ${s}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>`,
        'chevron-left': `<svg ${s}><path d="m15 18-6-6 6-6"/></svg>`,
        'sun': `<svg ${s}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
        'moon': `<svg ${s}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
        'brain': `<svg ${s}><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>`,
        'shield': `<svg ${s}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`,
        'table': `<svg ${s}><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>`,
        'git-compare': `<svg ${s}><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/></svg>`,
        'alert-octagon': `<svg ${s}><path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
    };
    return icons[name] || `<span style="width:${size}px;display:inline-block">?</span>`;
};

const sanitize = (str) => {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
};

const APP = {
    user: null,
    currentPage: 'dashboard',
    cache: {},
    history: [],
    _csrfToken: null,

    async init() {
        // Fetch /me and /csrf in parallel to save a round trip
        const [res, csrf] = await Promise.all([
            this.api('/api/me'),
            this.api('/api/csrf')
        ]);
        if (res && res.authenticated) {
            if (csrf) this._csrfToken = csrf.token;
            this.user = res.user;
            this.renderApp();
            this.navigate(res.user.perfil === 'vendedor' ? 'meu_dia' : 'dashboard');
        } else {
            this.renderLogin();
        }
    },

    async api(url, opts = {}) {
        const timeout = opts.timeout || 30000;
        try {
            const options = { headers: { 'Content-Type': 'application/json' }, ...opts };
            delete options.timeout;
            delete options.retry;
            if (['POST','PUT','DELETE'].includes(opts.method?.toUpperCase())) {
                options.headers['X-CSRF-Token'] = this._csrfToken || '';
            }
            if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
                options.body = JSON.stringify(opts.body);
            }
            if (opts.body instanceof FormData) delete options.headers['Content-Type'];
            const controller = new AbortController();
            options.signal = controller.signal;
            const timer = setTimeout(() => controller.abort(), timeout);
            const res = await fetch(url, options);
            clearTimeout(timer);
            if (res.status === 401) { this.user = null; this.renderLogin(); return null; }
            return await res.json();
        } catch (e) {
            if (e.name === 'AbortError') {
                console.warn('API Timeout:', url);
                if (opts.retry) {
                    return this.api(url, { ...opts, retry: false });
                }
                this.toast('Tempo esgotado — tente novamente', 'warning');
            } else {
                console.error('API Error:', e);
                this.toast('Erro de conexão', 'danger');
            }
            return null;
        }
    },

    // ===== LOGIN =====
    _loginMottos: [
        'Cada contato é uma oportunidade.',
        'Consistência vence talento.',
        'Quem não é visto, não é lembrado.',
        'O follow-up fecha a venda.',
        'Velocidade é vantagem competitiva.',
        'Dados direcionam decisões.',
    ],

    renderLogin() {
        const remembered = localStorage.getItem('abmt_user') || '';
        const motto = this._loginMottos[Math.floor(Math.random() * this._loginMottos.length)];
        document.getElementById('app').innerHTML = `
        <div class="login-container">
            <div class="login-box">
                <h1>ABMT</h1>
                <p class="subtitle">Sistema Comercial</p>
                <p class="login-motto">"${motto}"</p>
                <div id="login-error" class="alert alert-danger" style="display:none"></div>
                <div class="form-group">
                    <label>Usuário</label>
                    <input type="text" id="login-user" class="form-control" placeholder="Digite seu usuário" value="${remembered}">
                </div>
                <div class="form-group">
                    <label>Senha</label>
                    <input type="password" id="login-pass" class="form-control" placeholder="Digite sua senha">
                </div>
                <label class="login-remember">
                    <input type="checkbox" id="login-remember" ${remembered ? 'checked' : ''}>
                    Lembrar meu usuário
                </label>
                <button class="btn btn-primary btn-block" onclick="APP.doLogin()">Entrar</button>
            </div>
        </div>`;
        document.getElementById('login-pass')?.addEventListener('keydown', e => { if (e.key === 'Enter') APP.doLogin(); });
        document.getElementById('login-user')?.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('login-pass').focus(); });
        if (remembered) document.getElementById('login-pass')?.focus();
    },

    async doLogin() {
        const username = document.getElementById('login-user').value;
        const password = document.getElementById('login-pass').value;
        const remember = document.getElementById('login-remember')?.checked;
        const res = await this.api('/api/login', { method: 'POST', body: { username, password } });
        if (res?.ok) {
            if (remember) localStorage.setItem('abmt_user', username);
            else localStorage.removeItem('abmt_user');
            this._csrfToken = res.csrf_token || null;
            if (!this._csrfToken) {
                const csrf = await this.api('/api/csrf');
                if (csrf) this._csrfToken = csrf.token;
            }
            this.user = res.user;
            if (res.must_change_password) {
                this.renderForceChangePassword();
                return;
            }
            this.renderApp();
            this.navigate(this.user.perfil === 'vendedor' ? 'meu_dia' : 'dashboard');
        } else {
            const err = document.getElementById('login-error');
            err.style.display = 'block';
            err.textContent = res?.error || 'Erro ao fazer login';
        }
    },

    renderForceChangePassword() {
        document.getElementById('app').innerHTML = `
        <div class="login-page">
            <div class="login-card">
                <div class="login-logo">ABMT</div>
                <h2 style="text-align:center;margin-bottom:8px">Alterar Senha</h2>
                <p style="text-align:center;color:var(--text-secondary);font-size:13px;margin-bottom:16px">
                    Por segurança, altere sua senha padrão antes de continuar.
                </p>
                <div id="change-pwd-error" class="alert alert-danger" style="display:none"></div>
                <div class="form-group"><label>Nova senha (mín. 6 caracteres)</label>
                    <input type="password" id="new-pwd" class="form-control" placeholder="Nova senha" autocomplete="new-password"></div>
                <div class="form-group"><label>Confirme a nova senha</label>
                    <input type="password" id="new-pwd-confirm" class="form-control" placeholder="Confirme" autocomplete="new-password"></div>
                <button class="btn btn-primary btn-block" onclick="APP.doChangePassword()">Salvar Nova Senha</button>
            </div>
        </div>`;
        document.getElementById('new-pwd')?.focus();
        document.getElementById('new-pwd-confirm')?.addEventListener('keydown', e => { if (e.key === 'Enter') APP.doChangePassword(); });
    },

    async doChangePassword() {
        const pwd = document.getElementById('new-pwd').value;
        const confirm = document.getElementById('new-pwd-confirm').value;
        const err = document.getElementById('change-pwd-error');
        if (pwd.length < 6) { err.style.display = 'block'; err.textContent = 'Senha deve ter pelo menos 6 caracteres'; return; }
        if (pwd !== confirm) { err.style.display = 'block'; err.textContent = 'As senhas não conferem'; return; }
        const res = await this.api('/api/change-password', { method: 'POST', body: { new_password: pwd } });
        if (res?.ok) {
            this.renderApp();
            this.navigate(this.user.perfil === 'vendedor' ? 'meu_dia' : 'dashboard');
        } else {
            err.style.display = 'block';
            err.textContent = res?.error || 'Erro ao alterar senha';
        }
    },

    // ===== APP SHELL =====
    renderApp() {
        const isGestor = this.user.perfil !== 'vendedor';
        document.getElementById('app').innerHTML = `
        <div class="sidebar" id="sidebar" aria-label="Menu principal">
            <div class="sidebar-header" style="cursor:pointer" onclick="APP.navigate('home')">
                <div class="sidebar-logo">ABMT</div>
                <small style="color:var(--text-muted)">Comercial</small>
            </div>
            <div class="sidebar-user">
                <div class="avatar">${sanitize(this.user.nome[0])}</div>
                <div>
                    <div style="font-weight:600;font-size:13px">${sanitize(this.user.nome)}</div>
                    <div style="font-size:11px;color:var(--text-muted)">${this.user.perfil}</div>
                </div>
            </div>
            <nav class="sidebar-nav" role="navigation">
                <div class="nav-section">PRINCIPAL</div>
                <a class="nav-link active" data-page="dashboard" onclick="APP.navigate('dashboard')">${LI('layout-dashboard',16)} Dashboard</a>
                <a class="nav-link" data-page="meu_dia" onclick="APP.navigate('meu_dia')">${LI('sun',16)} Meu Dia</a>
                <div class="nav-section">VENDAS</div>
                <a class="nav-link" data-page="vendas_propostas" onclick="APP.navigate('vendas_propostas')">${LI('file-text',16)} Propostas de Venda</a>
                <a class="nav-link" data-page="vendas_ovs" onclick="APP.navigate('vendas_ovs')">${LI('package',16)} Ordens de Venda</a>
                <div class="nav-section">COMPRAS</div>
                <a class="nav-link" data-page="compras_propostas" onclick="APP.navigate('compras_propostas')">${LI('file-text',16)} Propostas de Compra</a>
                <a class="nav-link" data-page="compras_ocs" onclick="APP.navigate('compras_ocs')">${LI('package',16)} Ordens de Compra</a>
                <div class="nav-section">OPERACIONAL</div>
                <a class="nav-link" data-page="cadastros" onclick="APP.navigate('cadastros')">${LI('users',16)} Clientes</a>
                <a class="nav-link" data-page="followups" onclick="APP.navigate('followups')">${LI('bell',16)} Follow-ups</a>
                <a class="nav-link" data-page="notas" onclick="APP.navigate('notas')">${LI('sticky-note',16)} Notas</a>
                ${isGestor ? `
                <div class="nav-section">GESTÃO</div>
                <a class="nav-link" data-page="pipeline" onclick="APP.navigate('pipeline')">${LI('target',16)} Pipeline Comercial</a>
                <a class="nav-link" data-page="fechamento" onclick="APP.navigate('fechamento')">${LI('clipboard',16)} Fechamento</a>
                <a class="nav-link" data-page="relatorios" onclick="APP.navigate('relatorios')">${LI('trending-up',16)} Relatórios</a>
                <a class="nav-link" data-page="inteligencia" onclick="APP.navigate('inteligencia')">${LI('brain',16)} Inteligência Comercial</a>
                <a class="nav-link" data-page="config" onclick="APP.navigate('config')">${LI('settings',16)} Configurações</a>
                ` : ''}
                <div class="nav-section" style="margin-top:8px">AJUDA</div>
                <a class="nav-link" data-page="guia" onclick="APP.navigate('guia')">${LI('book-open',16)} Guia do Vendedor</a>
            </nav>
            <div class="sidebar-footer">
                <button class="btn btn-outline btn-sm btn-block" onclick="APP.doLogout()">Sair</button>
            </div>
        </div>
        <div class="sidebar-backdrop" id="sidebar-backdrop" onclick="APP.closeSidebar()"></div>
        <div class="main-area">
            <div class="topbar">
                <button class="menu-toggle" onclick="APP.toggleSidebar()">${LI('menu',20)}</button>
                <div class="topbar-search">
                    <span class="icon">${LI('search',16)}</span>
                    <input type="text" id="global-search" placeholder="Buscar cliente, proposta, OV, OC..." oninput="APP.debounceSearch(this.value)">
                    <span id="search-spinner" class="spinner" style="display:none;width:16px;height:16px;border-width:2px;position:absolute;right:12px;top:50%;transform:translateY(-50%)"></span>
                    <div id="search-results" class="search-results" style="display:none"></div>
                </div>
                <div class="topbar-actions" style="position:relative">
                    <button class="badge-btn theme-toggle" onclick="APP.toggleTheme()" title="Alternar tema">
                        ${LI('sun',18)}${LI('moon',18)}
                    </button>
                    <button class="badge-btn" onclick="APP.toggleNotifDropdown()" title="Notificações">
                        ${LI('bell',18)}<span id="notif-badge" class="badge" style="display:none">0</span>
                    </button>
                    <div id="notif-dropdown" class="search-results" style="display:none;position:absolute;right:0;top:100%;width:320px;max-height:400px;overflow-y:auto;z-index:1000;margin-top:8px"></div>
                </div>
            </div>
            <div class="content" id="page-content" role="main"></div>
        </div>
        <nav class="nav-bottom">
            <div class="nav-item" data-page="dashboard" onclick="APP.navigate('dashboard')"><span class="icon">${LI('layout-dashboard',20)}</span>Início</div>
            <div class="nav-item" data-page="vendas" onclick="APP.navigate('vendas')"><span class="icon">${LI('upload',20)}</span>Vendas</div>
            <div class="nav-item" data-page="compras" onclick="APP.navigate('compras')"><span class="icon">${LI('download',20)}</span>Compras</div>
            <div class="nav-item" data-page="cadastros" onclick="APP.navigate('cadastros')"><span class="icon">${LI('users',20)}</span>Clientes</div>
            <div class="nav-item" data-page="notas" onclick="APP.navigate('notas')"><span class="icon">${LI('list',20)}</span>Mais</div>
        </nav>
        <div class="assistente-fab" onclick="APP.toggleAssistente()" title="Assistente / Sugestões">${LI('message-circle',22)}</div>
        <div id="assistente-panel" class="assistente-panel" style="display:none">
            <div class="assistente-header">
                <div class="assistente-tabs">
                    <button class="assistente-tab active" onclick="APP.switchAssistenteTab('chat')">Assistente</button>
                    <button class="assistente-tab" onclick="APP.switchAssistenteTab('sugestoes')">Sugestões</button>
                </div>
                <button class="assistente-close" onclick="APP.toggleAssistente()">${LI('x',18)}</button>
            </div>
            <div id="assistente-content">
                <div id="assistente-chat" class="assistente-body">
                    <div id="assistente-messages" class="assistente-messages">
                        <div class="assistente-msg bot">Ola! Como posso ajudar? Pergunte sobre qualquer funcionalidade do sistema.</div>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;padding:8px 0">
                            <button class="btn btn-outline btn-sm" style="font-size:11px;padding:4px 8px" onclick="APP.sendAssistenteSuggestion('Quanto faturei este mes?')">Quanto faturei este mes?</button>
                            <button class="btn btn-outline btn-sm" style="font-size:11px;padding:4px 8px" onclick="APP.sendAssistenteSuggestion('Clientes inativos')">Clientes inativos</button>
                            <button class="btn btn-outline btn-sm" style="font-size:11px;padding:4px 8px" onclick="APP.sendAssistenteSuggestion('Meu pipeline')">Meu pipeline</button>
                            <button class="btn btn-outline btn-sm" style="font-size:11px;padding:4px 8px" onclick="APP.sendAssistenteSuggestion('Minha comissao')">Minha comissao</button>
                        </div>
                    </div>
                    <div class="assistente-input">
                        <input type="text" id="assistente-input" placeholder="Digite sua pergunta..." onkeydown="if(event.key==='Enter')APP.sendAssistente()">
                        <button onclick="APP.sendAssistente()">${LI("send",16)}</button>
                    </div>
                </div>
                <div id="assistente-sugestoes" class="assistente-body" style="display:none">
                    <div class="form-group" style="margin:12px">
                        <label>Categoria</label>
                        <select id="sugestao-categoria" class="form-control">
                            <option value="Melhoria">Melhoria</option>
                            <option value="Bug">Bug</option>
                            <option value="Dúvida">Dúvida</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin:12px">
                        <label>Sua sugestão</label>
                        <textarea id="sugestao-texto" class="form-control" rows="4" placeholder="Descreva sua sugestão, bug ou dúvida..."></textarea>
                    </div>
                    <div style="margin:12px"><button class="btn btn-primary btn-block" onclick="APP.enviarSugestao()">Enviar Sugestão</button></div>
                </div>
            </div>
        </div>`;
        // Init pull-to-refresh after DOM exists
        setTimeout(() => this.initPullToRefresh(), 100);
    },

    navigate(page, params = {}, skipHistory = false) {
        // Check for unsaved form changes before navigating away
        if (this._formDirty && !this.checkDirtyForm()) return;
        if (this._dashTimestampInterval) { clearInterval(this._dashTimestampInterval); this._dashTimestampInterval = null; }
        if (!skipHistory && (this.currentPage !== page || Object.keys(params).length > 0)) {
            this.history.push({ page: this.currentPage, params: {} });
        }
        this.currentPage = page;

        // Update active nav
        document.querySelectorAll('.nav-link, .nav-item').forEach(n => {
            n.classList.toggle('active', n.dataset.page === page);
        });

        // Close mobile sidebar
        this.closeSidebar();

        const pages = {
            home: () => this.renderHome(),
            dashboard: () => this.renderDashboard(),
            meu_dia: () => this.renderMeuDia(),
            proposta_rapida: () => FORMS.renderPropostaRapida(params),
            vendas: () => this.renderVendas(params),
            vendas_propostas: () => this.renderVendas({tab:'propostas'}),
            vendas_ovs: () => this.renderVendas({tab:'ovs'}),
            compras: () => this.renderCompras(params),
            compras_propostas: () => this.renderCompras({tab:'propostas'}),
            compras_ocs: () => this.renderCompras({tab:'ocs'}),
            cadastros: () => this.renderCadastros(params),
            notas: () => this.renderNotas(),
            proposta_form: () => FORMS.renderPropostaForm(params),
            proposta_view: () => this.renderPropostaView(params.id),
            ov_form: () => FORMS.renderOVForm(params),
            ov_view: () => this.renderOVView(params.id),
            oc_form: () => FORMS.renderOCForm(params),
            oc_view: () => this.renderOCView(params.id),
            cadastro_view: () => this.renderCadastroView(params.id),
            cadastro_form: () => FORMS.renderCadastroForm(params),
            followups: () => this.renderFollowups(),
            pipeline: () => this.renderPipeline(),
            fechamento: () => this.renderFechamento(params),
            relatorios: () => this.renderRelatorios(params),
            inteligencia: () => this.renderInteligencia(),
            config: () => this.renderConfig(),
            notificacoes: () => this.renderNotificacoes(),
            guia: () => this.renderGuia(),
        };
        // Trigger page transition animation
        const contentEl = document.getElementById('page-content');
        if (contentEl) {
            contentEl.style.animation = 'none';
            contentEl.offsetHeight; // force reflow
            contentEl.style.animation = 'pageSlideIn 0.3s ease-out';
        }
        if (pages[page]) pages[page]();
        window.scrollTo(0, 0);
    },

    goBack() {
        const prev = this.history.pop();
        if (prev) this.navigate(prev.page, prev.params, true);
        else this.navigate('dashboard', {}, true);
    },

    pageHeader(title, backPage, actions = '') {
        return `<div class="page-header">
            <div class="page-header-left">
                <button class="btn-back" onclick="APP.goBack()">${LI('chevron-left',18)}</button>
                <h2 class="page-title">${title}</h2>
            </div>
            <div class="page-header-right">${actions}</div>
        </div>`;
    },

    // ===== DASHBOARD =====
    _dashTab: 'vendas',
    _dashValuesHidden: false,

    _dashFilterVendedor: null,
    _dashFilterCategoria: null,
    _dashFilterSegmento: null,
    _dashFiltros: null,

    SEGMENTO_CORES: {
        'Reformador': { cor: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: '🔧' },
        'Fabricante': { cor: '#6366f1', bg: 'rgba(99,102,241,0.15)', icon: '🏭' },
        'Reciclagem / Sucata': { cor: '#10b981', bg: 'rgba(16,185,129,0.15)', icon: '♻️' },
        'Distribuidor / Revenda': { cor: '#3b82f6', bg: 'rgba(59,130,246,0.15)', icon: '🏪' },
        'Concessionária': { cor: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', icon: '⚡' },
        'Indústria': { cor: '#ec4899', bg: 'rgba(236,72,153,0.15)', icon: '🏗️' },
        'Pessoa Física': { cor: '#94a3b8', bg: 'rgba(148,163,184,0.15)', icon: '👤' },
        'Outro': { cor: '#64748b', bg: 'rgba(100,116,139,0.15)', icon: '📋' },
    },

    getSegmentoBadge(segmento) {
        if (!segmento) return '';
        const s = this.SEGMENTO_CORES[segmento] || this.SEGMENTO_CORES['Outro'];
        return `<span class="segmento-badge" style="background:${s.bg};color:${s.cor}">${s.icon} ${sanitize(segmento)}</span>`;
    },

    async renderDashboard() {
        const el = document.getElementById('page-content');
        el.innerHTML = `<div style="padding:8px 0"><div class="skeleton skeleton-text" style="width:30%;height:20px;margin-bottom:16px"></div>${this.skeletonKPI()}<div class="grid-2"><div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div></div></div>`;

        let dashUrl = '/api/dashboard/advanced';
        const filterParams = [];
        if (this._dashFilterVendedor) filterParams.push(`vendedor_id=${this._dashFilterVendedor}`);
        if (this._dashFilterCategoria) filterParams.push(`categoria=${encodeURIComponent(this._dashFilterCategoria)}`);
        if (this._dashFilterSegmento) filterParams.push(`segmento=${encodeURIComponent(this._dashFilterSegmento)}`);
        if (this._dashFilterMes) filterParams.push(`mes=${this._dashFilterMes}`);
        if (this._dashFilterAno) filterParams.push(`ano=${this._dashFilterAno}`);
        if (filterParams.length) dashUrl += '?' + filterParams.join('&');

        const [data, crm, analytics, filtros] = await Promise.all([
            this.api(dashUrl, { retry: true }),
            this.user.perfil !== 'vendedor' ? this.api('/api/crm/alertas', { retry: true }) : null,
            this.api(`/api/analytics/${new Date().getFullYear()}`, { retry: true }),
            !this._dashFiltros ? this.api('/api/dashboard/filtros') : Promise.resolve(this._dashFiltros)
        ]);
        if (filtros) this._dashFiltros = filtros;
        if (!data) return;
        this._dashData = data;
        this._analyticsData = analytics;
        this._crmData = crm;

        const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
        const dashDate = this._dashFilterMes ? new Date(this._dashFilterAno || new Date().getFullYear(), this._dashFilterMes - 1) : new Date();
        const mesNome = dashDate.toLocaleDateString('pt-BR', { month: 'long' }).replace(/^\w/, l => l.toUpperCase());
        this._dashLoadedAt = new Date();

        el.innerHTML = `
        <div id="pull-refresh-indicator" style="height:0;opacity:0;overflow:hidden;text-align:center;font-size:12px;color:var(--accent);transition:height 0.2s,opacity 0.2s;display:flex;align-items:center;justify-content:center">${LI('arrow-down',14)} Puxe para atualizar</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <span id="dash-updated-at" style="font-size:11px;color:var(--text-muted)">Atualizado agora</span>
        </div>
        <div class="dash-header">
            <div class="dash-header-left">
                <div>
                    <h2>Olá, ${sanitize(this.user.nome)}! ${LI('sparkles',20)}</h2>
                    <p style="color:var(--text-secondary);font-size:12px">${hoje} · ${mesNome} ${data.ano}</p>
                </div>
                <span class="dash-live-badge">AO VIVO</span>
            </div>
            <div class="dash-header-actions">
                <button class="btn-hide-values" onclick="APP.toggleDashValues()">
                    <span id="hide-icon">${this._dashValuesHidden ? LI('eye',16) : LI('eye-off',16)}</span>
                    <span id="hide-text">${this._dashValuesHidden ? 'Mostrar' : 'Ocultar'} valores</span>
                </button>
                <button class="btn btn-primary btn-sm" onclick="APP.navigate('proposta_form',{tipo:'VENDA'})">+ Proposta Venda</button>
                <button class="btn btn-outline btn-sm" onclick="APP.navigate('proposta_form',{tipo:'COMPRA'})">+ Proposta Compra</button>
            </div>
        </div>

        ${data.followups_atrasados > 0 ? `<div class="alert alert-danger" onclick="APP.navigate('followups')" style="cursor:pointer">${LI('alert-triangle',16)} ${data.followups_atrasados} follow-up(s) atrasado(s) — clique para ver</div>` : ''}

        <!-- FILTROS -->
        ${data.is_gestor && filtros ? `
        <div class="dash-filters">
            <span class="dash-filters-label">${LI('filter',14)} Filtros:</span>
            <select id="filter-vendedor" class="dash-filter-select" onchange="APP.applyDashFilter()">
                <option value="">Todos os vendedores</option>
                ${filtros.vendedores.map(v => `<option value="${v.id}" ${this._dashFilterVendedor == v.id ? 'selected' : ''}>${sanitize(v.nome)}</option>`).join('')}
            </select>
            <select id="filter-categoria" class="dash-filter-select" onchange="APP.applyDashFilter()">
                <option value="">Todas as categorias</option>
                ${filtros.categorias.map(c => `<option value="${sanitize(c)}" ${this._dashFilterCategoria === c ? 'selected' : ''}>${sanitize(c)}</option>`).join('')}
            </select>
            <select id="filter-segmento" class="dash-filter-select" onchange="APP.applyDashFilter()">
                <option value="">Todos os segmentos</option>
                <option value="Reformador" ${this._dashFilterSegmento === 'Reformador' ? 'selected' : ''}>🔧 Reformador</option>
                <option value="Fabricante" ${this._dashFilterSegmento === 'Fabricante' ? 'selected' : ''}>🏭 Fabricante</option>
                <option value="Reciclagem / Sucata" ${this._dashFilterSegmento === 'Reciclagem / Sucata' ? 'selected' : ''}>♻️ Reciclagem / Sucata</option>
                <option value="Distribuidor / Revenda" ${this._dashFilterSegmento === 'Distribuidor / Revenda' ? 'selected' : ''}>🏪 Distribuidor / Revenda</option>
                <option value="Concessionária" ${this._dashFilterSegmento === 'Concessionária' ? 'selected' : ''}>⚡ Concessionária</option>
                <option value="Indústria" ${this._dashFilterSegmento === 'Indústria' ? 'selected' : ''}>🏗️ Indústria</option>
                <option value="Pessoa Física" ${this._dashFilterSegmento === 'Pessoa Física' ? 'selected' : ''}>👤 Pessoa Física</option>
                <option value="Outro" ${this._dashFilterSegmento === 'Outro' ? 'selected' : ''}>📋 Outro</option>
            </select>
            ${this._dashFilterVendedor || this._dashFilterCategoria || this._dashFilterSegmento || this._dashFilterMes ? `<button class="btn btn-outline btn-sm" onclick="APP.clearDashFilters()" style="font-size:11px;padding:4px 10px">${LI('x',12)} Limpar</button>` : ''}
        </div>` : ''}

        <!-- MONTH/YEAR SELECTOR -->
        <div class="dash-filters" style="margin-top:4px">
            <span class="dash-filters-label">${LI('calendar',14)} Período:</span>
            <select id="filter-mes" class="dash-filter-select" onchange="APP.applyDashFilter()">
                ${[...Array(12)].map((_, i) => {
                    const m = i + 1;
                    const mNome = new Date(2000, i).toLocaleDateString('pt-BR', { month: 'long' }).replace(/^\w/, l => l.toUpperCase());
                    return `<option value="${m}" ${(this._dashFilterMes || new Date().getMonth() + 1) == m ? 'selected' : ''}>${mNome}</option>`;
                }).join('')}
            </select>
            <select id="filter-ano" class="dash-filter-select" onchange="APP.applyDashFilter()">
                ${[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(a =>
                    `<option value="${a}" ${(this._dashFilterAno || new Date().getFullYear()) == a ? 'selected' : ''}>${a}</option>`
                ).join('')}
            </select>
        </div>

        <!-- TABS VENDAS / COMPRAS -->
        <div class="dash-tabs">
            <div class="dash-tab tab-vendas ${this._dashTab==='vendas'?'active':''}" onclick="APP.switchDashTab('vendas')">
                ${LI('upload',16)} VENDAS <span class="tab-badge">R$ ${this.formatMoney(data.vendas.total_mes)}</span>
            </div>
            <div class="dash-tab tab-compras ${this._dashTab==='compras'?'active':''}" onclick="APP.switchDashTab('compras')">
                ${LI('download',16)} COMPRAS <span class="tab-badge">R$ ${this.formatMoney(data.compras.total_mes)}</span>
            </div>
        </div>

        <div id="dash-content" class="${this._dashValuesHidden ? 'values-hidden' : ''}"></div>

        <!-- MARGEM BRUTA (gestor only) -->
        ${data.is_gestor ? `
        <div class="kpi-grid" style="grid-template-columns: repeat(3, 1fr); margin-top:12px">
            <div class="kpi-card" style="border-left:3px solid var(--success)">
                <div class="kpi-label">Faturamento Vendas</div>
                <div class="kpi-value green">R$ ${this.formatMoney(data.vendas.total_mes)}</div>
            </div>
            <div class="kpi-card" style="border-left:3px solid var(--danger)">
                <div class="kpi-label">Total Compras</div>
                <div class="kpi-value" style="color:var(--danger)">R$ ${this.formatMoney(data.compras.total_mes)}</div>
            </div>
            <div class="kpi-card" style="border-left:3px solid ${data.margem_bruta >= 0 ? 'var(--accent)' : 'var(--danger)'}">
                <div class="kpi-label">Margem Bruta Estimada</div>
                <div class="kpi-value" style="color:${data.margem_bruta >= 0 ? 'var(--accent)' : 'var(--danger)'}">R$ ${this.formatMoney(data.margem_bruta)}</div>
                <div class="kpi-sub">${data.margem_pct}% sobre faturamento</div>
            </div>
        </div>` : ''}

        <!-- RANKING VENDEDORES COM META (gestor only) -->
        ${data.is_gestor && data.ranking_vendedores?.length > 0 ? `
        <div class="card" style="margin-top:16px">
            <div class="card-header"><span class="card-title">${LI('trophy',20)} Performance da Equipe — ${mesNome}</span>
                <button class="btn btn-outline btn-sm" onclick="APP.exportarResumo()" title="Copiar resumo para WhatsApp" style="font-size:11px">${LI('send',14)} Compartilhar</button>
            </div>
            <div style="overflow-x:auto">
            <table style="width:100%;font-size:13px;border-collapse:collapse">
                <thead><tr style="border-bottom:2px solid var(--border)">
                    <th style="text-align:left;padding:8px;color:var(--text-muted);font-size:11px">#</th>
                    <th style="text-align:left;padding:8px;color:var(--text-muted);font-size:11px">VENDEDOR</th>
                    <th style="text-align:right;padding:8px;color:var(--text-muted);font-size:11px">META</th>
                    <th style="text-align:right;padding:8px;color:var(--text-muted);font-size:11px">REALIZADO</th>
                    <th style="text-align:left;padding:8px;color:var(--text-muted);font-size:11px;min-width:140px">PROGRESSO</th>
                </tr></thead>
                <tbody>
                ${data.ranking_vendedores.map((v, i) => {
                    const cor = v.pct >= 80 ? 'var(--success)' : v.pct >= 50 ? 'var(--warning)' : 'var(--danger)';
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i+1)+'º';
                    return `<tr style="border-bottom:1px solid var(--border)" onclick="APP.navigate('dashboard_vendedor',{id:${v.id}});" class="ranking-item" style="cursor:pointer">
                        <td style="padding:8px;font-weight:700">${medal}</td>
                        <td style="padding:8px"><div style="font-weight:600">${sanitize(v.nome)}</div><div style="font-size:11px;color:var(--text-muted)">${v.perfil}</div></td>
                        <td style="text-align:right;padding:8px;color:var(--text-secondary)">R$ ${this.formatMoney(v.meta)}</td>
                        <td style="text-align:right;padding:8px;font-weight:700;color:${cor}">R$ ${this.formatMoney(v.realizado)}</td>
                        <td style="padding:8px">
                            <div style="display:flex;align-items:center;gap:8px">
                                <div style="flex:1;height:8px;background:var(--bg-input);border-radius:4px;overflow:hidden">
                                    <div style="height:100%;width:${Math.min(v.pct, 100)}%;background:${cor};border-radius:4px;transition:width 0.5s"></div>
                                </div>
                                <span style="font-size:12px;font-weight:700;color:${cor};min-width:40px;text-align:right">${v.pct}%</span>
                            </div>
                        </td>
                    </tr>`;
                }).join('')}
                </tbody>
            </table>
            </div>
        </div>` : ''}

        <!-- INADIMPLÊNCIA (gestor only, vendedor não vê) -->
        ${data.is_gestor && data.inadimplencia?.length > 0 ? `
        <div class="card" style="margin-top:16px;border-left:3px solid var(--danger)">
            <div class="card-header">
                <span class="card-title" style="color:var(--danger)">${LI('alert-triangle',20)} Parcelas Vencidas — R$ ${this.formatMoney(data.inadimplencia_total)}</span>
            </div>
            <div style="max-height:200px;overflow-y:auto">
            <table style="width:100%;font-size:12px;border-collapse:collapse">
                <thead><tr style="border-bottom:1px solid var(--border)">
                    <th style="text-align:left;padding:6px 8px;color:var(--text-muted)">CLIENTE</th>
                    <th style="text-align:right;padding:6px 8px;color:var(--text-muted)">VALOR</th>
                    <th style="text-align:right;padding:6px 8px;color:var(--text-muted)">VENCIMENTO</th>
                    <th style="text-align:right;padding:6px 8px;color:var(--text-muted)">ATRASO</th>
                </tr></thead>
                <tbody>
                ${data.inadimplencia.map(p => `<tr style="border-bottom:1px solid var(--border);cursor:pointer" onclick="APP.navigate('cadastro_view',{id:${p.cadastro_id}})">
                    <td style="padding:6px 8px;font-weight:500">${sanitize(p.cliente)}</td>
                    <td style="text-align:right;padding:6px 8px;font-weight:600;color:var(--danger)">R$ ${this.formatMoney(p.valor)}</td>
                    <td style="text-align:right;padding:6px 8px;color:var(--text-secondary)">${this.formatDate(p.vencimento)}</td>
                    <td style="text-align:right;padding:6px 8px"><span style="background:var(--danger);color:white;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600">${p.dias_atraso}d</span></td>
                </tr>`).join('')}
                </tbody>
            </table>
            </div>
        </div>` : ''}

        <!-- QUICK ACTIONS GRID -->
        <div class="card" style="margin-top:20px">
            <div class="card-header"><span class="card-title">${LI('zap',20)} Ações Rápidas</span></div>
            <div class="quick-actions-grid">
                <div class="quick-action" onclick="APP.navigate('proposta_form',{tipo:'VENDA'})"><span class="qa-icon">${LI('upload',20)}</span><span>Nova Proposta Venda</span></div>
                <div class="quick-action" onclick="APP.navigate('proposta_form',{tipo:'COMPRA'})"><span class="qa-icon">${LI('download',20)}</span><span>Nova Proposta Compra</span></div>
                ${data.is_gestor ? `
                <div class="quick-action" onclick="APP.navigate('pipeline')"><span class="qa-icon">${LI('target',20)}</span><span>Pipeline Comercial</span></div>
                <div class="quick-action" onclick="APP.navigate('inteligencia')"><span class="qa-icon">${LI('brain',20)}</span><span>Inteligência Comercial</span></div>
                <div class="quick-action" onclick="APP.navigate('fechamento')"><span class="qa-icon">${LI('bar-chart-3',20)}</span><span>Fechamento</span></div>
                ` : ''}
            </div>
        </div>

        <!-- PREVISAO DE FATURAMENTO -->
        <div id="dash-previsao" class="card" style="margin-top:20px;border:2px solid transparent;background-clip:padding-box;position:relative">
            <div style="position:absolute;inset:0;border-radius:var(--radius-md);padding:2px;background:linear-gradient(135deg,var(--accent),var(--success),var(--warning));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none"></div>
            <div class="card-header"><span class="card-title">${LI('bar-chart-3',20)} Previsão de Faturamento</span></div>
            <div id="dash-previsao-content" style="padding:8px"><div class="spinner" style="margin:8px auto"></div></div>
        </div>

        ${data.is_gestor ? `
        <!-- FLUXO DE CAIXA PROJETADO -->
        <div class="card" style="margin-top:20px">
            <div class="card-header"><span class="card-title">${LI('wallet',20)} Fluxo de Caixa — Próximos 90 dias</span></div>
            <div id="cashflow-kpis" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-bottom:12px">
                <div class="spinner" style="margin:8px auto;grid-column:1/-1"></div>
            </div>
            <div style="height:280px;position:relative"><canvas id="cashflow-chart"></canvas></div>
            <div id="cashflow-table" style="margin-top:12px;max-height:200px;overflow-y:auto"></div>
        </div>` : ''}`;

        this._renderDashTab();
        this.updateFollowupBadge();
        this._loadRecompraAlertas();
        this._loadPrevisaoFaturamento();
        if (data.is_gestor) this._loadCashFlowChart();
        this._startDashTimestamp();
    },

    _dashTimestampInterval: null,
    _startDashTimestamp() {
        if (this._dashTimestampInterval) clearInterval(this._dashTimestampInterval);
        this._dashTimestampInterval = setInterval(() => {
            const el = document.getElementById('dash-updated-at');
            if (!el || !this._dashLoadedAt) { clearInterval(this._dashTimestampInterval); return; }
            const diffMs = Date.now() - this._dashLoadedAt.getTime();
            const mins = Math.floor(diffMs / 60000);
            el.textContent = mins < 1 ? 'Atualizado agora' : `Atualizado ha ${mins} minuto${mins > 1 ? 's' : ''}`;
        }, 30000);
    },

    async _loadRecompraAlertas(targetId = 'dash-recompra-alertas') {
        const el = document.getElementById(targetId);
        if (!el) return;
        const data = await this.api('/api/dashboard/recompra-alertas');
        if (!data || !data.alertas || data.alertas.length === 0) {
            el.innerHTML = '';
            return;
        }
        const risco = data.alertas.filter(a => a.nivel === 'risco');
        const atencao = data.alertas.filter(a => a.nivel === 'atencao');
        el.innerHTML = `
        <div class="card" style="border-left:4px solid var(--warning)">
            <div class="card-header">
                <span class="card-title">${LI('bell',20)} Clientes fora do ciclo de compra</span>
                <span style="font-size:12px;color:var(--text-muted)">${data.total} cliente${data.total!==1?'s':''}</span>
            </div>
            ${risco.length > 0 ? `
            <div style="padding:4px 16px 0"><div style="font-size:11px;font-weight:700;color:var(--danger);text-transform:uppercase;margin-bottom:4px">🔴 Risco de perda (30+ dias além do ciclo)</div></div>
            ${risco.slice(0,5).map(c => `
            <div class="crm-alert-item" onclick="APP.navigate('cadastro_view',{id:${c.cadastro_id}})">
                <div class="crm-alert-content">
                    <strong>${sanitize(c.nome)}</strong>
                    <div class="crm-alert-detail">Ciclo: ~${c.frequencia_media}d · Sem comprar: <strong style="color:var(--danger)">${c.dias_sem_comprar}d</strong> · Atraso: +${c.atraso_dias}d</div>
                </div>
                <div style="display:flex;gap:4px">
                    ${c.whatsapp ? `<a class="btn btn-sm btn-success" href="https://wa.me/55${c.whatsapp.replace(/\\D/g,'')}" target="_blank" onclick="event.stopPropagation()">${LI('send',12)}</a>` : ''}
                    <button class="btn btn-sm btn-warning" onclick="APP.repetirPedido(${c.cadastro_id},this);event.stopPropagation()">${LI('repeat',12)} Repetir</button>
                </div>
            </div>`).join('')}` : ''}
            ${atencao.length > 0 ? `
            <div style="padding:8px 16px 0"><div style="font-size:11px;font-weight:700;color:var(--warning);text-transform:uppercase;margin-bottom:4px">🟡 Atenção (10+ dias além do ciclo)</div></div>
            ${atencao.slice(0,5).map(c => `
            <div class="crm-alert-item" onclick="APP.navigate('cadastro_view',{id:${c.cadastro_id}})">
                <div class="crm-alert-content">
                    <strong>${sanitize(c.nome)}</strong>
                    <div class="crm-alert-detail">Ciclo: ~${c.frequencia_media}d · Sem comprar: ${c.dias_sem_comprar}d · Atraso: +${c.atraso_dias}d</div>
                </div>
                <div style="display:flex;gap:4px">
                    ${c.whatsapp ? `<a class="btn btn-sm btn-success" href="https://wa.me/55${c.whatsapp.replace(/\\D/g,'')}" target="_blank" onclick="event.stopPropagation()">${LI('send',12)}</a>` : ''}
                    <button class="btn btn-sm btn-outline" onclick="APP.repetirPedido(${c.cadastro_id},this);event.stopPropagation()">${LI('repeat',12)} Repetir</button>
                </div>
            </div>`).join('')}` : ''}
        </div>`;
    },

    async _loadPrevisaoFaturamento() {
        const previsao = await this.api('/api/dashboard/previsao');
        const el = document.getElementById('dash-previsao-content');
        if (!el) return;
        if (!previsao) { el.innerHTML = '<p style="color:var(--text-muted);font-size:12px">Sem dados de previsao</p>'; return; }
        const hojeList = (previsao.hoje || []);
        const semanaTotal = previsao.total_semana || 0;
        const pipelineArr = previsao.pipeline || [];
        el.innerHTML = `
            <div class="previsao-grid">
                <div>
                    <div class="previsao-section-label">HOJE (${hojeList.length} propostas)</div>
                    ${hojeList.length > 0 ? hojeList.slice(0, 5).map(p => `<div class="previsao-row"><span class="previsao-row-name">${sanitize(p.cliente || p.numero || '-')}</span><span class="previsao-row-value">R$ ${this.formatMoney(p.valor)}</span></div>`).join('') : '<p style="font-size:12px;color:var(--text-muted)">Nenhuma proposta hoje</p>'}
                </div>
                <div>
                    <div class="previsao-section-label">ESTA SEMANA</div>
                    <div class="previsao-highlight">R$ ${this.formatMoney(semanaTotal)}</div>
                    <div class="previsao-section-label" style="margin-top:12px">PIPELINE</div>
                    ${pipelineArr.map(p => `<div class="previsao-row"><span>${p.status} (${p.count})</span><span class="previsao-row-value">R$ ${this.formatMoney(p.valor)}</span></div>`).join('')}
                </div>
            </div>`;
    },

    async _loadCashFlowChart() {
        const cf = await this.api('/api/cashflow');
        if (!cf) return;

        // KPIs
        const kpiEl = document.getElementById('cashflow-kpis');
        if (kpiEl) {
            const t = cf.totais;
            kpiEl.innerHTML = `
                <div class="kpi-mini" style="background:var(--bg-elevated);border-radius:8px;padding:10px;text-align:center">
                    <div style="font-size:11px;color:var(--success);text-transform:uppercase;font-weight:600">A Receber</div>
                    <div style="font-size:18px;font-weight:700;color:var(--success)">R$ ${this.formatMoney(t.total_entradas)}</div>
                </div>
                <div class="kpi-mini" style="background:var(--bg-elevated);border-radius:8px;padding:10px;text-align:center">
                    <div style="font-size:11px;color:var(--danger);text-transform:uppercase;font-weight:600">A Pagar</div>
                    <div style="font-size:18px;font-weight:700;color:var(--danger)">R$ ${this.formatMoney(t.total_saidas)}</div>
                </div>
                <div class="kpi-mini" style="background:var(--bg-elevated);border-radius:8px;padding:10px;text-align:center">
                    <div style="font-size:11px;color:${t.saldo_projetado >= 0 ? 'var(--success)' : 'var(--danger)'};text-transform:uppercase;font-weight:600">Saldo Projetado</div>
                    <div style="font-size:18px;font-weight:700;color:${t.saldo_projetado >= 0 ? 'var(--success)' : 'var(--danger)'}">R$ ${this.formatMoney(t.saldo_projetado)}</div>
                </div>
                ${t.vencido_receber > 0 ? `<div class="kpi-mini" style="background:var(--bg-elevated);border-radius:8px;padding:10px;text-align:center;border:1px solid var(--warning)">
                    <div style="font-size:11px;color:var(--warning);text-transform:uppercase;font-weight:600">Vencido (Receber)</div>
                    <div style="font-size:18px;font-weight:700;color:var(--warning)">R$ ${this.formatMoney(t.vencido_receber)}</div>
                </div>` : ''}`;
        }

        // Chart
        const canvas = document.getElementById('cashflow-chart');
        if (canvas && typeof Chart !== 'undefined') {
            // Load Chart.js if not loaded
            if (!window.Chart) {
                const s = document.createElement('script');
                s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
                document.head.appendChild(s);
                await new Promise(r => s.onload = r);
            }
            new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: cf.semanas.map(s => s.label),
                    datasets: [
                        {
                            label: 'Entradas',
                            data: cf.semanas.map(s => s.entradas),
                            backgroundColor: 'rgba(52, 211, 153, 0.7)',
                            borderRadius: 4,
                            order: 2
                        },
                        {
                            label: 'Saídas',
                            data: cf.semanas.map(s => -s.saidas),
                            backgroundColor: 'rgba(248, 113, 113, 0.7)',
                            borderRadius: 4,
                            order: 2
                        },
                        {
                            label: 'Saldo Acumulado',
                            data: cf.semanas.map(s => s.saldo_acumulado),
                            type: 'line',
                            borderColor: '#a78bfa',
                            backgroundColor: 'rgba(167, 139, 250, 0.1)',
                            fill: true,
                            tension: 0.3,
                            pointRadius: 3,
                            pointBackgroundColor: '#a78bfa',
                            borderWidth: 2,
                            order: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { labels: { color: '#94a3b8', font: { size: 11 } } },
                        tooltip: {
                            callbacks: {
                                label: ctx => {
                                    const val = Math.abs(ctx.raw);
                                    return `${ctx.dataset.label}: R$ ${val.toLocaleString('pt-BR', {minimumFractionDigits:2})}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { display: false } },
                        y: {
                            ticks: {
                                color: '#64748b',
                                font: { size: 10 },
                                callback: v => 'R$ ' + (v/1000).toFixed(0) + 'k'
                            },
                            grid: { color: 'rgba(148,163,184,0.1)' }
                        }
                    }
                }
            });
        }

        // Table with weekly details
        const tableEl = document.getElementById('cashflow-table');
        if (tableEl) {
            tableEl.innerHTML = `
            <table style="width:100%;font-size:12px;border-collapse:collapse">
                <thead><tr style="border-bottom:1px solid var(--border)">
                    <th style="text-align:left;padding:4px 8px;color:var(--text-muted)">Semana</th>
                    <th style="text-align:right;padding:4px 8px;color:var(--success)">Entradas</th>
                    <th style="text-align:right;padding:4px 8px;color:var(--danger)">Saídas</th>
                    <th style="text-align:right;padding:4px 8px;color:var(--text-secondary)">Saldo</th>
                    <th style="text-align:right;padding:4px 8px;color:var(--accent)">Acumulado</th>
                </tr></thead>
                <tbody>
                ${cf.semanas.map(s => `<tr style="border-bottom:1px solid var(--border)">
                    <td style="padding:4px 8px">${s.label}</td>
                    <td style="text-align:right;padding:4px 8px;color:var(--success)">R$ ${this.formatMoney(s.entradas)}</td>
                    <td style="text-align:right;padding:4px 8px;color:var(--danger)">R$ ${this.formatMoney(s.saidas)}</td>
                    <td style="text-align:right;padding:4px 8px;color:${s.saldo_semana >= 0 ? 'var(--success)' : 'var(--danger)'}">R$ ${this.formatMoney(s.saldo_semana)}</td>
                    <td style="text-align:right;padding:4px 8px;color:${s.saldo_acumulado >= 0 ? 'var(--accent)' : 'var(--danger)'}"><strong>R$ ${this.formatMoney(s.saldo_acumulado)}</strong></td>
                </tr>`).join('')}
                </tbody>
            </table>`;
        }
    },

    exportarResumo() {
        const d = this._dashData;
        if (!d) return;
        const mesNome = new Date().toLocaleDateString('pt-BR', { month: 'long' }).replace(/^\w/, l => l.toUpperCase());
        const ano = d.ano;
        let txt = `📊 *ABMT Comercial — ${mesNome}/${ano}*\n\n`;
        txt += `💰 *Vendas:* R$ ${this.formatMoney(d.vendas.total_mes)} (${d.vendas.count_mes} OVs)\n`;
        txt += `📦 *Compras:* R$ ${this.formatMoney(d.compras.total_mes)}\n`;
        if (d.margem_bruta !== undefined) txt += `📈 *Margem:* R$ ${this.formatMoney(d.margem_bruta)} (${d.margem_pct}%)\n`;
        txt += `📋 *Propostas abertas:* ${d.vendas.propostas_abertas}\n`;
        txt += `🎯 *Taxa conversão:* ${d.vendas.taxa_conversao}%\n`;
        txt += `💵 *Ticket médio:* R$ ${this.formatMoney(d.vendas.ticket_medio)}\n\n`;
        if (d.ranking_vendedores?.length > 0) {
            txt += `👥 *Equipe:*\n`;
            d.ranking_vendedores.forEach((v, i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
                txt += `${medal} ${sanitize(v.nome)}: R$ ${this.formatMoney(v.realizado)}`;
                if (v.meta > 0) txt += ` (${v.pct}% da meta)`;
                txt += `\n`;
            });
        }
        navigator.clipboard.writeText(txt).then(() => {
            this.toast('Resumo copiado! Cole no WhatsApp 📋', 'success');
        }).catch(() => {
            // Fallback: show in modal
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.onclick = e => { if (e.target === modal) modal.remove(); };
            modal.innerHTML = `<div class="modal"><div class="modal-header"><span class="modal-title">Resumo para WhatsApp</span><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">${LI('x',16)}</button></div><textarea style="width:100%;height:300px;font-size:12px;background:var(--bg-input);color:var(--text-primary);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:monospace" readonly>${txt}</textarea></div>`;
            document.body.appendChild(modal);
            modal.querySelector('textarea').select();
        });
    },

    applyDashFilter() {
        const vendEl = document.getElementById('filter-vendedor');
        const catEl = document.getElementById('filter-categoria');
        const segEl = document.getElementById('filter-segmento');
        const mesEl = document.getElementById('filter-mes');
        const anoEl = document.getElementById('filter-ano');
        this._dashFilterVendedor = vendEl?.value ? parseInt(vendEl.value) : null;
        this._dashFilterCategoria = catEl?.value || null;
        this._dashFilterSegmento = segEl?.value || null;
        this._dashFilterMes = mesEl?.value ? parseInt(mesEl.value) : null;
        this._dashFilterAno = anoEl?.value ? parseInt(anoEl.value) : null;
        this.renderDashboard();
    },

    clearDashFilters() {
        this._dashFilterVendedor = null;
        this._dashFilterCategoria = null;
        this._dashFilterSegmento = null;
        this._dashFilterMes = null;
        this._dashFilterAno = null;
        this.renderDashboard();
    },

    switchDashTab(tab) {
        this._dashTab = tab;
        document.querySelectorAll('.dash-tab').forEach(t => {
            t.classList.toggle('active', t.classList.contains(`tab-${tab}`));
        });
        this._renderDashTab();
        this._loadRecompraAlertas();
    },

    toggleDashValues() {
        this._dashValuesHidden = !this._dashValuesHidden;
        const el = document.getElementById('dash-content');
        if (el) el.classList.toggle('values-hidden', this._dashValuesHidden);
        const icon = document.getElementById('hide-icon');
        const text = document.getElementById('hide-text');
        if (icon) icon.innerHTML = this._dashValuesHidden ? LI('eye',16) : LI('eye-off',16);
        if (text) text.textContent = (this._dashValuesHidden ? 'Mostrar' : 'Ocultar') + ' valores';
    },

    _renderDashTab() {
        const el = document.getElementById('dash-content');
        if (!el) return;
        const d = this._dashData;
        const analytics = this._analyticsData;

        if (this._dashTab === 'vendas') {
            this._renderDashVendas(el, d, analytics);
        } else {
            this._renderDashCompras(el, d, analytics);
        }
    },

    _renderDashVendas(el, d, analytics) {
        const v = d.vendas;
        const insightsV = (d.insights || []).filter(i => i.tipo === 'vendas');
        const trendV = v.total_mes_anterior > 0 ? Math.round((v.total_mes - v.total_mes_anterior) / v.total_mes_anterior * 100) : 0;

        el.innerHTML = `
        <!-- INSIGHTS -->
        ${insightsV.length > 0 ? `
        <div class="insights-grid">
            ${insightsV.map(i => `
            <div class="insight-card insight-${i.cor}">
                <span class="insight-icon">${i.icon}</span>
                <span>${sanitize(i.texto)}</span>
            </div>`).join('')}
        </div>` : ''}

        <!-- VENDAS KPIs -->
        <div class="kpi-grid">
            <div class="kpi-card kpi-green" onclick="APP.navigate('vendas_ovs')">
                <div class="kpi-label">Faturamento do Mês</div>
                <div class="kpi-value green">R$ ${this.formatMoney(v.total_mes)}</div>
                <div class="kpi-sub">${v.count_mes} vendas
                    ${trendV !== 0 ? `· <span class="${trendV > 0 ? 'trend-up' : 'trend-down'}">${trendV > 0 ? LI('arrow-up',12) : LI('arrow-down',12)} ${Math.abs(trendV)}%</span>` : ''}
                </div>
                ${v.total_mes_anterior > 0 ? `<div style="font-size:10px;color:var(--text-muted);margin-top:4px;border-top:1px solid var(--border);padding-top:4px">Mês anterior: R$ ${this.formatMoney(v.total_mes_anterior)}</div>` : ''}
            </div>
            <div class="kpi-card kpi-blue" onclick="APP.navigate('vendas_propostas')">
                <div class="kpi-label">Ticket Médio</div>
                <div class="kpi-value blue">R$ ${this.formatMoney(v.ticket_medio)}</div>
                <div class="kpi-sub">por venda</div>
            </div>
            <div class="kpi-card kpi-yellow" onclick="APP.navigate('vendas_propostas')">
                <div class="kpi-label">Taxa de Conversão</div>
                <div class="kpi-value yellow">${v.taxa_conversao}%</div>
                <div class="kpi-sub">${v.convertidas_mes} de ${v.propostas_mes} propostas</div>
            </div>
            <div class="kpi-card kpi-purple" onclick="APP.navigate('vendas_propostas')">
                <div class="kpi-label">Propostas Abertas</div>
                <div class="kpi-value" style="color:#a78bfa">${v.propostas_abertas}</div>
                <div class="kpi-sub">${v.perdidas_mes} perdidas este mês</div>
            </div>
        </div>

        <!-- SECOND ROW KPIs -->
        <div class="kpi-grid" style="grid-template-columns: repeat(3, 1fr);">
            <div class="kpi-card kpi-orange">
                <div class="kpi-label">Comissão Estimada</div>
                <div class="kpi-value orange">R$ ${this.formatMoney(v.comissao_mes)}</div>
                <div class="kpi-sub">sobre vendas do mês</div>
            </div>
            <div class="kpi-card kpi-green">
                <div class="kpi-label">Clientes Ativos</div>
                <div class="kpi-value green">${v.clientes_unicos}</div>
                <div class="kpi-sub">clientes compraram este mês</div>
            </div>
            ${d.is_gestor ? `
            <div class="kpi-card kpi-blue" onclick="APP.navigate('pipeline')">
                <div class="kpi-label">Pipeline Mês</div>
                <div class="kpi-value">R$ ${this.formatMoney(v.pipeline_mes || 0)}</div>
                <div class="kpi-sub">propostas abertas</div>
            </div>` : `
            <div class="kpi-card kpi-green" onclick="APP.navigate('followups')">
                <div class="kpi-label">Follow-ups Hoje</div>
                <div class="kpi-value" style="color:var(--text-primary)">${d.followups_hoje}</div>
                <div class="kpi-sub">${d.followups_atrasados} atrasados</div>
            </div>`}
        </div>

        <!-- RECOMPRA ALERTS: clients past their purchase cycle -->
        <div id="dash-recompra-alertas" style="margin-top:12px"></div>

        <!-- CHARTS + RANKINGS -->
        <div class="grid-2">
            <div class="card">
                <div class="card-header"><span class="card-title">${LI('trending-up',20)} Vendas ${new Date().getFullYear()}</span></div>
                <canvas id="chart-vendas-anual" height="200"></canvas>
            </div>
            <div class="card">
                <div class="card-header"><span class="card-title">${LI('pie-chart',20)} Mix de Produtos (Vendas)</span></div>
                ${v.por_categoria.length > 0 ? `
                <canvas id="chart-vendas-cat" height="160"></canvas>
                <table class="cat-table" style="margin-top:8px">
                    <thead><tr><th>CATEGORIA</th><th>QTD</th><th>VALOR</th><th>%</th></tr></thead>
                    <tbody>
                        ${v.por_categoria.map(c => {
                            const pct = v.total_mes > 0 ? Math.round(c.valor / v.total_mes * 100) : 0;
                            return `<tr>
                                <td>${c.categoria.replace('de Aço Silício','').trim()}</td>
                                <td>${c.qtd}</td>
                                <td>R$ ${this.formatMoney(c.valor)}</td>
                                <td>${pct}%<div class="cat-bar"><div class="cat-bar-fill green" style="width:${pct}%"></div></div></td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>` : '<div class="empty-state"><p>Sem vendas este mês</p></div>'}
            </div>
        </div>

        ${d.is_gestor ? `
        <div class="grid-2">
            <div class="card">
                <div class="card-header"><span class="card-title">${LI('trophy',20)} Top Clientes do Mês</span></div>
                ${v.top_clientes.length > 0 ? `
                <div class="ranking-list">
                    ${v.top_clientes.map((c, i) => `
                    <div class="ranking-item">
                        <span class="ranking-pos">${i + 1}º</span>
                        <div class="ranking-info">
                            <div class="ranking-name">${sanitize(c.nome)}</div>
                            <div class="ranking-sub">${c.count} pedidos</div>
                        </div>
                        <div class="ranking-value">R$ ${this.formatMoney(c.total)}</div>
                    </div>`).join('')}
                </div>` : '<div class="empty-state"><p>Sem dados</p></div>'}
            </div>
            <div class="card">
                <div class="card-header"><span class="card-title">${LI('users',20)} Vendas por Vendedor</span></div>
                <canvas id="chart-vendedores" height="200"></canvas>
            </div>
        </div>` : ''}`;

        // Animate KPI values
        this._animateKPIs(el);

        // Draw charts
        this._loadChartJS(() => {
            this._drawVendasCharts(analytics, v, d);
        });

        // Load state analytics
        this._loadEstadosVendas();
    },

    async _loadEstadosVendas() {
        const ano = new Date().getFullYear();
        const estados = await this.api(`/api/analytics/estados/${ano}`);
        if (!estados || !estados.vendas_por_uf?.length) return;

        const container = document.getElementById('dash-content');
        if (!container) return;

        // Create the estados section
        const div = document.createElement('div');
        div.className = 'card';
        div.style.marginTop = '16px';
        div.innerHTML = `
            <div class="card-header"><span class="card-title">${LI('map',20)} Vendas por Estado</span></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div>
                    <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:8px">FATURAMENTO POR UF</div>
                    ${estados.vendas_por_uf.sort((a,b) => b.total - a.total).map((e, i) => {
                        const maxVal = estados.vendas_por_uf[0]?.total || 1;
                        const pct = Math.round(e.total / maxVal * 100);
                        return `<div class="estados-bar">
                            <span class="estados-uf" style="color:${i<3?'var(--success)':'var(--text-primary)'}">${e.uf}</span>
                            <div class="estados-track">
                                <div class="estados-fill" style="width:${pct}%;background:${i===0?'var(--success)':i===1?'var(--accent)':'var(--warning)'}">
                                    <span>${e.count} OVs</span>
                                </div>
                            </div>
                            <span class="estados-value">R$ ${this.formatMoney(e.total)}</span>
                        </div>`;
                    }).join('')}
                </div>
                <div>
                    <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:8px">CLIENTES POR UF</div>
                    ${estados.clientes_por_uf.sort((a,b) => b.count - a.count).slice(0, 10).map(e => {
                        const maxCli = estados.clientes_por_uf[0]?.count || 1;
                        const pct = Math.round(e.count / maxCli * 100);
                        return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                            <span style="font-weight:700;width:28px;font-size:13px">${e.uf || '?'}</span>
                            <div style="flex:1;height:20px;background:var(--bg-input);border-radius:4px;overflow:hidden">
                                <div style="height:100%;width:${pct}%;background:var(--accent);border-radius:4px"></div>
                            </div>
                            <span style="font-size:12px;font-weight:600;min-width:60px;text-align:right">${e.count} clientes</span>
                        </div>`;
                    }).join('')}

                    ${estados.categorias_por_uf?.length > 0 ? `
                    <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin:16px 0 8px">TOP CATEGORIA POR UF</div>
                    ${(() => {
                        // Group by UF, get top category per UF
                        const byUf = {};
                        estados.categorias_por_uf.forEach(c => {
                            if (!byUf[c.uf] || c.total > byUf[c.uf].total) byUf[c.uf] = c;
                        });
                        return Object.entries(byUf).sort((a,b) => b[1].total - a[1].total).slice(0, 8).map(([uf, c]) =>
                            `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;border-bottom:1px solid var(--border)">
                                <span style="font-weight:600">${uf}</span>
                                <span style="color:var(--text-secondary)">${c.categoria?.replace('de Aço Silício','').trim()}</span>
                                <span style="font-weight:600">R$ ${this.formatMoney(c.total)}</span>
                            </div>`
                        ).join('');
                    })()}` : ''}
                </div>
            </div>`;
        container.appendChild(div);

        // Load comparativos after estados
        this._loadComparativos();
    },

    async _loadComparativos() {
        const data = await this.api('/api/dashboard/comparativo');
        if (!data) return;
        const container = document.getElementById('dash-content');
        if (!container) return;

        const p = data.periodos;
        const varAnt = p.anterior.vendas > 0 ? Math.round((p.atual.vendas - p.anterior.vendas) / p.anterior.vendas * 100) : 0;
        const varAA = p.mesmo_aa.vendas > 0 ? Math.round((p.atual.vendas - p.mesmo_aa.vendas) / p.mesmo_aa.vendas * 100) : 0;

        let html = `
        <div class="card" style="margin-top:16px">
            <div class="card-header"><span class="card-title">${LI('git-compare',20)} Comparativo de Períodos</span></div>
            <div style="overflow-x:auto">
            <table class="comp-table">
                <thead><tr>
                    <th>Métrica</th>
                    <th class="comp-atual">${p.atual.label}</th>
                    <th>${p.anterior.label}</th>
                    <th>${p.mesmo_aa.label}</th>
                </tr></thead>
                <tbody>
                <tr><td>Vendas</td><td class="comp-atual"><strong>R$ ${this.formatMoney(p.atual.vendas)}</strong></td>
                    <td>R$ ${this.formatMoney(p.anterior.vendas)} <span class="${varAnt>=0?'trend-up':'trend-down'}">${varAnt>=0?'+':''}${varAnt}%</span></td>
                    <td>R$ ${this.formatMoney(p.mesmo_aa.vendas)} <span class="${varAA>=0?'trend-up':'trend-down'}">${varAA>=0?'+':''}${varAA}%</span></td></tr>
                <tr><td>Compras</td><td class="comp-atual"><strong>R$ ${this.formatMoney(p.atual.compras)}</strong></td>
                    <td>R$ ${this.formatMoney(p.anterior.compras)}</td><td>R$ ${this.formatMoney(p.mesmo_aa.compras)}</td></tr>
                <tr><td>Saldo (V-C)</td><td class="comp-atual"><strong class="${p.atual.saldo>=0?'text-green':'text-red'}">R$ ${this.formatMoney(p.atual.saldo)}</strong></td>
                    <td class="${p.anterior.saldo>=0?'text-green':'text-red'}">R$ ${this.formatMoney(p.anterior.saldo)}</td>
                    <td class="${p.mesmo_aa.saldo>=0?'text-green':'text-red'}">R$ ${this.formatMoney(p.mesmo_aa.saldo)}</td></tr>
                <tr><td>Nº OVs</td><td class="comp-atual"><strong>${p.atual.ovs}</strong></td><td>${p.anterior.ovs}</td><td>${p.mesmo_aa.ovs}</td></tr>
                <tr><td>Ticket Médio</td><td class="comp-atual"><strong>R$ ${this.formatMoney(p.atual.ticket_medio)}</strong></td>
                    <td>R$ ${this.formatMoney(p.anterior.ticket_medio)}</td><td>R$ ${this.formatMoney(p.mesmo_aa.ticket_medio)}</td></tr>
                <tr><td>Clientes ativos</td><td class="comp-atual"><strong>${p.atual.clientes}</strong></td><td>${p.anterior.clientes}</td><td>${p.mesmo_aa.clientes}</td></tr>
                </tbody>
            </table>
            </div>
        </div>`;

        // === COMPARATIVO POR VENDEDOR ===
        if (data.vendedores?.length > 0) {
            const maxVendas = Math.max(...data.vendedores.map(v => v.vendas), 1);
            html += `
            <div class="card" style="margin-top:16px">
                <div class="card-header"><span class="card-title">${LI('users',20)} Performance por Vendedor</span></div>
                <div style="overflow-x:auto">
                <table class="comp-table">
                    <thead><tr>
                        <th>Vendedor</th><th>Vendas</th><th>vs Anterior</th>
                        <th>OVs</th><th>Ticket Médio</th><th>Clientes</th><th>Comissão</th>
                    </tr></thead>
                    <tbody>
                    ${data.vendedores.map(v => {
                        const pct = Math.round(v.vendas / maxVendas * 100);
                        const varClass = v.variacao >= 0 ? 'trend-up' : 'trend-down';
                        return `<tr>
                            <td><strong>${sanitize(v.nome)}</strong>
                                <div class="comp-bar"><div class="comp-bar-fill" style="width:${pct}%"></div></div>
                            </td>
                            <td><strong>R$ ${this.formatMoney(v.vendas)}</strong></td>
                            <td><span class="${varClass}">${v.variacao >= 0 ? '+' : ''}${v.variacao}%</span>
                                <div style="font-size:11px;color:var(--text-secondary)">R$ ${this.formatMoney(v.vendas_anterior)}</div></td>
                            <td>${v.qtd_ovs}</td>
                            <td>R$ ${this.formatMoney(v.ticket_medio)}</td>
                            <td>${v.clientes_unicos}</td>
                            <td style="color:var(--success)">R$ ${this.formatMoney(v.comissao)}</td>
                        </tr>`;
                    }).join('')}
                    </tbody>
                </table>
                </div>
            </div>`;
        }

        // === COMPARATIVO POR CATEGORIA (Vendido vs Comprado) ===
        if (data.categorias?.length > 0) {
            html += `
            <div class="card" style="margin-top:16px">
                <div class="card-header"><span class="card-title">${LI('layers',20)} Balanço por Categoria</span></div>
                <div style="overflow-x:auto">
                <table class="comp-table">
                    <thead><tr>
                        <th>Categoria</th><th>Vendido</th><th>Comprado</th><th>Saldo</th>
                        <th>R$/kg Venda</th><th>R$/kg Compra</th>
                    </tr></thead>
                    <tbody>
                    ${data.categorias.map(c => {
                        const saldoClass = c.saldo >= 0 ? 'text-green' : 'text-red';
                        return `<tr>
                            <td><strong>${c.categoria}</strong>
                                <div style="font-size:11px;color:var(--text-secondary)">${c.qtd_vendida}V / ${c.qtd_comprada}C</div></td>
                            <td style="color:var(--success)">R$ ${this.formatMoney(c.vendido)}</td>
                            <td style="color:var(--danger)">R$ ${this.formatMoney(c.comprado)}</td>
                            <td class="${saldoClass}"><strong>R$ ${this.formatMoney(c.saldo)}</strong></td>
                            <td>${c.preco_kg_venda > 0 ? 'R$ ' + this.formatMoney(c.preco_kg_venda) : '—'}</td>
                            <td>${c.preco_kg_compra > 0 ? 'R$ ' + this.formatMoney(c.preco_kg_compra) : '—'}</td>
                        </tr>`;
                    }).join('')}
                    </tbody>
                </table>
                </div>
            </div>`;
        }

        const div = document.createElement('div');
        div.innerHTML = html;
        while (div.firstChild) container.appendChild(div.firstChild);
    },

    _renderDashCompras(el, d, analytics) {
        const c = d.compras;
        const insightsC = (d.insights || []).filter(i => i.tipo === 'compras');
        const trendC = c.total_mes_anterior > 0 ? Math.round((c.total_mes - c.total_mes_anterior) / c.total_mes_anterior * 100) : 0;

        el.innerHTML = `
        <!-- INSIGHTS -->
        ${insightsC.length > 0 ? `
        <div class="insights-grid">
            ${insightsC.map(i => `
            <div class="insight-card insight-${i.cor}">
                <span class="insight-icon">${i.icon}</span>
                <span>${sanitize(i.texto)}</span>
            </div>`).join('')}
        </div>` : ''}

        <!-- COMPRAS KPIs -->
        <div class="kpi-grid">
            <div class="kpi-card kpi-blue" onclick="APP.navigate('compras_ocs')">
                <div class="kpi-label">Total Compras Mês</div>
                <div class="kpi-value blue">R$ ${this.formatMoney(c.total_mes)}</div>
                <div class="kpi-sub">${c.count_mes} ordens
                    ${trendC !== 0 ? `· <span class="${trendC > 0 ? 'trend-up' : 'trend-down'}">${trendC > 0 ? LI('arrow-up',12) : LI('arrow-down',12)} ${Math.abs(trendC)}%</span>` : ''}
                </div>
            </div>
            <div class="kpi-card kpi-green" onclick="APP.navigate('compras_ocs')">
                <div class="kpi-label">Ticket Médio</div>
                <div class="kpi-value green">R$ ${this.formatMoney(c.ticket_medio)}</div>
                <div class="kpi-sub">por compra</div>
            </div>
            <div class="kpi-card kpi-yellow" onclick="APP.navigate('compras_propostas')">
                <div class="kpi-label">Taxa de Conversão</div>
                <div class="kpi-value yellow">${c.taxa_conversao}%</div>
                <div class="kpi-sub">${c.convertidas_mes} de ${c.propostas_mes} propostas</div>
            </div>
            <div class="kpi-card kpi-purple" onclick="APP.navigate('compras_propostas')">
                <div class="kpi-label">Propostas Abertas</div>
                <div class="kpi-value" style="color:#a78bfa">${c.propostas_abertas}</div>
                <div class="kpi-sub">${c.fornecedores_unicos} fornecedores ativos</div>
            </div>
        </div>

        <!-- PREÇO MÉDIO POR CATEGORIA -->
        ${c.analytics_categorias && c.analytics_categorias.length > 0 ? `
        <div class="card">
            <div class="card-header"><span class="card-title">${LI('bar-chart-3',20)} Preço Médio por Material</span></div>
            <div style="overflow-x:auto">
            <table class="cat-table">
                <thead><tr><th>MATERIAL</th><th>QTD</th><th>PESO</th><th>VALOR TOTAL</th><th>PREÇO MÉDIO</th><th>VS MÊS ANT.</th></tr></thead>
                <tbody>
                    ${c.analytics_categorias.map(cat => {
                        const varClass = cat.variacao_preco > 0 ? 'trend-up' : (cat.variacao_preco < 0 ? 'trend-down' : '');
                        const varIcon = cat.variacao_preco > 0 ? LI('arrow-up',12) : (cat.variacao_preco < 0 ? LI('arrow-down',12) : '');
                        const varColor = cat.variacao_preco > 0 ? 'var(--danger)' : (cat.variacao_preco < 0 ? 'var(--success)' : 'var(--text-secondary)');
                        return `<tr>
                            <td><strong>${cat.categoria.replace('de Aço Silício','').trim()}</strong><br><span style="font-size:11px;color:var(--text-secondary)">${cat.unidade}</span></td>
                            <td>${APP.formatNumber(cat.qtd_total)}</td>
                            <td>${cat.peso_total > 0 ? APP.formatNumber(cat.peso_total) + ' kg' : '-'}</td>
                            <td>R$ ${APP.formatMoney(cat.valor_total)}</td>
                            <td><strong>R$ ${APP.formatMoney(cat.preco_medio)}</strong><span style="font-size:11px;color:var(--text-secondary)">/${cat.unidade}</span></td>
                            <td style="color:${varColor}">
                                ${cat.variacao_preco !== 0 ? `${varIcon} ${Math.abs(cat.variacao_preco)}%` : '-'}
                                ${cat.preco_medio_anterior > 0 ? `<br><span style="font-size:10px;color:var(--text-secondary)">ant: R$ ${APP.formatMoney(cat.preco_medio_anterior)}</span>` : ''}
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
            </div>
            ${c.peso_total_mes > 0 ? `<div style="padding:8px 12px;font-size:12px;color:var(--text-secondary);border-top:1px solid var(--border)">Peso total comprado no mês: <strong>${APP.formatNumber(c.peso_total_mes)} kg</strong></div>` : ''}
        </div>` : ''}

        <!-- CHARTS + RANKINGS -->
        <div class="grid-2">
            <div class="card">
                <div class="card-header"><span class="card-title">${LI('trending-up',20)} Compras ${new Date().getFullYear()}</span></div>
                <canvas id="chart-compras-anual" height="200"></canvas>
            </div>
            <div class="card">
                <div class="card-header"><span class="card-title">${LI('pie-chart',20)} Mix de Materiais (Compras)</span></div>
                ${c.por_categoria.length > 0 ? `
                <canvas id="chart-compras-cat" height="160"></canvas>
                <table class="cat-table" style="margin-top:8px">
                    <thead><tr><th>CATEGORIA</th><th>QTD</th><th>VALOR</th><th>%</th></tr></thead>
                    <tbody>
                        ${c.por_categoria.map(cat => {
                            const pct = c.total_mes > 0 ? Math.round(cat.valor / c.total_mes * 100) : 0;
                            return `<tr>
                                <td>${cat.categoria.replace('de Aço Silício','').trim()}</td>
                                <td>${cat.qtd}</td>
                                <td>R$ ${this.formatMoney(cat.valor)}</td>
                                <td>${pct}%<div class="cat-bar"><div class="cat-bar-fill blue" style="width:${pct}%"></div></div></td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>` : '<div class="empty-state"><p>Sem compras este mês</p></div>'}
            </div>
        </div>

        ${d.is_gestor ? `
        <div class="grid-2">
            <div class="card">
                <div class="card-header"><span class="card-title">${LI('factory',20)} Top Fornecedores do Mês</span></div>
                ${c.top_fornecedores.length > 0 ? `
                <div class="ranking-list">
                    ${c.top_fornecedores.map((f, i) => `
                    <div class="ranking-item">
                        <span class="ranking-pos">${i + 1}º</span>
                        <div class="ranking-info">
                            <div class="ranking-name">${sanitize(f.nome)}</div>
                            <div class="ranking-sub">${f.count} compras</div>
                        </div>
                        <div class="ranking-value">R$ ${this.formatMoney(f.total)}</div>
                    </div>`).join('')}
                </div>` : '<div class="empty-state"><p>Sem dados</p></div>'}
            </div>
            <div class="card">
                <div class="card-header"><span class="card-title">${LI('bar-chart-3',20)} Vendas vs Compras ${new Date().getFullYear()}</span></div>
                <canvas id="chart-vendas-vs-compras" height="200"></canvas>
            </div>
        </div>` : ''}

        <!-- OCS PENDENTES DE RECEBIMENTO -->
        ${c.ocs_pendentes && c.ocs_pendentes.length > 0 ? `
        <div class="card">
            <div class="card-header"><span class="card-title">${LI('clock',20)} OCs Pendentes de Recebimento</span></div>
            <div class="ranking-list">
                ${c.ocs_pendentes.map(oc => {
                    const pctRecebido = oc.qtd_total > 0 ? Math.round(oc.qtd_recebida / oc.qtd_total * 100) : 0;
                    const diasColor = oc.dias_aberta > 30 ? 'var(--danger)' : (oc.dias_aberta > 15 ? 'var(--warning)' : 'var(--text-secondary)');
                    return `<div class="ranking-item" style="cursor:pointer" onclick="APP.navigate('oc_view',{id:${oc.id}})">
                        <div class="ranking-info" style="flex:1">
                            <div class="ranking-name" style="color:var(--accent)">${sanitize(oc.numero)}</div>
                            <div class="ranking-sub">${sanitize(oc.fornecedor || '')} · R$ ${APP.formatMoney(oc.valor_total)}</div>
                        </div>
                        <div style="text-align:right">
                            <div style="font-size:12px"><span style="color:${diasColor};font-weight:600">${oc.dias_aberta} dias</span></div>
                            <div style="font-size:11px;color:var(--text-secondary)">Recebido: ${pctRecebido}%</div>
                            <div style="width:60px;height:4px;background:var(--border);border-radius:2px;margin-top:2px">
                                <div style="width:${pctRecebido}%;height:100%;background:${pctRecebido === 100 ? 'var(--success)' : 'var(--accent)'};border-radius:2px"></div>
                            </div>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>` : ''}

        <!-- RECOMPRA ALERTS on Compras tab too -->
        <div id="dash-recompra-alertas-compras" style="margin-top:12px"></div>`;

        // Animate KPI values
        this._animateKPIs(el);

        // Load recompra alertas for compras tab
        this._loadRecompraAlertas('dash-recompra-alertas-compras');

        // Draw charts
        this._loadChartJS(() => {
            this._drawComprasCharts(analytics, c, d);
        });
    },

    _animateKPIs(container) {
        if (!container) return;
        requestAnimationFrame(() => {
            container.querySelectorAll('.kpi-value').forEach(el => {
                const text = el.textContent.trim();
                const match = text.match(/(R\$\s*)?([\d.,]+)(%?)/);
                if (!match) return;
                const prefix = match[1] || '';
                const suffix = match[3] || '';
                const numStr = match[2].replace(/\./g, '').replace(',', '.');
                const target = parseFloat(numStr);
                if (isNaN(target) || target === 0) return;
                const isInteger = !match[2].includes(',') || match[2].endsWith(',00');
                const hasMoney = prefix.includes('R$');
                this.countUp(el, target, prefix, suffix, 800, hasMoney ? 2 : (isInteger ? 0 : 2));
            });
        });
    },

    _loadChartJS(cb) {
        if (!window.Chart) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
            script.onload = cb;
            script.onerror = () => this._showChartsFallback();
            document.head.appendChild(script);
        } else {
            cb();
        }
    },

    _showChartsFallback() {
        document.querySelectorAll('canvas[id^="chart-"]').forEach(el => {
            const wrapper = el.parentElement;
            if (wrapper) {
                wrapper.innerHTML = '<p style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px">📊 Gráficos indisponíveis offline</p>';
            }
        });
    },

    _chartInstances: {},
    _chartColors: { blue: '#4f8cff', green: '#34d399', yellow: '#fbbf24', red: '#f87171', purple: '#a78bfa', orange: '#fb923c' },

    _createChart(canvasId, config) {
        if (this._chartInstances[canvasId]) {
            this._chartInstances[canvasId].destroy();
            delete this._chartInstances[canvasId];
        }
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        const chart = new Chart(ctx, config);
        this._chartInstances[canvasId] = chart;
        return chart;
    },

    _drawVendasCharts(analytics, v, d) {
        const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        const C = this._chartColors;

        // Annual vendas line+bar
        if (document.getElementById('chart-vendas-anual') && analytics) {
            this._createChart('chart-vendas-anual', {
                type: 'bar',
                data: {
                    labels: meses,
                    datasets: [{
                        label: 'Vendas',
                        data: analytics.vendas_por_mes || new Array(12).fill(0),
                        backgroundColor: C.green + '40',
                        borderColor: C.green,
                        borderWidth: 2,
                        borderRadius: 4,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#8b92a5' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                        y: { ticks: { color: '#8b92a5', callback: v => 'R$ ' + (v/1000).toFixed(0) + 'k' }, grid: { color: 'rgba(255,255,255,0.06)' } }
                    }
                }
            });
        }

        // Category doughnut
        if (document.getElementById('chart-vendas-cat') && v.por_categoria.length > 0) {
            const catColors = [C.green, C.blue, C.yellow, C.red, C.purple, C.orange, '#6ee7b7', '#93c5fd'];
            this._createChart('chart-vendas-cat', {
                type: 'doughnut',
                data: {
                    labels: v.por_categoria.map(c => c.categoria.replace('de Aço Silício','').trim()),
                    datasets: [{ data: v.por_categoria.map(c => c.valor), backgroundColor: catColors }]
                },
                options: {
                    responsive: true,
                    cutout: '60%',
                    plugins: { legend: { position: 'right', labels: { color: '#8b92a5', font: { size: 10 }, boxWidth: 12 } } }
                }
            });
        }

        // Vendedores horizontal bar
        if (document.getElementById('chart-vendedores') && v.por_vendedor && Object.keys(v.por_vendedor).length > 0) {
            const vends = Object.entries(v.por_vendedor).sort((a,b) => b[1]-a[1]);
            this._createChart('chart-vendedores', {
                type: 'bar',
                data: {
                    labels: vends.map(([k]) => k),
                    datasets: [{ data: vends.map(([,v]) => v), backgroundColor: [C.green, C.blue, C.yellow, C.orange] }]
                },
                options: {
                    indexAxis: 'y', responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#8b92a5', callback: v => 'R$ ' + (v/1000).toFixed(0) + 'k' }, grid: { color: 'rgba(255,255,255,0.06)' } },
                        y: { ticks: { color: '#e8eaf0' }, grid: { display: false } }
                    }
                }
            });
        }
    },

    _drawComprasCharts(analytics, c, d) {
        const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        const C = this._chartColors;

        // Annual compras
        if (document.getElementById('chart-compras-anual') && analytics) {
            this._createChart('chart-compras-anual', {
                type: 'bar',
                data: {
                    labels: meses,
                    datasets: [{
                        label: 'Compras',
                        data: analytics.compras_por_mes || new Array(12).fill(0),
                        backgroundColor: C.blue + '40',
                        borderColor: C.blue,
                        borderWidth: 2,
                        borderRadius: 4,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#8b92a5' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                        y: { ticks: { color: '#8b92a5', callback: v => 'R$ ' + (v/1000).toFixed(0) + 'k' }, grid: { color: 'rgba(255,255,255,0.06)' } }
                    }
                }
            });
        }

        // Category doughnut
        if (document.getElementById('chart-compras-cat') && c.por_categoria.length > 0) {
            const catColors = [C.blue, C.green, C.yellow, C.red, C.purple, C.orange, '#6ee7b7', '#93c5fd'];
            this._createChart('chart-compras-cat', {
                type: 'doughnut',
                data: {
                    labels: c.por_categoria.map(cat => cat.categoria.replace('de Aço Silício','').trim()),
                    datasets: [{ data: c.por_categoria.map(cat => cat.valor), backgroundColor: catColors }]
                },
                options: {
                    responsive: true,
                    cutout: '60%',
                    plugins: { legend: { position: 'right', labels: { color: '#8b92a5', font: { size: 10 }, boxWidth: 12 } } }
                }
            });
        }

        // Vendas vs Compras comparison
        if (document.getElementById('chart-vendas-vs-compras') && analytics) {
            this._createChart('chart-vendas-vs-compras', {
                type: 'line',
                data: {
                    labels: meses,
                    datasets: [
                        { label: 'Vendas', data: analytics.vendas_por_mes || [], borderColor: C.green, backgroundColor: C.green + '20', fill: true, tension: 0.3, borderWidth: 2, pointRadius: 3 },
                        { label: 'Compras', data: analytics.compras_por_mes || [], borderColor: C.blue, backgroundColor: C.blue + '20', fill: true, tension: 0.3, borderWidth: 2, pointRadius: 3 }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { labels: { color: '#8b92a5' } } },
                    scales: {
                        x: { ticks: { color: '#8b92a5' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                        y: { ticks: { color: '#8b92a5', callback: v => 'R$ ' + (v/1000).toFixed(0) + 'k' }, grid: { color: 'rgba(255,255,255,0.06)' } }
                    }
                }
            });
        }
    },

    renderCharts(data) { /* legacy - kept for compatibility */ },
    _drawCharts(data) {
        if (!data) return;
        this._loadChartJS(() => {
            const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
            const C = this._chartColors;

            // Evolução Mensal - vendas vs compras line chart
            if (document.getElementById('chart-relatorio-mensal')) {
                this._createChart('chart-relatorio-mensal', {
                    type: 'line',
                    data: {
                        labels: meses,
                        datasets: [
                            { label: 'Vendas', data: data.vendas_por_mes || [], borderColor: C.green, backgroundColor: C.green + '20', fill: true, tension: 0.3, borderWidth: 2, pointRadius: 3 },
                            { label: 'Compras', data: data.compras_por_mes || [], borderColor: C.blue, backgroundColor: C.blue + '20', fill: true, tension: 0.3, borderWidth: 2, pointRadius: 3 }
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { labels: { color: '#8b92a5' } } },
                        scales: {
                            x: { ticks: { color: '#8b92a5' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                            y: { ticks: { color: '#8b92a5', callback: v => 'R$ ' + (v/1000).toFixed(0) + 'k' }, grid: { color: 'rgba(255,255,255,0.06)' } }
                        }
                    }
                });
            }

            // Mix de Produtos - doughnut por categoria
            const cats = data.vendas_por_categoria ? Object.entries(data.vendas_por_categoria) : [];
            if (document.getElementById('chart-relatorio-mix') && cats.length > 0) {
                const catColors = [C.green, C.blue, C.yellow, C.red, C.purple, C.orange, '#6ee7b7', '#93c5fd'];
                this._createChart('chart-relatorio-mix', {
                    type: 'doughnut',
                    data: {
                        labels: cats.map(([k]) => k.replace('de Aço Silício','').trim()),
                        datasets: [{ data: cats.map(([,v]) => v), backgroundColor: catColors }]
                    },
                    options: {
                        responsive: true,
                        cutout: '60%',
                        plugins: { legend: { position: 'right', labels: { color: '#8b92a5', font: { size: 10 }, boxWidth: 12 } } }
                    }
                });
            }

            // Vendedores horizontal bar
            const vends = data.vendas_por_vendedor ? Object.entries(data.vendas_por_vendedor).sort((a,b) => b[1]-a[1]) : [];
            if (document.getElementById('chart-relatorio-vendedores') && vends.length > 0) {
                this._createChart('chart-relatorio-vendedores', {
                    type: 'bar',
                    data: {
                        labels: vends.map(([k]) => k),
                        datasets: [{ label: 'Vendas', data: vends.map(([,v]) => v), backgroundColor: [C.green, C.blue, C.yellow, C.orange, C.purple, C.red] }]
                    },
                    options: {
                        indexAxis: 'y', responsive: true,
                        plugins: { legend: { display: false } },
                        scales: {
                            x: { ticks: { color: '#8b92a5', callback: v => 'R$ ' + (v/1000).toFixed(0) + 'k' }, grid: { color: 'rgba(255,255,255,0.06)' } },
                            y: { ticks: { color: '#e8eaf0' }, grid: { display: false } }
                        }
                    }
                });
            }
        });
    },

    // ===== MEU DIA =====
    async renderMeuDia() {
        const el = document.getElementById('page-content');
        el.innerHTML = '<div class="loading">Carregando...</div>';
        const data = await this.api('/api/meu-dia');
        if (!data) return;

        const followupsHtml = data.followups.length ? data.followups.map(f => {
            const clickTarget = f.vinculo_tipo === 'proposta' && f.vinculo_id ? `APP.navigate('proposta_view',{id:${f.vinculo_id}})` :
                                f.vinculo_tipo === 'ov' && f.vinculo_id ? `APP.navigate('ov_view',{id:${f.vinculo_id}})` :
                                f.vinculo_tipo === 'cadastro' && f.vinculo_id ? `APP.navigate('cadastro_view',{id:${f.vinculo_id}})` : '';
            return `
            <div class="card-item ${f.atrasado ? 'border-danger' : ''}" ${clickTarget ? `onclick="${clickTarget}"` : ''} style="${clickTarget ? 'cursor:pointer' : ''}">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <span class="badge ${f.atrasado ? 'badge-danger' : 'badge-primary'}">${f.acao}</span>
                        <strong>${f.cliente || 'Sem cliente'}</strong>
                        ${f.vinculo_label ? `<small class="text-muted"> · ${f.vinculo_label}</small>` : ''}
                    </div>
                    <small class="text-muted">${f.data_hora ? f.data_hora.slice(0,10) : ''}</small>
                </div>
            </div>`;
        }).join('') : '<p class="text-muted" style="padding:12px">Nenhum follow-up pendente</p>';

        const propostasHtml = data.propostas.length ? data.propostas.map(p => `
            <div class="card-item" onclick="APP.navigate('proposta_view',{id:${p.id}})">
                <div class="d-flex justify-content-between">
                    <div>
                        <strong>${p.numero}</strong>
                        <small class="text-muted"> · ${p.cliente || 'Sem cliente'}</small>
                    </div>
                    <span class="badge badge-${p.status === 'Negociação' ? 'warning' : 'info'}">${p.status}</span>
                </div>
                ${p.valor ? `<small class="text-muted">R$ ${Number(p.valor).toLocaleString('pt-BR',{minimumFractionDigits:2})}</small>` : ''}
            </div>
        `).join('') : '<p class="text-muted" style="padding:12px">Nenhuma proposta pendente</p>';

        const recompraHtml = data.recompra.length ? data.recompra.map(r => `
            <div class="card-item" onclick="APP.navigate('cadastro_view',{id:${r.cadastro_id}})">
                <div class="d-flex justify-content-between">
                    <strong>${sanitize(r.nome)}</strong>
                    <span class="badge badge-${r.nivel === 'risco' ? 'danger' : 'warning'}">${r.atraso_dias}d atraso</span>
                </div>
                <small class="text-muted">Freq. média: ${r.frequencia_media}d · Sem comprar: ${r.dias_sem_comprar}d</small>
            </div>
        `).join('') : '<p class="text-muted" style="padding:12px">Nenhum alerta de recompra</p>';

        const rm = data.resumo_mes;
        el.innerHTML = `
        ${this.pageHeader(LI('sun',20)+' Meu Dia')}
        <div class="stats-grid" style="grid-template-columns: repeat(3,1fr)">
            <div class="stat-card">
                <div class="stat-value">${rm.propostas_criadas}</div>
                <div class="stat-label">Propostas no mês</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${rm.ovs_qtd}</div>
                <div class="stat-label">OVs no mês</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">R$ ${Number(rm.ovs_total).toLocaleString('pt-BR',{minimumFractionDigits:0})}</div>
                <div class="stat-label">Faturado no mês</div>
            </div>
        </div>

        <div class="card" style="margin-top:16px">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h3 style="margin:0">Follow-ups</h3>
                <small class="text-muted">${data.followups.filter(f=>f.atrasado).length} atrasados</small>
            </div>
            ${followupsHtml}
        </div>

        <div class="card" style="margin-top:16px">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h3 style="margin:0">Propostas pendentes</h3>
                <button class="btn btn-primary btn-sm" onclick="APP.navigate('proposta_rapida')">+ Proposta rápida</button>
            </div>
            ${propostasHtml}
        </div>

        <div class="card" style="margin-top:16px">
            <div class="card-header"><h3 style="margin:0">Recompra — Clientes atrasados</h3></div>
            ${recompraHtml}
        </div>`;
    },

    // ===== VENDAS =====
    async renderVendas(params = {}) {
        const el = document.getElementById('page-content');
        const tab = params.tab || 'propostas';

        el.innerHTML = `
        ${this.pageHeader(LI('upload',20)+' Vendas', 'dashboard', `
            <button class="btn btn-primary btn-sm" onclick="APP.navigate('proposta_form',{tipo:'VENDA'})">+ Proposta</button>
        `)}
        <div class="tabs">
            <div class="tab ${tab==='propostas'?'active':''}" onclick="APP.renderVendas({tab:'propostas'})">Propostas</div>
            <div class="tab ${tab==='ovs'?'active':''}" onclick="APP.renderVendas({tab:'ovs'})">Ordens de Venda</div>
        </div>
        <div id="vendas-list"><div class="loading">${this.skeletonList(3)}</div></div>`;

        if (tab === 'propostas') await this.loadPropostas('VENDA');
        else await this.loadOVs();
    },

    async loadPropostas(tipo) {
        const status = this.cache[`prop_status_${tipo}`] || '';
        const data = await this.api(`/api/propostas?tipo=${tipo}&status=${status}&only_mine=${this.user.perfil==='vendedor'}`);
        if (!data || data.error || !data.items) {
            const el = document.getElementById('vendas-list') || document.getElementById('compras-list');
            if (el) el.innerHTML = `<div class="empty-state"><p>${data?.error || 'Erro ao carregar propostas'}</p><button class="btn btn-primary btn-sm" onclick="APP.loadPropostas('${tipo}')">Tentar novamente</button></div>`;
            return;
        }

        const el = document.getElementById('vendas-list') || document.getElementById('compras-list');
        if (!el) return;

        const statusCounts = {};
        data.items.forEach(p => { statusCounts[p.status] = (statusCounts[p.status] || 0) + 1; });

        el.innerHTML = `
        <div class="status-chips">
            <div class="status-chip ${!status?'active':''}" onclick="APP.cache['prop_status_${tipo}']='';APP.loadPropostas('${tipo}')">Todas <span class="count">${data.total}</span></div>
            ${['Rascunho','Enviada','Em Negociação','Aprovada','Convertida','Perdida','Expirada'].filter(s => statusCounts[s]).map(s =>
                `<div class="status-chip ${status===s?'active':''}" onclick="APP.cache['prop_status_${tipo}']='${s}';APP.loadPropostas('${tipo}')">${s} <span class="count">${statusCounts[s]||0}</span></div>`
            ).join('')}
        </div>
        ${data.items.length === 0 ? `<div class="empty-state"><div class="empty-icon">${LI('inbox',48)}</div><p>Nenhuma proposta encontrada</p><p class="empty-hint">Crie sua primeira proposta para comecar a vender</p><button class="btn btn-primary btn-sm" onclick="APP.navigate('proposta_form',{tipo:'VENDA'})">${LI('plus',14)} Nova Proposta</button></div>` :
            data.items.map(p => `
            <div class="list-item" onclick="APP.navigate('proposta_view',{id:${p.id}})">
                <div class="list-item-badge">${sanitize(p.numero.replace('PROP-',''))}</div>
                <div class="list-item-content">
                    <div class="list-item-title">${sanitize(p.razao_social || p.nome_fantasia || 'Sem cliente')}</div>
                    <div class="list-item-sub">${sanitize(p.vendedor_nome || '')} · ${this.formatDate(p.data_emissao)}</div>
                </div>
                <div class="list-item-right">
                    <div class="list-item-value">R$ ${this.formatMoney(p.valor_total)}</div>
                    <span class="status-tag status-${this.statusClass(p.status)}">${sanitize(p.status)}</span>
                </div>
            </div>`).join('')}`;
    },

    _ovPage: 1,
    _ovSearch: '',

    async loadOVs(page = 1, append = false) {
        this._ovPage = page;
        const search = this._ovSearch || '';
        const data = await this.api(`/api/ovs?only_mine=${this.user.perfil==='vendedor'}&page=${page}&per_page=20&search=${encodeURIComponent(search)}`);
        if (!data) return;
        const el = document.getElementById('vendas-list');
        if (!el) return;

        const searchBar = `<div style="margin-bottom:12px">
            <input type="text" class="form-control" placeholder="Buscar OV, cliente..." value="${sanitize(search)}"
                oninput="APP._ovSearch=this.value" onkeydown="if(event.key==='Enter'){APP.loadOVs(1);}" style="max-width:400px">
        </div>`;

        const listHTML = data.items.length === 0
            ? `<div class="empty-state"><div class="empty-icon">${LI('inbox',48)}</div><p>Nenhuma ordem de venda</p></div>`
            : data.items.map(ov => `
            <div class="list-item" onclick="APP.navigate('ov_view',{id:${ov.id}})">
                <div class="list-item-badge">${sanitize(ov.numero.replace('OV-','').replace('AEB-',''))}</div>
                <div class="list-item-content">
                    <div class="list-item-title">${sanitize(ov.razao_social || ov.nome_fantasia || 'Sem cliente')}</div>
                    <div class="list-item-sub">${sanitize(ov.vendedor_nome || '')} · ${this.formatDate(ov.data_emissao)}</div>
                </div>
                <div class="list-item-right">
                    <div class="list-item-value">R$ ${this.formatMoney(ov.valor_total)}</div>
                    <span class="status-tag ${ov.status === 'Cancelada' ? 'status-perdida' : 'status-convertida'}">${ov.status === 'Cancelada' ? 'Cancelada' : 'Fechada'}</span>
                </div>
            </div>`).join('');

        const totalPages = Math.ceil(data.total / 20);
        const pagination = data.total > 20 ? `<div style="display:flex;justify-content:center;gap:8px;margin-top:16px;align-items:center">
            ${page > 1 ? `<button class="btn btn-outline btn-sm" onclick="APP.loadOVs(${page-1})">${LI('chevron-left',14)} Anterior</button>` : ''}
            <span style="color:var(--text-secondary);font-size:13px">Página ${page} de ${totalPages} (${data.total} OVs)</span>
            ${page < totalPages ? `<button class="btn btn-outline btn-sm" onclick="APP.loadOVs(${page+1})">Próxima ${LI('chevron-right',14)}</button>` : ''}
        </div>` : `<div style="text-align:center;color:var(--text-secondary);font-size:13px;margin-top:12px">${data.total} ordens de venda</div>`;

        if (append) {
            el.querySelector('.ov-pagination')?.remove();
            el.insertAdjacentHTML('beforeend', listHTML);
        } else {
            el.innerHTML = searchBar + listHTML;
        }
        el.insertAdjacentHTML('beforeend', `<div class="ov-pagination">${pagination}</div>`);
    },

    // ===== COMPRAS =====
    async renderCompras(params = {}) {
        const el = document.getElementById('page-content');
        const tab = params.tab || 'propostas';
        el.innerHTML = `
        ${this.pageHeader(LI('download',20)+' Compras', 'dashboard', `
            <button class="btn btn-primary btn-sm" onclick="APP.navigate('proposta_form',{tipo:'COMPRA'})">+ Proposta</button>
        `)}
        <div class="tabs">
            <div class="tab ${tab==='propostas'?'active':''}" onclick="APP.renderCompras({tab:'propostas'})">Propostas</div>
            <div class="tab ${tab==='ocs'?'active':''}" onclick="APP.renderCompras({tab:'ocs'})">Ordens de Compra</div>
        </div>
        <div id="compras-list"><div class="loading">${this.skeletonList(3)}</div></div>`;

        if (tab === 'propostas') await this.loadPropostas('COMPRA');
        else await this.loadOCs();
    },

    _ocPage: 1,

    async loadOCs(page = 1) {
        this._ocPage = page;
        const data = await this.api(`/api/ocs?only_mine=${this.user.perfil==='vendedor'}&page=${page}&per_page=20`);
        if (!data) return;
        const el = document.getElementById('compras-list');
        if (!el) return;
        const listHTML = data.items.length === 0 ? `<div class="empty-state"><div class="empty-icon">${LI('inbox',48)}</div><p>Nenhuma ordem de compra</p><p class="empty-hint">Crie propostas de compra e converta em ordens</p></div>` :
            data.items.map(oc => `
            <div class="list-item" onclick="APP.navigate('oc_view',{id:${oc.id}})">
                <div class="list-item-badge">${sanitize(oc.numero.replace('OC-',''))}</div>
                <div class="list-item-content">
                    <div class="list-item-title">${sanitize(oc.razao_social || '')}</div>
                    <div class="list-item-sub">${sanitize(oc.comprador_nome || '')} · ${this.formatDate(oc.data_emissao)}</div>
                </div>
                <div class="list-item-right">
                    <div class="list-item-value">R$ ${this.formatMoney(oc.valor_total)}</div>
                    <span class="status-tag status-${this.statusClass(oc.status)}">${sanitize(oc.status)}</span>
                </div>
            </div>`).join('');

        const totalPages = Math.ceil((data.total||0) / 20);
        const pagination = (data.total||0) > 20 ? `<div style="display:flex;justify-content:center;gap:8px;margin-top:16px;align-items:center">
            ${page > 1 ? `<button class="btn btn-outline btn-sm" onclick="APP.loadOCs(${page-1})">${LI('chevron-left',14)} Anterior</button>` : ''}
            <span style="color:var(--text-secondary);font-size:13px">Página ${page} de ${totalPages}</span>
            ${page < totalPages ? `<button class="btn btn-outline btn-sm" onclick="APP.loadOCs(${page+1})">Próxima ${LI('chevron-right',14)}</button>` : ''}
        </div>` : '';

        el.innerHTML = listHTML + pagination;
    },

    // ===== PROPOSAL VIEW =====
    async renderPropostaView(id) {
        const el = document.getElementById('page-content');
        el.innerHTML = `<div class="loading">${this.skeletonDetail()}</div>`;

        const p = await this.api(`/api/propostas/${id}`);
        if (!p) return;
        const isGestor = this.user.perfil !== 'vendedor';

        const vendaBtn = `<button class="btn btn-success" onclick="APP.converterProposta(${id},this)">${LI("check",14)} ${p.tipo==='VENDA'?'Converter em Venda':'Converter em Compra'}</button>`;
        const perdaBtn = `<button class="btn btn-danger" onclick="APP.showLossModal(${id})">${LI("x",14)} Perda</button>`;
        const btnMap = {
            'Rascunho': `<button class="btn btn-primary" onclick="APP.updatePropStatus(${id},'Enviada')">${LI('send',14)} Enviar</button>
                ${vendaBtn} ${perdaBtn}`,
            'Enviada': `<button class="btn btn-warning" onclick="APP.updatePropStatus(${id},'Em Negociação')">${LI('message-circle',14)} Em Negociação</button>
                ${vendaBtn} ${perdaBtn}`,
            'Em Negociação': `${vendaBtn} ${perdaBtn}`,
            'Aprovada': `${vendaBtn}
                ${isGestor ? `<button class="btn btn-outline" onclick="APP.updatePropStatus(${id},'Em Negociação')">${LI('undo-2',14)} Voltar p/ Negociação</button>` : ''}`,
            'Perdida': `<button class="btn btn-outline" onclick="APP.updatePropStatus(${id},'Em Negociação')">${LI("history",14)} Reabrir</button>`,
            'Expirada': `<button class="btn btn-outline" onclick="APP.updatePropStatus(${id},'Em Negociação')">${LI("history",14)} Reabrir</button>`,
        };

        el.innerHTML = `
        ${this.pageHeader(`${p.numero} <span class="status-tag status-${this.statusClass(p.status)}">${p.status}</span>`, p.tipo==='VENDA'?'vendas':'compras')}

        ${p.cliente_parcelas_vencidas > 0 ? `<div class="alert alert-danger">${LI('alert-triangle',16)} CLIENTE COM PENDÊNCIAS</div>` : ''}

        <div class="action-bar">
            ${btnMap[p.status] || ''}
            ${!['Convertida'].includes(p.status) ? `<button class="btn btn-outline" onclick="APP.navigate('proposta_form',{id:${id}})">${LI('edit',14)} Editar</button>` : ''}
            <button class="btn btn-outline" onclick="APP.downloadPDF(${id})">${LI("file-text",14)} PDF</button>
            <button class="btn btn-outline" onclick="APP.whatsappProposta(${id})">${LI("send",14)} WhatsApp</button>
            <button class="btn btn-outline" onclick="APP.duplicarProposta(${id},this)">${LI('clipboard',14)} Duplicar</button>
            ${p.status==='Convertida' && p.ordem_gerada_id ? `<button class="btn btn-outline" onclick="APP.navigate('${p.ordem_gerada_tipo==='OV'?'ov':'oc'}_view',{id:${p.ordem_gerada_id}})">${LI('file-text',14)} Ver ${p.ordem_gerada_tipo}</button>` : ''}
        </div>

        <div class="detail-grid">
            <div class="card">
                <div class="card-header"><span class="card-title">${p.tipo === 'VENDA' ? LI('users',20)+' Cliente' : LI('factory',20)+' Fornecedor'}</span></div>
                <div class="detail-field"><label>Nome</label><span>${sanitize(p.razao_social || '')} ${p.nome_fantasia ? `(${sanitize(p.nome_fantasia)})` : ''}</span></div>
                <div class="detail-field"><label>CNPJ</label><span>${sanitize(p.cliente_cnpj || '')}</span></div>
                <div class="detail-field"><label>Contato</label><span>${sanitize(p.cliente_contato || '')} · ${sanitize(p.contato_whatsapp || '')}</span></div>
                ${p.cliente_regime_tributario ? `<div class="detail-field"><label>Regime</label><span>${p.cliente_regime_tributario}</span></div>` : ''}
                ${p.cliente_uf ? `<div class="cadastro-summary-bar" style="margin-top:8px"><span>${LI('map-pin',14)} ${p.cliente_uf}</span><span>${LI('file-text',14)} ${p.cliente_regime_tributario || '-'}</span><span>${LI('coins',14)} ICMS: ${p.icms_percentual || 0}%</span><span>${LI('receipt',14)} PIS: 9,25%</span></div>` : ''}
                ${p.tipo === 'VENDA' && p.cliente_limite != null ? `
                <div class="limit-bar">
                    <div class="limit-info">
                        <span>Limite: R$ ${this.formatMoney(p.cliente_limite)}</span>
                        <span>Tomado: R$ ${this.formatMoney(p.cliente_limite_tomado)}</span>
                        <span style="color:${(p.cliente_limite_disponivel||0) < 0 ? 'var(--danger)' : 'var(--success)'}">Disponível: R$ ${this.formatMoney(p.cliente_limite_disponivel)}</span>
                    </div>
                    <div class="progress"><div class="progress-bar ${(p.cliente_limite > 0 ? p.cliente_limite_tomado/p.cliente_limite*100 : 0) > 80 ? 'danger' : ''}" style="width:${p.cliente_limite > 0 ? Math.min(100, p.cliente_limite_tomado/p.cliente_limite*100) : 0}%"></div></div>
                </div>` : ''}
            </div>

            <div class="card">
                <div class="card-header"><span class="card-title">${LI('package',20)} Itens (${p.items.length})</span></div>
                ${p.items.map((item, i) => {
                    const specs = JSON.parse(item.campos_especificos || '{}');
                    const specDisplay = Object.entries(specs).filter(([k,v]) => v && !k.startsWith('embalagem_')).map(([k,v]) => `${v}`).join(' · ');
                    const refPrice = this.getRefPrice(item);
                    const embalagemHtml = specs.embalagem_tipo && specs.embalagem_tipo !== 'Sem embalagem'
                        ? `<div class="item-specs" style="color:var(--accent)">${LI('package',14)} ${specs.embalagem_qtd}x ${specs.embalagem_tipo} = R$ ${this.formatMoney(specs.embalagem_custo_total)}</div>`
                        : '';
                    return `<div class="item-row">
                        <div class="item-main">
                            <div class="item-title">${item.categoria}</div>
                            <div class="item-specs">${sanitize(specDisplay)}${item.descricao_complementar ? ` — ${sanitize(item.descricao_complementar)}` : ''}</div>
                            <div class="item-qty">${this.formatNumber(item.quantidade)} ${item.unidade} × R$ ${this.formatMoney(item.valor_unitario)} ${refPrice}</div>
                            ${embalagemHtml}
                        </div>
                        <div class="item-total">R$ ${this.formatMoney(item.valor_total)}</div>
                    </div>`;
                }).join('')}
                <div class="items-footer">
                    <span>${LI('weight',14)} PESO TOTAL: ${this.formatNumber(p.peso_total)} kg</span>
                    <span class="items-total">R$ ${this.formatMoney(p.valor_bruto)}</span>
                </div>
            </div>

            ${p.tipo === 'VENDA' ? `
            <div class="card">
                <div class="card-header"><span class="card-title">${LI('dollar-sign',20)} Valores</span></div>
                <div class="values-table">
                    <div class="value-row"><span>Valor Bruto</span><span>R$ ${this.formatMoney(p.valor_bruto)}</span></div>
                    <div class="value-row sub"><span>PIS (${p.pis_percentual}%)</span><span>- R$ ${this.formatMoney(p.pis_valor)}</span></div>
                    <div class="value-row sub"><span>ICMS (${p.icms_percentual}% — ${p.uf_destino || 'SP'}${p.icms_isento ? ' Isento' : ''})</span><span>- R$ ${this.formatMoney(p.icms_valor)}</span></div>
                    <div class="value-row total"><span>Valor Líquido</span><span>R$ ${this.formatMoney(p.valor_liquido)}</span></div>
                    ${isGestor && p.comissao_estimada != null ? `
                    <div class="value-row sub"><span>Comissão estimada</span><span>- R$ ${this.formatMoney(p.comissao_estimada)}</span></div>
                    <div class="value-row highlight"><span>Valor Final</span><span>R$ ${this.formatMoney(p.valor_final)}</span></div>
                    ` : ''}
                </div>
            </div>` : ''}

            <div class="card">
                <div class="card-header"><span class="card-title">${LI('clipboard',20)} Condições</span></div>
                <div class="detail-field"><label>Pagamento</label><span>${p.forma_pagamento || '-'}${(() => { try { const cond = JSON.parse(p.condicao_pagamento || '{}'); return cond.tipo === 'Personalizado' && cond.descricao ? ` — ${cond.descricao}` : (cond.tipo ? ` (${cond.tipo})` : ''); } catch { return ''; } })()}</span></div>
                <div class="detail-field"><label>Frete</label><span>${p.frete || '-'} ${p.transportadora ? `(${p.transportadora})` : ''} ${p.valor_frete ? `— R$ ${this.formatMoney(p.valor_frete)}` : ''}</span></div>
                ${p.prazo_entrega ? `<div class="detail-field"><label>Prazo</label><span>${p.prazo_entrega}</span></div>` : ''}
                ${p.obs_cliente ? `<div class="detail-field"><label>Obs. cliente</label><span>${sanitize(p.obs_cliente)}</span></div>` : ''}
                ${p.obs_interna && isGestor ? `<div class="detail-field" style="border-left:3px solid var(--warning);padding-left:12px"><label>${LI('alert-triangle',14)} Obs. INTERNA</label><span>${sanitize(p.obs_interna)}</span></div>` : ''}
            </div>
        </div>

        ${p.log?.length > 0 ? `
        <div class="card">
            <div class="card-header"><span class="card-title">${LI('history',20)} Histórico</span></div>
            <div class="timeline">
                ${p.log.slice(0, 10).map(l => `<div class="timeline-item">
                    <div class="timeline-date">${this.formatDateTime(l.created_at)} — ${sanitize(l.user_nome || '')}</div>
                    <div class="timeline-content">${sanitize(l.acao)}: ${sanitize(l.detalhes || '')}</div>
                </div>`).join('')}
            </div>
        </div>` : ''}

        <div class="detail-meta">
            Vendedor: ${p.vendedor_nome || '-'} · Emissão: ${this.formatDate(p.data_emissao)} · Validade: ${this.formatDate(p.data_expiracao)}
        </div>`;
    },

    getRefPrice(item) {
        if (!item.valor_total || !item.quantidade) return '';
        if (item.unidade === 'KG') return `<span class="ref-price">(R$ ${this.formatMoney(item.valor_unitario)}/kg)</span>`;
        if (item.unidade === 'KVA') return `<span class="ref-price">(R$ ${this.formatMoney(item.valor_unitario)}/kVA)</span>`;
        if (item.unidade === 'LITRO') return `<span class="ref-price">(R$ ${this.formatMoney(item.valor_unitario)}/L)</span>`;
        if (item.unidade === 'UNIDADE' && item.peso_total) return `<span class="ref-price">(R$ ${this.formatMoney(item.valor_total / item.peso_total)}/kg)</span>`;
        return '';
    },

    async downloadPDF(id) {
        this.toast('Gerando PDF...');
        window.open(`/api/propostas/${id}/pdf`, '_blank');
    },

    async whatsappProposta(id) {
        const p = await this.api(`/api/propostas/${id}`);
        if (!p || p.error) { this.toast('Erro ao carregar proposta', 'danger'); return; }
        const phone = (p.contato_whatsapp || '').replace(/\D/g, '');
        if (!phone || phone.length < 10) {
            this.toast('Telefone do cliente nao cadastrado', 'warning');
            return;
        }
        const itemsDesc = (p.items || []).map(i => i.categoria).join(', ');
        const msg = encodeURIComponent(`Olá ${p.cliente_contato || ''}! Segue proposta comercial ${p.numero} da ABMT referente a ${itemsDesc}. Valor total: R$ ${this.formatMoney(p.valor_bruto)}. Fico à disposição!`);
        this.downloadPDF(id);
        setTimeout(() => {
            window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank');
        }, 1000);
    },

    async updatePropStatus(id, status, extra = {}) {
        const res = await this.api(`/api/propostas/${id}/status`, { method: 'PUT', body: { status, ...extra } });
        if (res?.ok) { this.toast(`Status: ${status}`, 'success'); this.renderPropostaView(id); }
        else this.toast(res?.error || 'Erro', 'danger');
    },

    async converterProposta(id, btnEl) {
        if (!await this.confirm('Confirma conversão? Será gerada uma ordem com os dados atuais.')) return;
        await this.safeAction(btnEl, async () => {
            const res = await this.api(`/api/propostas/${id}/converter`, { method: 'POST' });
            if (res?.ok) {
                this.toast(`${res.numero} criada!`, 'success');
                if (res.tipo === 'OV' && res.vendedor_id) {
                    const mes = new Date().toISOString().slice(0, 7);
                    const meta = await this.api(`/api/metas/${res.vendedor_id}/${mes}`);
                    if (meta && meta.meta_mensal > 0) this.showMetaModal(meta);
                }
                this.navigate(res.tipo === 'OV' ? 'ov_view' : 'oc_view', { id: res.ordem_id });
            }
            else this.toast(res?.error || 'Erro', 'danger');
        });
    },

    async duplicarProposta(id, btnEl) {
        if (!await this.confirm('Duplicar esta proposta? Uma cópia será criada como Rascunho com data de hoje.')) return;
        await this.safeAction(btnEl, async () => {
            const res = await this.api(`/api/propostas/${id}/duplicar`, { method: 'POST' });
            if (res?.ok) {
                this.toast(`Proposta ${res.numero} criada!`, 'success');
                this.navigate('proposta_view', { id: res.id });
            }
            else this.toast(res?.error || 'Erro ao duplicar', 'danger');
        });
    },

    async repetirPedido(cadastroId, btnEl) {
        if (!await this.confirm('Criar proposta baseada no último pedido deste cliente? Os itens serão copiados — você pode ajustar antes de enviar.')) return;
        await this.safeAction(btnEl, async () => {
            const res = await this.api(`/api/cadastros/${cadastroId}/repetir-pedido`, { method: 'POST' });
            if (res?.ok) {
                this.toast(`Proposta ${res.numero} criada (base: ${res.ov_base})`, 'success');
                this.navigate('proposta_view', { id: res.id });
            }
            else this.toast(res?.error || 'Erro ao criar recompra', 'danger');
        });
    },

    showMetaModal(meta) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.onclick = e => { if (e.target === modal) modal.remove(); };
        const pctMes = meta.meta_mensal > 0 ? Math.round(meta.realizado_mes / meta.meta_mensal * 100) : 0;
        const pctSem = meta.meta_semanal > 0 ? Math.round(meta.realizado_semana / meta.meta_semanal * 100) : 0;
        modal.innerHTML = `<div class="modal">
            <div class="modal-header"><span class="modal-title">${LI("target",20)} Progresso de Meta <span style="cursor:pointer;font-size:13px;color:var(--accent)" onclick="APP.showMetaExplanationModal(null)">${LI('info',14)} Como funciona</span></span><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">${LI('x',16)}</button></div>
            <div style="padding:16px">
                <div class="meta-progress-item">
                    <div style="font-weight:600;margin-bottom:4px">${meta.vendedor_nome} - Meta Mensal</div>
                    <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
                        <span>R$ ${APP.formatMoney(meta.realizado_mes)} / R$ ${APP.formatMoney(meta.meta_mensal)}</span>
                        <span style="font-weight:700;color:${pctMes >= 100 ? 'var(--success)' : 'var(--accent)'}">${pctMes}%</span>
                    </div>
                    <div class="progress"><div class="progress-bar" style="width:${Math.min(100, pctMes)}%;background:${pctMes >= 100 ? 'var(--success)' : 'var(--accent)'}"></div></div>
                </div>
                ${meta.meta_semanal > 0 ? `
                <div class="meta-progress-item" style="margin-top:16px">
                    <div style="font-weight:600;margin-bottom:4px">Meta Semanal</div>
                    <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
                        <span>R$ ${APP.formatMoney(meta.realizado_semana)} / R$ ${APP.formatMoney(meta.meta_semanal)}</span>
                        <span style="font-weight:700;color:${pctSem >= 100 ? 'var(--success)' : 'var(--accent)'}">${pctSem}%</span>
                    </div>
                    <div class="progress"><div class="progress-bar" style="width:${Math.min(100, pctSem)}%;background:${pctSem >= 100 ? 'var(--success)' : 'var(--accent)'}"></div></div>
                </div>` : ''}
            </div>
        </div>`;
        document.body.appendChild(modal);
        setTimeout(() => modal.remove(), 8000);
    },

    showLossModal(id) {
        const motivos = ['Preço alto','Prazo longo','Fechou com concorrente','Cliente desistiu','Sem resposta (>15 dias)','Qualidade/especificação'];
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.onclick = e => { if (e.target === modal) modal.remove(); };
        modal.innerHTML = `<div class="modal"><div class="modal-header"><span class="modal-title">Motivo da perda</span><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">${LI('x',16)}</button></div>
            ${motivos.map(m => `<div class="list-item" onclick="APP.updatePropStatus(${id},'Perdida',{motivo_perda:'${m}'});this.closest('.modal-overlay').remove()"><div class="list-item-content"><div class="list-item-title">${m}</div></div></div>`).join('')}
            <div class="form-group" style="margin-top:12px"><input type="text" id="motivo-outro" class="form-control" placeholder="Outro motivo...">
            <button class="btn btn-danger btn-block" style="margin-top:8px" onclick="APP.updatePropStatus(${id},'Perdida',{motivo_perda:document.getElementById('motivo-outro').value});this.closest('.modal-overlay').remove()">Confirmar</button></div></div>`;
        document.body.appendChild(modal);
    },

    // ===== OV VIEW =====

    async renderOVView(id) {
        const el = document.getElementById('page-content');
        el.innerHTML = `<div class="loading">${this.skeletonDetail()}</div>`;
        const ov = await this.api(`/api/ovs/${id}`);
        if (!ov) return;
        const isGestor = this.user.perfil !== 'vendedor';
        const hoje = new Date().toISOString().split('T')[0];
        const em7d = new Date(Date.now() + 7*86400000).toISOString().split('T')[0];

        el.innerHTML = `
        ${this.pageHeader(`${ov.numero}`, 'vendas')}

        <!-- STATUS BADGE -->
        <div style="margin-bottom:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
            <span class="badge ${({'Cancelada':'badge-danger','Entregue':'badge-success','Faturada':'badge-info','Despachada':'badge-warning','Em Produção':'badge-warning'})[ov.status] || 'badge-success'}" style="font-size:14px;padding:6px 16px">${({'Cancelada':'✕ Cancelada','Entregue':'✓ Entregue','Faturada':'📄 Faturada','Despachada':'🚚 Despachada','Em Produção':'⚙ Em Produção'})[ov.status] || '✓ Aprovada'}</span>
            <span style="color:var(--text-secondary);font-size:13px">Emitida em ${this.formatDate(ov.data_emissao)}</span>
            ${ov.nota_fiscal ? `<span class="badge badge-outline" style="font-size:12px">NF: ${sanitize(ov.nota_fiscal)}</span>` : ''}
        </div>

        <!-- WORKFLOW ACTIONS -->
        ${ov.status !== 'Cancelada' && ov.status !== 'Entregue' ? `
        <div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            <span style="font-size:12px;color:var(--text-secondary)">Avançar:</span>
            ${ov.status === 'Aprovada' ? `
                <button class="btn btn-sm btn-outline" onclick="APP.avancarOV(${id},'Em Produção')">⚙ Em Produção</button>
                <button class="btn btn-sm btn-outline" onclick="APP.avancarOVFaturar(${id})">📄 Faturar</button>
            ` : ''}
            ${ov.status === 'Em Produção' ? `<button class="btn btn-sm btn-outline" onclick="APP.avancarOVFaturar(${id})">📄 Faturar</button>` : ''}
            ${ov.status === 'Faturada' ? `
                <button class="btn btn-sm btn-outline" onclick="APP.avancarOV(${id},'Despachada')">🚚 Despachar</button>
                <button class="btn btn-sm btn-outline" onclick="APP.avancarOV(${id},'Entregue')">✓ Entregue</button>
            ` : ''}
            ${ov.status === 'Despachada' ? `<button class="btn btn-sm btn-outline" onclick="APP.avancarOV(${id},'Entregue')">✓ Entregue</button>` : ''}
        </div>` : ''}

        <!-- ACTION BUTTONS -->
        <div class="action-bar" style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap">
            ${ov.status !== 'Cancelada' ? `<button class="btn btn-outline" onclick="APP.editarOV(${id})">${LI('edit',14)} Editar</button>` : ''}
            <button class="btn btn-outline" onclick="APP.downloadOVPDF(${id})">${LI("file-text",14)} PDF</button>
            <button class="btn btn-outline" onclick="APP.whatsappOV(${id},'${(ov.contato_whatsapp||'').replace(/'/g,'')}','${(ov.razao_social||'').replace(/'/g,'')}','${ov.numero}',${ov.valor_bruto||0})">${LI("send",14)} WhatsApp</button>
            ${ov.status !== 'Cancelada' ? `<button class="btn btn-danger" onclick="APP.cancelarOV(${id})">${LI("x",14)} Cancelar</button>` : ''}
        </div>

        <div class="detail-grid">
            <!-- CLIENTE CARD -->
            <div class="card">
                <div class="card-header"><span class="card-title">${LI("users",20)} Cliente</span></div>
                <div class="detail-field"><label>Nome</label><span>${sanitize(ov.razao_social || '')}</span></div>
                <div class="detail-field"><label>CNPJ</label><span>${sanitize(ov.cnpj_cpf || '')}</span></div>
                <div class="detail-field"><label>Vendedor</label><span>${sanitize(ov.vendedor_nome || '')}</span></div>
            </div>

            <!-- ITENS CARD -->
            <div class="card">
                <div class="card-header"><span class="card-title">${LI('package',20)} Itens (${ov.items.length})</span></div>
                ${ov.items.map(item => {
                    const specs = JSON.parse(item.campos_especificos || '{}');
                    return `<div class="item-row">
                        <div class="item-main">
                            <div class="item-title">${item.categoria}</div>
                            <div class="item-qty">${this.formatNumber(item.quantidade)} ${item.unidade} x R$ ${this.formatMoney(item.valor_unitario)}</div>
                            ${isGestor && item.comissao_percentual != null ? `<div class="item-specs">Comissao: ${item.comissao_percentual}% = R$ ${this.formatMoney(item.comissao_valor)}</div>` : ''}
                        </div>
                        <div class="item-total">R$ ${this.formatMoney(item.valor_total)}</div>
                    </div>`;
                }).join('')}
                <div class="values-table" style="margin-top:12px">
                    <div class="value-row"><span>Valor Bruto</span><span>R$ ${this.formatMoney(ov.valor_bruto)}</span></div>
                    <div class="value-row sub"><span>PIS</span><span>- R$ ${this.formatMoney(ov.pis_valor)}</span></div>
                    <div class="value-row sub"><span>ICMS</span><span>- R$ ${this.formatMoney(ov.icms_valor)}</span></div>
                    <div class="value-row total"><span>Valor Liquido</span><span>R$ ${this.formatMoney(ov.valor_liquido)}</span></div>
                    ${isGestor ? `<div class="value-row highlight"><span>Comissao Total</span><span>R$ ${this.formatMoney(ov.comissao_total)}</span></div>` : ''}
                </div>
            </div>

            <!-- PARCELAS CARD -->
            ${ov.parcelas?.length > 0 ? `
            <div class="card">
                <div class="card-header"><span class="card-title">${LI("wallet",20)} Parcelas (${ov.parcelas.length})</span></div>
                ${ov.parcelas.map(p => {
                    const venc = p.data_vencimento;
                    const isPaga = p.status === 'Paga';
                    const isParcial = p.status === 'Paga Parcial';
                    const borderColor = isPaga ? 'var(--success)' : (p.status === 'Vencida' || (p.status !== 'Paga' && venc < hoje) ? 'var(--danger)' : (isParcial ? '#f59e0b' : (venc <= em7d ? 'var(--warning)' : 'var(--text-secondary)')));
                    const statusLabel = isPaga ? 'Paga' : (isParcial ? `Parcial (R$ ${this.formatMoney(p.valor_recebido||0)})` : (venc < hoje ? 'Vencida' : (venc <= em7d ? 'Vence breve' : 'A vencer')));
                    return `<div class="parcela-row" style="border-left:3px solid ${borderColor};padding-left:8px;margin-bottom:6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                    <span class="parcela-num">${p.numero_parcela}/${p.total_parcelas}</span>
                    <span>R$ ${this.formatMoney(p.valor)}</span>
                    <span>${this.formatDate(p.data_vencimento)}</span>
                    <span class="status-tag status-${isPaga?'aprovada':(isParcial?'rascunho':(p.status==='Vencida'||venc<hoje?'perdida':'rascunho'))}">${statusLabel}</span>
                    ${isGestor && !isPaga ? `<button class="btn btn-sm btn-outline" style="padding:2px 8px;font-size:11px" onclick="APP.baixaParcial(${p.id},${p.valor},${p.valor_recebido||0},${id})">💰 Baixa</button>` : ''}
                </div>`;
                }).join('')}
            </div>` : ''}

            <!-- CONDICOES CARD -->
            <div class="card">
                <div class="card-header"><span class="card-title">${LI('clipboard',20)} Condicoes</span></div>
                <div class="detail-field"><label>Pagamento</label><span>${ov.forma_pagamento || '-'}${(() => { try { const cond = JSON.parse(ov.condicao_pagamento || '{}'); return cond.tipo ? ` (${cond.tipo})` : ''; } catch { return ''; } })()}</span></div>
                <div class="detail-field"><label>Frete</label><span>${ov.frete || '-'} ${ov.transportadora ? `(${ov.transportadora})` : ''}</span></div>
                ${ov.prazo_entrega ? `<div class="detail-field"><label>Prazo Entrega</label><span>${ov.prazo_entrega}</span></div>` : ''}
            </div>

            <!-- LOGISTICA CARD -->
            <div class="card">
                <div class="card-header"><span class="card-title">${LI("package",20)} Logistica</span></div>
                <div class="detail-field"><label>Frete</label><span>${ov.frete || 'CIF'} ${ov.valor_frete ? `— R$ ${this.formatMoney(ov.valor_frete)}` : ''}</span></div>
                <div class="detail-field"><label>Transportadora</label><span>${sanitize(ov.transportadora || '-')}</span></div>
                <div class="detail-field"><label>Data Emissao</label><span>${this.formatDate(ov.data_emissao)}</span></div>
                ${ov.data_entrega ? `<div class="detail-field"><label>Data Entrega</label><span>${this.formatDate(ov.data_entrega)}</span></div>` : ''}
            </div>

            ${isGestor ? `
            <!-- MARGEM / VINCULOS CARD -->
            <div class="card" id="ov-links-card">
                <div class="card-header">
                    <span class="card-title">${LI("git-merge",20)} Operação Comercial</span>
                    <button class="btn btn-sm btn-outline" onclick="APP.showLinkModal('ov',${id})">${LI('plus',14)} Vincular Compra</button>
                </div>
                ${(() => {
                    const hasLegacy = ov.linked_ocs && ov.linked_ocs.length > 0;
                    const hasItems = ov.linked_oc_items && ov.linked_oc_items.length > 0;
                    if (!hasLegacy && !hasItems) return `<div class="empty-state" style="padding:16px"><p style="color:var(--text-secondary);font-size:13px">Nenhuma compra vinculada. Vincule OCs para calcular a margem desta venda.</p></div>`;

                    let html = '';

                    // Legacy links (old system)
                    if (hasLegacy) {
                        html += ov.linked_ocs.map(l => `<div class="item-row" style="align-items:center">
                            <div class="item-main">
                                <div class="item-title" style="cursor:pointer;color:var(--accent)" onclick="APP.navigate('oc_view',{id:${l.oc_id}})">${l.oc_numero}</div>
                                <div class="item-qty">${sanitize(l.fornecedor || '')} ${l.descricao ? '· ' + sanitize(l.descricao) : ''}</div>
                            </div>
                            <div style="text-align:right;display:flex;align-items:center;gap:8px">
                                <span style="color:var(--danger)">- R$ ${this.formatMoney(l.valor_alocado_compra || l.oc_valor_total)}</span>
                                <button class="btn btn-sm btn-danger" style="padding:2px 6px" onclick="APP.removeLinkOcOv(${l.id},${id},'ov')" title="Remover">✕</button>
                            </div>
                        </div>`).join('');
                    }

                    // Item-level links (new system) — grouped by OC
                    if (hasItems) {
                        const grouped = {};
                        ov.linked_oc_items.forEach(li => {
                            if (!grouped[li.oc_id]) grouped[li.oc_id] = { oc_numero: li.oc_numero, fornecedor: li.fornecedor, items: [] };
                            grouped[li.oc_id].items.push(li);
                        });
                        Object.entries(grouped).forEach(([ocId, g]) => {
                            html += `<div style="border:1px solid var(--border);border-radius:8px;padding:10px;margin:8px 0">
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                                    <div>
                                        <span style="font-weight:600;cursor:pointer;color:var(--accent)" onclick="APP.navigate('oc_view',{id:${ocId}})">${sanitize(g.oc_numero)}</span>
                                        <span style="font-size:12px;color:var(--text-secondary);margin-left:6px">${sanitize(g.fornecedor || '')}</span>
                                    </div>
                                    <span style="font-size:12px;color:var(--danger);font-weight:600">- R$ ${this.formatMoney(g.items.reduce((s,i) => s + (i.valor_total_alocado||0), 0))}</span>
                                </div>
                                ${g.items.map(li => `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;font-size:12px;border-top:1px solid var(--border)">
                                    <div>
                                        <span style="font-weight:500">${sanitize(li.categoria)}</span>
                                        <span style="color:var(--text-secondary);margin-left:4px">${APP.formatNumber(li.quantidade_alocada)} ${li.unidade}</span>
                                    </div>
                                    <div style="display:flex;align-items:center;gap:6px">
                                        <span style="color:var(--danger)">R$ ${this.formatMoney(li.valor_total_alocado)}</span>
                                        <button class="btn btn-sm btn-danger" style="padding:1px 4px;font-size:10px" onclick="APP.removeLinkItemOcOv(${li.id},${id},'ov')" title="Remover">✕</button>
                                    </div>
                                </div>`).join('')}
                            </div>`;
                        });
                    }

                    // Margin summary
                    html += `<div class="values-table" style="margin-top:12px">
                        <div class="value-row"><span>Receita Bruta</span><span style="color:var(--success)">R$ ${this.formatMoney(ov.valor_bruto)}</span></div>
                        <div class="value-row"><span>Custo Vinculado</span><span style="color:var(--danger)">- R$ ${this.formatMoney(ov.custo_total_vinculado)}</span></div>
                        <div class="value-row total"><span>Margem</span><span style="color:${ov.margem_pct >= 0 ? 'var(--success)' : 'var(--danger)'}">R$ ${this.formatMoney(ov.margem_valor)} (${ov.margem_pct?.toFixed(1)}%)</span></div>
                    </div>`;
                    return html;
                })()}
            </div>` : ''}
        </div>

        ${ov.log?.length > 0 ? `
        <div class="card" style="margin-top:16px">
            <div class="card-header"><span class="card-title">${LI('history',20)} Historico</span></div>
            <div class="timeline">
                ${ov.log.slice(0, 10).map(l => `<div class="timeline-item">
                    <div class="timeline-date">${this.formatDateTime(l.created_at)} — ${sanitize(l.user_nome || '')}</div>
                    <div class="timeline-content">${sanitize(l.acao)}: ${sanitize(l.detalhes || '')}</div>
                </div>`).join('')}
            </div>
        </div>` : ''}`;
    },

    async downloadOVPDF(id) {
        this.toast('Gerando PDF...');
        window.open(`/api/ovs/${id}/pdf`, '_blank');
    },

    whatsappOV(id, phone, nome, numero, valor) {
        const cleanPhone = (phone || '').replace(/\D/g, '');
        if (!cleanPhone || cleanPhone.length < 10) {
            this.toast('Telefone do cliente nao cadastrado', 'warning');
            return;
        }
        const msg = encodeURIComponent(`Ola! Segue ordem de venda ${numero} da ABMT. Valor: R$ ${this.formatMoney(valor)}. Qualquer duvida estou a disposicao!`);
        window.open(`https://wa.me/55${cleanPhone}?text=${msg}`, '_blank');
    },

    async avancarOV(id, novoStatus) {
        const res = await this.api(`/api/ovs/${id}/status`, { method: 'PUT', body: { status: novoStatus } });
        if (res?.ok) { this.toast(`Status atualizado: ${novoStatus}`); this.renderOVView(id); }
        else this.toast(res?.error || 'Erro', 'danger');
    },

    async avancarOVFaturar(id) {
        const nf = await this.prompt('Número da Nota Fiscal (opcional):');
        if (nf === null) return;
        const res = await this.api(`/api/ovs/${id}/status`, { method: 'PUT', body: { status: 'Faturada', nota_fiscal: nf || undefined } });
        if (res?.ok) { this.toast('OV Faturada'); this.renderOVView(id); }
        else this.toast(res?.error || 'Erro', 'danger');
    },

    async editarOV(id) {
        const ov = await this.api(`/api/ovs/${id}`);
        if (!ov) return;
        this.showModal('Editar OV', `
            <div class="form-group"><label>Nota Fiscal</label><input id="ov-edit-nf" class="form-control" value="${sanitize(ov.nota_fiscal||'')}"></div>
            <div class="form-group"><label>Número Omie</label><input id="ov-edit-omie" class="form-control" value="${sanitize(ov.numero_omie||'')}"></div>
            <div class="form-group"><label>Data Entrega Prevista</label><input type="date" id="ov-edit-entrega" class="form-control" value="${ov.data_entrega_prevista||''}"></div>
            <div class="form-group"><label>Transportadora</label><input id="ov-edit-transp" class="form-control" value="${sanitize(ov.transportadora||'')}"></div>
            <div class="form-group"><label>Observações</label><textarea id="ov-edit-obs" class="form-control" rows="3">${sanitize(ov.observacoes||'')}</textarea></div>
            <button class="btn btn-primary" onclick="APP._salvarEditOV(${id})">Salvar</button>
        `);
    },

    async _salvarEditOV(id) {
        const body = {
            nota_fiscal: document.getElementById('ov-edit-nf').value,
            numero_omie: document.getElementById('ov-edit-omie').value,
            data_entrega_prevista: document.getElementById('ov-edit-entrega').value,
            transportadora: document.getElementById('ov-edit-transp').value,
            observacoes: document.getElementById('ov-edit-obs').value
        };
        const res = await this.api(`/api/ovs/${id}`, { method: 'PUT', body });
        if (res?.ok) { this.closeModal(); this.toast('OV atualizada'); this.renderOVView(id); }
        else this.toast(res?.error || 'Erro', 'danger');
    },

    async baixaParcial(parcelaId, valorTotal, valorJaRecebido, ovId) {
        this._baixaOvId = ovId;
        const restante = valorTotal - (valorJaRecebido || 0);
        const html = `
            <div class="form-group"><label>Valor da parcela</label><span style="font-size:16px;font-weight:600">R$ ${this.formatMoney(valorTotal)}</span></div>
            ${valorJaRecebido > 0 ? `<div class="form-group"><label>Já recebido</label><span style="color:var(--success)">R$ ${this.formatMoney(valorJaRecebido)}</span></div>` : ''}
            <div class="form-group"><label>Valor a receber agora</label><input type="number" step="0.01" id="baixa-valor" class="form-control" value="${restante.toFixed(2)}" max="${restante.toFixed(2)}"></div>
            <div class="form-group"><label>Data pagamento</label><input type="date" id="baixa-data" class="form-control" value="${new Date().toISOString().split('T')[0]}"></div>
            <div style="display:flex;gap:8px;margin-top:12px">
                <button class="btn btn-primary" onclick="APP._confirmarBaixa(${parcelaId})">Confirmar</button>
                <button class="btn btn-outline" onclick="APP.closeModal()">Cancelar</button>
            </div>
        `;
        this.showModal('Baixa de Parcela', html);
    },

    async _confirmarBaixa(parcelaId) {
        const valor = parseFloat(document.getElementById('baixa-valor').value);
        const data = document.getElementById('baixa-data').value;
        if (!valor || valor <= 0) return this.toast('Informe um valor', 'warning');
        const res = await this.api(`/api/parcelas/${parcelaId}/baixa-parcial`, { method: 'POST', body: { valor_pago: valor, data_pagamento: data } });
        if (res?.ok) {
            this.closeModal();
            this.toast(`Baixa registrada (${res.novo_status})`);
            if (this._baixaOvId) this.renderOVView(this._baixaOvId);
            else this.navigate(this.currentPage);
        }
        else this.toast(res?.error || 'Erro', 'danger');
    },

    async cancelarOV(id) {
        if (!await this.confirm('Tem certeza que deseja cancelar esta OV? Esta acao nao pode ser desfeita.')) return;
        const motivo = await this.prompt('Motivo do cancelamento:');
        if (motivo === null) return;
        const res = await this.api(`/api/ovs/${id}/status`, { method: 'PUT', body: { status: 'Cancelada', motivo } });
        if (res?.ok) { this.toast('OV cancelada'); this.renderOVView(id); }
        else this.toast(res?.error || 'Erro', 'danger');
    },

    // ===== OC VIEW =====
    async renderOCView(id) {
        const el = document.getElementById('page-content');
        el.innerHTML = `<div class="loading">${this.skeletonDetail()}</div>`;
        const oc = await this.api(`/api/ocs/${id}`);
        if (!oc) return;

        el.innerHTML = `
        ${this.pageHeader(`${oc.numero} <span class="status-tag status-${this.statusClass(oc.status)}">${oc.status}</span>`, 'compras')}

        <div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            ${oc.nota_fiscal ? `<span class="badge badge-outline" style="font-size:12px">NF: ${sanitize(oc.nota_fiscal)}</span>` : ''}
            ${oc.status !== 'Cancelada' ? `<button class="btn btn-sm btn-outline" onclick="APP.editarOC(${id})">${LI('edit',14)} Editar</button>` : ''}
        </div>

        <div class="detail-grid">
            <div class="card">
                <div class="card-header"><span class="card-title">${LI("factory",20)} Fornecedor</span></div>
                <div class="detail-field"><label>Nome</label><span>${sanitize(oc.razao_social || '')}</span></div>
                <div class="detail-field"><label>CNPJ</label><span>${sanitize(oc.cnpj_cpf || '')}</span></div>
                <div class="detail-field"><label>Comprador</label><span>${sanitize(oc.comprador_nome || '')}</span></div>
            </div>

            <div class="card">
                <div class="card-header"><span class="card-title">${LI('package',20)} Itens</span></div>
                ${oc.items.map(item => {
                    const alocacoes = item.alocacoes || [];
                    const totalAlocado = item.total_alocado || 0;
                    const saldo = item.saldo_disponivel != null ? item.saldo_disponivel : item.quantidade;
                    const temAlocacao = alocacoes.length > 0;
                    return `<div class="item-row" style="flex-direction:column;align-items:stretch">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start">
                        <div class="item-main">
                            <div class="item-title">${item.categoria}</div>
                            <div class="item-qty">${this.formatNumber(item.quantidade)} ${item.unidade} × R$ ${this.formatMoney(item.valor_unitario)}</div>
                            <div class="item-specs">Recebido: ${item.quantidade_recebida || 0} / ${item.quantidade} <span class="status-tag status-${item.status==='Recebido Total'?'aprovada':(item.status==='Recebido Parcial'?'negociacao':'rascunho')}">${item.status}</span></div>
                            ${item.status !== 'Recebido Total' ? `<button class="btn btn-sm btn-outline" style="margin-top:4px" onclick="APP.receberOCItem(${id},${item.id},${item.quantidade})">${LI('package',14)} Receber</button>` : ''}
                        </div>
                        <div class="item-total">R$ ${this.formatMoney(item.valor_total)}</div>
                    </div>
                    ${temAlocacao ? `<div style="margin-top:6px;padding:6px 8px;background:var(--bg-elevated);border-radius:6px;font-size:11px">
                        <div style="display:flex;justify-content:space-between;margin-bottom:4px;color:var(--text-secondary)">
                            <span>Alocado: ${this.formatNumber(totalAlocado)} ${item.unidade}</span>
                            <span style="color:${saldo > 0.001 ? 'var(--accent)' : 'var(--text-secondary)'}">Disponivel: ${this.formatNumber(saldo)} ${item.unidade}</span>
                        </div>
                        ${alocacoes.map(a => `<div style="display:flex;justify-content:space-between;padding:2px 0">
                            <span style="cursor:pointer;color:var(--accent)" onclick="APP.navigate('ov_view',{id:${a.ov_id}})">${a.ov_numero}</span>
                            <span>${this.formatNumber(a.quantidade_alocada)} ${item.unidade}</span>
                        </div>`).join('')}
                    </div>` : `<div style="margin-top:4px;font-size:11px;color:var(--text-secondary)">Disponivel: ${this.formatNumber(saldo)} ${item.unidade}</div>`}
                </div>`;
                }).join('')}
                <div class="items-footer"><span></span><span class="items-total">R$ ${this.formatMoney(oc.valor_total)}</span></div>
            </div>

            ${oc.intermediario_nome ? `<div class="card">
                <div class="card-header"><span class="card-title">${LI("users",20)} Intermediário</span></div>
                <div class="detail-field"><label>Nome</label><span>${sanitize(oc.intermediario_nome)}</span></div>
                <div class="detail-field"><label>Comissão</label><span>${oc.intermediario_comissao_tipo === 'percentual' ? `${oc.intermediario_comissao_valor}%` : `R$ ${this.formatMoney(oc.intermediario_comissao_valor)}`}</span></div>
            </div>` : ''}

            <!-- MARGEM / VINCULOS CARD -->
            <div class="card" id="oc-links-card">
                <div class="card-header">
                    <span class="card-title">${LI("git-merge",20)} Operação Comercial</span>
                    <button class="btn btn-sm btn-outline" onclick="APP.showLinkModal('oc',${id})">${LI('plus',14)} Vincular Venda</button>
                </div>
                ${(() => {
                    const hasLegacy = oc.linked_ovs && oc.linked_ovs.length > 0;
                    // Collect item-level links grouped by OV
                    const itemLinksByOV = {};
                    (oc.items || []).forEach(item => {
                        (item.alocacoes || []).forEach(a => {
                            if (!itemLinksByOV[a.ov_id]) itemLinksByOV[a.ov_id] = { ov_numero: a.ov_numero, items: [] };
                            itemLinksByOV[a.ov_id].items.push({ ...a, categoria: item.categoria, unidade: item.unidade, link_id: a.id });
                        });
                    });
                    const hasItemLinks = Object.keys(itemLinksByOV).length > 0;

                    if (!hasLegacy && !hasItemLinks) return `<div class="empty-state" style="padding:16px"><p style="color:var(--text-secondary);font-size:13px">Nenhuma venda vinculada. Vincule OVs para calcular a margem desta compra.</p></div>`;

                    let html = '';

                    // Legacy links
                    if (hasLegacy) {
                        html += oc.linked_ovs.map(l => `<div class="item-row" style="align-items:center">
                            <div class="item-main">
                                <div class="item-title" style="cursor:pointer;color:var(--accent)" onclick="APP.navigate('ov_view',{id:${l.ov_id}})">${l.ov_numero}</div>
                                <div class="item-qty">${sanitize(l.cliente || '')} · ${sanitize(l.vendedor_nome || '')} ${l.descricao ? '· ' + sanitize(l.descricao) : ''}</div>
                            </div>
                            <div style="text-align:right;display:flex;align-items:center;gap:8px">
                                <span style="color:var(--success)">+ R$ ${this.formatMoney(l.valor_alocado_venda || l.ov_valor_total)}</span>
                                <button class="btn btn-sm btn-danger" style="padding:2px 6px" onclick="APP.removeLinkOcOv(${l.id},${id},'oc')" title="Remover">✕</button>
                            </div>
                        </div>`).join('');
                    }

                    // Item-level links grouped by OV
                    if (hasItemLinks) {
                        Object.entries(itemLinksByOV).forEach(([ovId, g]) => {
                            const totalOV = g.items.reduce((s, i) => s + (i.valor_total_alocado || 0), 0);
                            html += `<div style="border:1px solid var(--border);border-radius:8px;padding:10px;margin:8px 0">
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                                    <span style="font-weight:600;cursor:pointer;color:var(--accent)" onclick="APP.navigate('ov_view',{id:${ovId}})">${sanitize(g.ov_numero)}</span>
                                    <span style="font-size:12px;color:var(--success);font-weight:600">+ R$ ${this.formatMoney(totalOV)}</span>
                                </div>
                                ${g.items.map(li => `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;font-size:12px;border-top:1px solid var(--border)">
                                    <div>
                                        <span style="font-weight:500">${sanitize(li.categoria)}</span>
                                        <span style="color:var(--text-secondary);margin-left:4px">${APP.formatNumber(li.quantidade_alocada)} ${li.unidade}</span>
                                    </div>
                                    <div style="display:flex;align-items:center;gap:6px">
                                        <span style="color:var(--success)">R$ ${this.formatMoney(li.valor_total_alocado)}</span>
                                        <button class="btn btn-sm btn-danger" style="padding:1px 4px;font-size:10px" onclick="APP.removeLinkItemOcOv(${li.link_id},${id},'oc')" title="Remover">✕</button>
                                    </div>
                                </div>`).join('')}
                            </div>`;
                        });
                    }

                    // Margin summary
                    html += `<div class="values-table" style="margin-top:12px">
                        <div class="value-row"><span>Receita Vinculada</span><span style="color:var(--success)">R$ ${this.formatMoney(oc.receita_total_vinculada)}</span></div>
                        <div class="value-row"><span>Custo Compra</span><span style="color:var(--danger)">- R$ ${this.formatMoney(oc.valor_total)}</span></div>
                        <div class="value-row total"><span>Margem</span><span style="color:${oc.margem_pct >= 0 ? 'var(--success)' : 'var(--danger)'}">R$ ${this.formatMoney(oc.margem_valor)} (${oc.margem_pct?.toFixed(1)}%)</span></div>
                    </div>`;
                    return html;
                })()}
            </div>
        </div>`;
    },

    async editarOC(id) {
        const oc = await this.api(`/api/ocs/${id}`);
        if (!oc) return;
        this.showModal('Editar OC', `
            <div class="form-group"><label>Nota Fiscal Fornecedor</label><input id="oc-edit-nf" class="form-control" value="${sanitize(oc.nota_fiscal||'')}"></div>
            <div class="form-group"><label>Número Omie</label><input id="oc-edit-omie" class="form-control" value="${sanitize(oc.numero_omie||'')}"></div>
            <div class="form-group"><label>Data Entrega Prevista</label><input type="date" id="oc-edit-entrega" class="form-control" value="${oc.data_entrega_prevista||''}"></div>
            <div class="form-group"><label>Transportadora</label><input id="oc-edit-transp" class="form-control" value="${sanitize(oc.transportadora||'')}"></div>
            <div class="form-group"><label>Observações</label><textarea id="oc-edit-obs" class="form-control" rows="3">${sanitize(oc.observacoes||'')}</textarea></div>
            <button class="btn btn-primary" onclick="APP._salvarEditOC(${id})">Salvar</button>
        `);
    },

    async _salvarEditOC(id) {
        const body = {
            nota_fiscal: document.getElementById('oc-edit-nf').value,
            numero_omie: document.getElementById('oc-edit-omie').value,
            data_entrega_prevista: document.getElementById('oc-edit-entrega').value,
            transportadora: document.getElementById('oc-edit-transp').value,
            observacoes: document.getElementById('oc-edit-obs').value
        };
        const res = await this.api(`/api/ocs/${id}`, { method: 'PUT', body });
        if (res?.ok) { this.closeModal(); this.toast('OC atualizada'); this.renderOCView(id); }
        else this.toast(res?.error || 'Erro', 'danger');
    },

    async receberOCItem(ocId, itemId, qtdTotal) {
        const qtd = await this.prompt(`Quantidade recebida (total: ${qtdTotal}):`);
        if (qtd === null) return;
        const res = await this.api(`/api/ocs/${ocId}/receber`, { method: 'PUT', body: { item_id: itemId, quantidade_recebida: parseFloat(qtd) } });
        if (res?.ok) { this.toast('Recebimento atualizado', 'success'); this.renderOCView(ocId); }
    },

    // ===== OC-OV LINK MODAL =====
    _linkSearchTimeout: null,

    async showLinkModal(sourceType, sourceId) {
        // sourceType: 'ov' (linking from OV, searching OCs) or 'oc' (linking from OC, searching OVs)
        const searchType = sourceType === 'ov' ? 'oc' : 'ov';
        const title = sourceType === 'ov' ? 'Vincular Compra (OC)' : 'Vincular Venda (OV)';

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'link-modal-overlay';
        overlay.innerHTML = `
        <div class="modal" style="max-width:560px;max-height:85vh;display:flex;flex-direction:column">
            <div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;padding:16px">
                <h3 style="margin:0;font-size:16px" id="link-modal-title">${title}</h3>
                <button class="btn btn-sm" onclick="document.getElementById('link-modal-overlay').remove()" style="padding:4px 8px">✕</button>
            </div>
            <div id="link-step-1">
                <div style="padding:0 16px">
                    <input type="text" class="form-control" id="link-search-input" placeholder="Buscar por numero ou fornecedor..." oninput="APP.debounceLinkSearch('${searchType}')">
                </div>
                <div id="link-search-results" style="padding:16px;overflow-y:auto;flex:1;max-height:400px">
                    <p style="color:var(--text-secondary);font-size:13px">Digite para buscar...</p>
                </div>
            </div>
            <div id="link-step-2" style="display:none;padding:16px;overflow-y:auto;flex:1;max-height:calc(85vh - 120px)">
            </div>
        </div>`;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
        document.getElementById('link-search-input').focus();

        this._linkContext = { sourceType, sourceId, searchType };
    },

    debounceLinkSearch(tipo) {
        clearTimeout(this._linkSearchTimeout);
        this._linkSearchTimeout = setTimeout(() => this.doLinkSearch(tipo), 300);
    },

    async doLinkSearch(tipo) {
        const q = document.getElementById('link-search-input')?.value || '';
        if (q.length < 2) {
            document.getElementById('link-search-results').innerHTML = '<p style="color:var(--text-secondary);font-size:13px">Digite ao menos 2 caracteres...</p>';
            return;
        }
        const results = await this.api(`/api/oc-ov-search?tipo=${tipo}&q=${encodeURIComponent(q)}`);
        if (!results) return;
        const el = document.getElementById('link-search-results');
        if (results.length === 0) {
            el.innerHTML = '<p style="color:var(--text-secondary);font-size:13px">Nenhum resultado encontrado</p>';
            return;
        }
        el.innerHTML = results.map(r => `
            <div class="list-item" style="cursor:pointer;padding:10px;margin-bottom:4px;border-radius:8px" onclick="APP.selectLinkItem(${r.id}, '${sanitize(r.numero)}')">
                <div class="list-item-content">
                    <div class="list-item-title">${sanitize(r.numero)}</div>
                    <div class="list-item-sub">${sanitize(r.razao_social || '')} · ${APP.formatDate(r.data_emissao)} · R$ ${APP.formatMoney(r.valor_total)}</div>
                </div>
            </div>`).join('');
    },

    async selectLinkItem(targetId, targetNumero) {
        const ctx = this._linkContext;
        if (!ctx) return;

        // If linking from OV (searching OCs), go to item selection step
        if (ctx.sourceType === 'ov') {
            await this._showItemSelectionStep(targetId, targetNumero, ctx.sourceId);
            return;
        }

        // If linking from OC (searching OVs), also item-level: select items from THIS OC to allocate to the chosen OV
        await this._showItemSelectionStep(ctx.sourceId, '', targetId, targetNumero);
    },

    async _showItemSelectionStep(ocId, ocNumero, ovId, ovNumero) {
        const step1 = document.getElementById('link-step-1');
        const step2 = document.getElementById('link-step-2');
        const titleEl = document.getElementById('link-modal-title');

        step2.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        step1.style.display = 'none';
        step2.style.display = 'block';

        const items = await this.api(`/api/ocs/${ocId}/items-saldo`);
        if (!items || !Array.isArray(items)) {
            step2.innerHTML = '<p style="color:var(--danger)">Erro ao carregar itens</p>';
            return;
        }

        const ctx = this._linkContext;
        const label = ctx.sourceType === 'ov'
            ? `Itens da ${ocNumero || 'OC'}`
            : `Vincular itens a ${ovNumero || 'OV'}`;
        titleEl.textContent = label;

        const availItems = items.filter(i => i.saldo_disponivel > 0.001);
        if (availItems.length === 0) {
            step2.innerHTML = `<div class="empty-state" style="padding:20px;text-align:center">
                <p style="color:var(--text-secondary)">Todos os itens desta OC ja foram alocados.</p>
                <button class="btn btn-outline btn-sm" onclick="APP._linkGoBack()" style="margin-top:8px">Voltar</button>
            </div>`;
            return;
        }

        this._linkItemsData = availItems.map(i => ({ ...i, _qtdAlocar: i.saldo_disponivel }));

        step2.innerHTML = `
            <div style="margin-bottom:12px">
                <button class="btn btn-sm btn-outline" onclick="APP._linkGoBack()" style="margin-bottom:8px">← Voltar</button>
                <p style="font-size:12px;color:var(--text-secondary);margin:0">Selecione os itens e defina as quantidades a vincular:</p>
            </div>
            <div id="link-items-list">
                ${availItems.map((item, idx) => `
                <div class="card" style="padding:12px;margin-bottom:8px" id="link-item-${idx}">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                        <input type="checkbox" id="link-chk-${idx}" checked onchange="APP._toggleLinkItem(${idx})" style="width:18px;height:18px;accent-color:var(--accent)">
                        <div style="flex:1">
                            <div style="font-weight:600;font-size:14px">${sanitize(item.categoria)}</div>
                            ${item.campos_especificos?.potencia ? `<span style="font-size:11px;color:var(--text-secondary)">${item.campos_especificos.potencia} kVA</span>` : ''}
                            ${item.campos_especificos?.tipo ? `<span style="font-size:11px;color:var(--text-secondary)"> · ${item.campos_especificos.tipo}</span>` : ''}
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;align-items:center;font-size:12px">
                        <div style="flex:1">
                            <label style="color:var(--text-secondary);font-size:11px">Disponivel</label>
                            <div style="font-weight:600">${APP.formatNumber(item.saldo_disponivel)} ${item.unidade}</div>
                        </div>
                        <div style="flex:1">
                            <label style="color:var(--text-secondary);font-size:11px">Total OC</label>
                            <div>${APP.formatNumber(item.quantidade)} ${item.unidade}</div>
                        </div>
                        <div style="flex:1">
                            <label style="color:var(--text-secondary);font-size:11px">R$/un</label>
                            <div>R$ ${APP.formatMoney(item.valor_unitario)}</div>
                        </div>
                    </div>
                    <div style="margin-top:8px">
                        <label style="font-size:11px;color:var(--text-secondary)">Qtd a vincular</label>
                        <input type="number" class="form-control" id="link-qty-${idx}" value="${item.saldo_disponivel}" min="0.001" max="${item.saldo_disponivel}" step="any" style="font-size:14px" oninput="APP._updateLinkItemQty(${idx})">
                    </div>
                    ${item.alocacoes?.length > 0 ? `<div style="margin-top:6px;font-size:11px;color:var(--text-secondary)">Ja alocado: ${item.alocacoes.map(a => `${a.ov_numero} (${APP.formatNumber(a.quantidade_alocada)})`).join(', ')}</div>` : ''}
                </div>`).join('')}
            </div>
            <div class="card" style="padding:12px;margin-top:12px;background:var(--bg-elevated)">
                <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:600;margin-bottom:8px">
                    <span>Total a vincular</span>
                    <span id="link-total-valor">R$ ${APP.formatMoney(availItems.reduce((s, i) => s + i.saldo_disponivel * i.valor_unitario, 0))}</span>
                </div>
                <button class="btn btn-primary" style="width:100%" onclick="APP._submitLinkItems(${ocId},${ovId})">Confirmar Vinculo</button>
            </div>`;
    },

    _linkGoBack() {
        document.getElementById('link-step-1').style.display = 'block';
        document.getElementById('link-step-2').style.display = 'none';
        const ctx = this._linkContext;
        document.getElementById('link-modal-title').textContent = ctx?.sourceType === 'ov' ? 'Vincular Compra (OC)' : 'Vincular Venda (OV)';
    },

    _toggleLinkItem(idx) {
        const chk = document.getElementById(`link-chk-${idx}`);
        const qtyInput = document.getElementById(`link-qty-${idx}`);
        const card = document.getElementById(`link-item-${idx}`);
        if (!chk.checked) {
            qtyInput.disabled = true;
            card.style.opacity = '0.4';
            this._linkItemsData[idx]._qtdAlocar = 0;
        } else {
            qtyInput.disabled = false;
            card.style.opacity = '1';
            this._linkItemsData[idx]._qtdAlocar = parseFloat(qtyInput.value) || 0;
        }
        this._updateLinkTotal();
    },

    _updateLinkItemQty(idx) {
        const val = parseFloat(document.getElementById(`link-qty-${idx}`)?.value) || 0;
        const max = this._linkItemsData[idx].saldo_disponivel;
        this._linkItemsData[idx]._qtdAlocar = Math.min(val, max);
        this._updateLinkTotal();
    },

    _updateLinkTotal() {
        const total = this._linkItemsData.reduce((s, i) => {
            if (!i._qtdAlocar || i._qtdAlocar <= 0) return s;
            return s + i._qtdAlocar * i.valor_unitario;
        }, 0);
        const el = document.getElementById('link-total-valor');
        if (el) el.textContent = `R$ ${APP.formatMoney(total)}`;
    },

    async _submitLinkItems(ocId, ovId) {
        const items = this._linkItemsData
            .filter(i => i._qtdAlocar > 0.001 && document.getElementById(`link-chk-${this._linkItemsData.indexOf(i)}`)?.checked)
            .map(i => ({
                oc_item_id: i.id,
                quantidade_alocada: i._qtdAlocar
            }));

        if (items.length === 0) {
            this.toast('Selecione ao menos um item', 'warning');
            return;
        }

        const res = await this.api('/api/oc-ov-link-items', { method: 'POST', body: { oc_id: ocId, ov_id: ovId, items } });
        if (res?.ok) {
            document.getElementById('link-modal-overlay')?.remove();
            this.toast(`${res.count} item(ns) vinculado(s)!`, 'success');
            const ctx = this._linkContext;
            if (ctx?.sourceType === 'ov') this.renderOVView(ctx.sourceId);
            else this.renderOCView(ctx.sourceId);
        } else {
            this.toast(res?.error || 'Erro ao vincular', 'danger');
        }
    },

    async removeLinkOcOv(linkId, sourceId, sourceType) {
        if (!await this.confirm('Remover este vinculo?')) return;
        const res = await this.api(`/api/oc-ov-links/${linkId}`, { method: 'DELETE' });
        if (res?.ok) {
            this.toast('Vinculo removido', 'success');
            if (sourceType === 'ov') this.renderOVView(sourceId);
            else this.renderOCView(sourceId);
        }
    },

    async removeLinkItemOcOv(linkId, sourceId, sourceType) {
        if (!await this.confirm('Remover este vinculo de item?')) return;
        const res = await this.api(`/api/oc-ov-link-items/${linkId}`, { method: 'DELETE' });
        if (res?.ok) {
            this.toast('Vinculo removido', 'success');
            if (sourceType === 'ov') this.renderOVView(sourceId);
            else this.renderOCView(sourceId);
        }
    },

    // ===== CADASTROS =====
    _cadastroFilterSegmento: '',
    _cadastroFilterPapel: '',

    async renderCadastros() {
        const el = document.getElementById('page-content');
        el.innerHTML = `
        ${this.pageHeader(LI('users',20)+' Cadastros', 'dashboard', '<button class="btn btn-primary btn-sm" onclick="APP.navigate(\'cadastro_form\')">+ Novo</button>')}

        <div class="cadastro-papel-tabs">
            <button class="cadastro-papel-tab ${this._cadastroFilterPapel===''?'active':''}" data-papel="" onclick="APP._cadastroFilterPapel='';APP.searchCadastros()">
                ${LI('users',14)} Todos
            </button>
            <button class="cadastro-papel-tab tab-cliente ${this._cadastroFilterPapel==='cliente'?'active':''}" data-papel="cliente" onclick="APP._cadastroFilterPapel='cliente';APP.searchCadastros()">
                ${LI('upload',14)} Clientes <small>(vendemos para)</small>
            </button>
            <button class="cadastro-papel-tab tab-fornecedor ${this._cadastroFilterPapel==='fornecedor'?'active':''}" data-papel="fornecedor" onclick="APP._cadastroFilterPapel='fornecedor';APP.searchCadastros()">
                ${LI('download',14)} Fornecedores <small>(compramos de)</small>
            </button>
            <button class="cadastro-papel-tab tab-ambos ${this._cadastroFilterPapel==='ambos'?'active':''}" data-papel="ambos" onclick="APP._cadastroFilterPapel='ambos';APP.searchCadastros()">
                ${LI('repeat',14)} Ambos
            </button>
        </div>

        <div style="display:flex;gap:8px;margin-bottom:8px">
            <div class="form-group" style="flex:1;margin:0"><input type="text" class="form-control" placeholder="Buscar por nome, CNPJ..." id="cadastro-search" oninput="APP.debounceCadastroSearch()"></div>
            <select class="dash-filter-select" id="cadastro-seg-filter" onchange="APP._cadastroFilterSegmento=this.value;APP.searchCadastros()" style="width:auto;height:40px">
                <option value="">Segmento</option>
                <option value="Reformador">🔧 Reformador</option>
                <option value="Fabricante">🏭 Fabricante</option>
                <option value="Reciclagem / Sucata">♻️ Reciclagem</option>
                <option value="Distribuidor / Revenda">🏪 Distribuidor</option>
                <option value="Concessionária">⚡ Concessionária</option>
                <option value="Indústria">🏗️ Indústria</option>
                <option value="Pessoa Física">👤 PF</option>
                <option value="Outro">📋 Outro</option>
                <option value="_sem">❌ Sem segmento</option>
            </select>
        </div>
        <div id="cadastros-list"><div class="loading">${this.skeletonList(4)}</div></div>`;
        this.searchCadastros();
    },

    _cadastroSearchTimeout: null,
    debounceCadastroSearch() {
        clearTimeout(this._cadastroSearchTimeout);
        this._cadastroSearchTimeout = setTimeout(() => this.searchCadastros(), 300);
    },

    async searchCadastros() {
        // Update active tab visuals
        document.querySelectorAll('.cadastro-papel-tab').forEach(btn => {
            btn.classList.remove('active');
            const val = btn.dataset.papel || '';
            if (val === (this._cadastroFilterPapel || '')) btn.classList.add('active');
        });
        const search = document.getElementById('cadastro-search')?.value || '';
        let url = `/api/cadastros?search=${encodeURIComponent(search)}`;
        if (this._cadastroFilterSegmento) url += `&segmento=${encodeURIComponent(this._cadastroFilterSegmento)}`;
        if (this._cadastroFilterPapel) url += `&papel=${this._cadastroFilterPapel}`;
        const data = await this.api(url);
        if (!data) return;
        document.getElementById('cadastros-list').innerHTML = data.items.length === 0 ? `<div class="empty-state"><div class="empty-icon">${LI('users',48)}</div><p>Nenhum cliente cadastrado</p><p class="empty-hint">Adicione seus clientes para comecar a gerenciar</p><button class="btn btn-primary btn-sm" onclick="APP.navigate('cadastro_form')">${LI('plus',14)} Novo Cliente</button></div>` :
            data.items.map(c => {
                const papelBadge = c.papel === 'Ambos' ? '<span class="papel-badge papel-ambos">C/F</span>' :
                    c.papel === 'Fornecedor' ? '<span class="papel-badge papel-fornecedor">F</span>' :
                    c.papel === 'Cliente' ? '<span class="papel-badge papel-cliente">C</span>' : '';
                // LTV health indicator
                const saudeIcon = c.saude === 'risco' ? '<span class="saude-dot saude-risco" title="Risco: fora do ciclo há 30+ dias">🔴</span>' :
                    c.saude === 'atencao' ? '<span class="saude-dot saude-atencao" title="Atenção: fora do ciclo há 10+ dias">🟡</span>' :
                    c.saude === 'ok' ? '<span class="saude-dot saude-ok" title="Dentro do ciclo normal">🟢</span>' : '';
                const diasInfo = c.dias_sem_comprar != null && c.papel !== 'Fornecedor'
                    ? `<span style="font-size:11px;color:${c.saude==='risco'?'var(--danger)':c.saude==='atencao'?'var(--warning)':'var(--text-muted)'}">${c.dias_sem_comprar}d sem comprar${c.frequencia_media ? ` · ciclo ~${c.frequencia_media}d` : ''}</span>`
                    : '';
                return `<div class="list-item" onclick="APP.navigate('cadastro_view',{id:${c.id}})">
                <div class="avatar">${papelBadge || sanitize((c.razao_social||'?')[0])}</div>
                <div class="list-item-content">
                    <div class="list-item-title">${saudeIcon} ${sanitize(c.razao_social)}</div>
                    <div class="list-item-sub">${sanitize(c.cnpj_cpf)} · ${sanitize(c.endereco_cidade || '')}/${sanitize(c.endereco_uf || '')}${c.segmento ? ` · ${APP.getSegmentoBadge(c.segmento)}` : ''}</div>
                    ${diasInfo ? `<div class="list-item-sub">${diasInfo}</div>` : ''}
                </div>
                <span class="status-tag status-${c.status==='Ativo'?'aprovada':'perdida'}">${sanitize(c.status)}</span>
            </div>`;
            }).join('');
    },

    async renderCadastroView(id) {
        const el = document.getElementById('page-content');
        el.innerHTML = `<div class="loading">${this.skeletonDetail()}</div>`;
        const c = await this.api(`/api/cadastros/${id}`);
        if (!c) return;

        el.innerHTML = `
        ${this.pageHeader(`${sanitize(c.razao_social)}`, 'cadastros', `
            <button class="btn btn-outline btn-sm" onclick="APP.navigate('cadastro_form',{id:${id}})">${LI('edit',14)} Editar</button>
            ${c.contato_whatsapp && c.contato_whatsapp.replace(/\D/g,'').length >= 10 ? `<a class="btn btn-success btn-sm" href="https://wa.me/55${c.contato_whatsapp.replace(/\D/g,'')}" target="_blank">${LI("send",14)} WhatsApp</a>` : ''}
            ${c.ultima_ov_id ? `<button class="btn btn-warning btn-sm" onclick="APP.repetirPedido(${id},this)">${LI('repeat',14)} Repetir Pedido</button>` : ''}
            <button class="btn btn-primary btn-sm" onclick="APP.navigate('proposta_form',{tipo:'VENDA',cadastro_id:${id}})">+ Venda</button>
            <button class="btn btn-outline btn-sm" onclick="APP.navigate('proposta_form',{tipo:'COMPRA',cadastro_id:${id}})">+ Compra</button>
        `)}

        ${c.papel || c.segmento ? `
        <div class="papel-header-tag">
            ${c.papel === 'Ambos' ? `<span class="papel-tag papel-ambos-tag">${LI('repeat',14)} Cliente & Fornecedor</span>` :
              c.papel === 'Fornecedor' ? `<span class="papel-tag papel-fornecedor-tag">${LI('download',14)} Fornecedor</span>` :
              c.papel === 'Cliente' ? `<span class="papel-tag papel-cliente-tag">${LI('upload',14)} Cliente</span>` : ''}
            ${c.segmento ? this.getSegmentoBadge(c.segmento) : ''}
        </div>` : ''}

        ${c.dias_sem_comprar != null ? `
        <div class="card" style="border-left:4px solid ${c.saude==='risco'?'var(--danger)':c.saude==='atencao'?'var(--warning)':'var(--success)'}">
            <div class="card-header"><span class="card-title">${LI('heart-pulse',20)} Saúde do Cliente (LTV)</span>
                <span style="font-size:12px;padding:2px 8px;border-radius:99px;background:${c.saude==='risco'?'var(--danger)':c.saude==='atencao'?'var(--warning)':'var(--success)'};color:#fff">${c.saude==='risco'?'Risco de perda':c.saude==='atencao'?'Atenção':'Dentro do ciclo'}</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;padding:12px 16px">
                <div class="mini-stat">
                    <div class="mini-stat-value" style="color:${c.saude==='risco'?'var(--danger)':c.saude==='atencao'?'var(--warning)':'var(--success)'}">${c.dias_sem_comprar}d</div>
                    <div class="mini-stat-label">sem comprar</div>
                </div>
                ${c.frequencia_media ? `<div class="mini-stat">
                    <div class="mini-stat-value">~${c.frequencia_media}d</div>
                    <div class="mini-stat-label">ciclo médio</div>
                </div>` : ''}
                ${c.atraso_ciclo > 0 ? `<div class="mini-stat">
                    <div class="mini-stat-value" style="color:var(--danger)">+${c.atraso_ciclo}d</div>
                    <div class="mini-stat-label">além do ciclo</div>
                </div>` : ''}
                <div class="mini-stat">
                    <div class="mini-stat-value">R$ ${this.formatMoney(c.ltv_total)}</div>
                    <div class="mini-stat-label">valor vitalício</div>
                </div>
                <div class="mini-stat">
                    <div class="mini-stat-value">${c.total_pedidos_historico || 0}</div>
                    <div class="mini-stat-label">pedidos totais</div>
                </div>
            </div>
            ${c.timeline_compras?.length > 0 ? `
            <div style="padding:4px 16px 12px">
                <div style="font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase">Atividade últimos 12 meses</div>
                <div style="display:flex;gap:4px;align-items:end">
                    ${c.timeline_compras.map(t => {
                        const hasData = t.pedidos > 0;
                        const label = t.mes.split('/')[0];
                        return `<div style="flex:1;text-align:center" title="${t.mes}: ${t.pedidos} pedido${t.pedidos!==1?'s':''} — R$ ${APP.formatMoney(t.valor)}">
                            <div style="height:32px;display:flex;align-items:end;justify-content:center">
                                <div style="width:100%;max-width:28px;height:${hasData ? Math.max(8, Math.min(32, t.pedidos * 16)) : 4}px;background:${hasData ? 'var(--success)' : 'var(--bg-tertiary)'};border-radius:3px;opacity:${hasData ? 1 : 0.4}"></div>
                            </div>
                            <div style="font-size:9px;color:var(--text-muted);margin-top:2px">${label}</div>
                        </div>`;
                    }).join('')}
                </div>
            </div>` : ''}
        </div>` : ''}

        ${c.papel === 'Ambos' ? `
        <div class="card">
            <div class="card-header"><span class="card-title">${LI('repeat',20)} Balanço do Relacionamento</span></div>
            <div class="stats-grid-3" style="padding:12px 16px">
                <div class="mini-stat">
                    <div class="mini-stat-value" style="color:var(--success)">R$ ${this.formatMoney(c.total_vendido_valor)}</div>
                    <div class="mini-stat-label">${c.total_vendido_qtd} vendas (nós→ele)</div>
                </div>
                <div class="mini-stat">
                    <div class="mini-stat-value" style="color:var(--danger)">R$ ${this.formatMoney(c.total_comprado_valor)}</div>
                    <div class="mini-stat-label">${c.total_comprado_qtd} compras (ele→nós)</div>
                </div>
                <div class="mini-stat">
                    <div class="mini-stat-value" style="color:${c.saldo_relacionamento >= 0 ? 'var(--success)' : 'var(--danger)'}">R$ ${this.formatMoney(Math.abs(c.saldo_relacionamento))}</div>
                    <div class="mini-stat-label">${c.saldo_relacionamento >= 0 ? 'Saldo positivo ↑' : 'Saldo negativo ↓'}</div>
                </div>
            </div>
        </div>` : ''}

        ${c.limite_faturamento ? `
        <div class="card ${(c.limite_disponivel||0) < 0 ? 'card-danger' : ''}">
            <div class="limit-bar">
                <div class="limit-info">
                    <span>Limite: <strong>R$ ${this.formatMoney(c.limite_faturamento)}</strong></span>
                    <span>Tomado: <strong>R$ ${this.formatMoney(c.limite_tomado)}</strong></span>
                    <span style="color:${(c.limite_disponivel||0)<0?'var(--danger)':'var(--success)'}">Disponível: <strong>R$ ${this.formatMoney(c.limite_disponivel)}</strong></span>
                </div>
                <div class="progress"><div class="progress-bar ${(c.limite_faturamento > 0 ? c.limite_tomado/c.limite_faturamento*100 : 0)>80?'danger':''}" style="width:${c.limite_faturamento > 0 ? Math.min(100,c.limite_tomado/c.limite_faturamento*100) : 0}%"></div></div>
            </div>
        </div>` : ''}

        <div class="detail-grid">
            <div class="card">
                <div class="card-header"><span class="card-title">${LI('clipboard',20)} Dados</span></div>
                <div class="detail-field"><label>CNPJ/CPF</label><span>${sanitize(c.cnpj_cpf)}</span></div>
                ${c.nome_fantasia ? `<div class="detail-field"><label>Fantasia</label><span>${sanitize(c.nome_fantasia)}</span></div>` : ''}
                <div class="detail-field"><label>Endereço</label><span>${sanitize(c.endereco_rua || '')} ${sanitize(c.endereco_numero || '')}, ${sanitize(c.endereco_bairro || '')} — ${sanitize(c.endereco_cidade || '')}/${sanitize(c.endereco_uf || '')}</span></div>
                <div class="detail-field"><label>Contato</label><span>${sanitize(c.contato_nome || '')} · ${sanitize(c.contato_whatsapp || c.contato_telefone || '')}</span></div>
                <div class="detail-field"><label>Segmento</label><span>${sanitize(c.segmento || '-')}</span></div>
            </div>

            <div class="card">
                <div class="card-header"><span class="card-title">${LI('bar-chart-3',20)} Resumo ${c.resumo_anual?.ano}</span></div>
                <div class="stats-grid-2">
                    <div class="mini-stat"><div class="mini-stat-value">R$ ${this.formatMoney(c.resumo_anual?.total_valor)}</div><div class="mini-stat-label">Total comprado</div></div>
                    <div class="mini-stat"><div class="mini-stat-value">${c.resumo_anual?.total_ovs || 0}</div><div class="mini-stat-label">Pedidos</div></div>
                </div>
            </div>
        </div>

        ${c.credito_tomado > 0 || c.proximas_parcelas?.length > 0 ? `
        <div class="card">
            <div class="card-header"><span class="card-title">${LI("target",20)} Visão Comercial de Crédito</span></div>
            <div class="credito-comercial">
                <div class="credito-stats">
                    <div class="credito-stat">
                        <div class="credito-stat-label">Crédito tomado</div>
                        <div class="credito-stat-value" style="color:var(--warning)">R$ ${this.formatMoney(c.credito_tomado)}</div>
                        <div class="credito-stat-sub">parcelas a vencer</div>
                    </div>
                    <div class="credito-stat">
                        <div class="credito-stat-label">Já liberado</div>
                        <div class="credito-stat-value" style="color:var(--success)">R$ ${this.formatMoney(c.credito_liberado)}</div>
                        <div class="credito-stat-sub">parcelas vencidas</div>
                    </div>
                    ${c.limite_faturamento ? `<div class="credito-stat">
                        <div class="credito-stat-label">Disponível</div>
                        <div class="credito-stat-value" style="color:${c.limite_disponivel > 0 ? 'var(--accent)' : 'var(--danger)'}">R$ ${this.formatMoney(c.limite_disponivel || 0)}</div>
                        <div class="credito-stat-sub">de R$ ${this.formatMoney(c.limite_faturamento)}</div>
                    </div>` : ''}
                </div>
                ${c.proxima_liberacao ? `
                <div class="credito-alerta">
                    ${LI('clock',14)} Próxima liberação: <strong>R$ ${this.formatMoney(c.valor_proxima_liberacao)}</strong> em <strong>${this.formatDate(c.proxima_liberacao)}</strong>
                    ${c.limite_disponivel !== null && c.limite_disponivel <= 0 ? ` — após isso, pode ofertar novamente` : ''}
                </div>` : `
                <div class="credito-alerta credito-livre">
                    ${LI('check-circle',14)} <strong>Sem parcelas pendentes</strong> — cliente livre para nova compra
                </div>`}
            </div>
            ${c.proximas_parcelas?.length > 0 ? `
            <div style="padding:0 16px 12px">
                <div style="font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase">Cronograma de liberação</div>
                ${c.proximas_parcelas.map(p => `<div class="parcela-row">
                    <span>${p.ov_numero} (${p.numero_parcela}/${p.total_parcelas})</span>
                    <span>R$ ${this.formatMoney(p.valor)}</span>
                    <span>${this.formatDate(p.data_vencimento)}</span>
                </div>`).join('')}
            </div>` : ''}
        </div>` : ''}

        ${c.ultimas_ovs?.length > 0 ? `
        <div class="card">
            <div class="card-header"><span class="card-title">${LI('upload',20)} Últimas Vendas (nós→ele)</span></div>
            ${c.ultimas_ovs.map(ov => `<div class="list-item" onclick="APP.navigate('ov_view',{id:${ov.id}})">
                <div class="list-item-content"><div class="list-item-title">${ov.numero}</div><div class="list-item-sub">${this.formatDate(ov.data_emissao)}</div></div>
                <div class="list-item-value">R$ ${this.formatMoney(ov.valor_total)}</div>
            </div>`).join('')}
        </div>` : ''}

        ${c.ultimas_ocs?.length > 0 ? `
        <div class="card">
            <div class="card-header"><span class="card-title">${LI('download',20)} Últimas Compras (ele→nós)</span></div>
            ${c.ultimas_ocs.map(oc => `<div class="list-item" onclick="APP.navigate('oc_view',{id:${oc.id}})">
                <div class="list-item-content"><div class="list-item-title">${oc.numero}</div><div class="list-item-sub">${this.formatDate(oc.data_emissao)}</div></div>
                <div class="list-item-value">R$ ${this.formatMoney(oc.valor_total)}</div>
            </div>`).join('')}
        </div>` : ''}

        ${c.historico_precos?.length > 0 ? `
        <div class="card">
            <div class="card-header"><span class="card-title">${LI('trending-up',20)} Histórico de Preços (Venda)</span></div>
            <div class="table-container"><table>
                <tr><th>Categoria</th><th>Preço</th><th>Unidade</th><th>Data</th></tr>
                ${c.historico_precos.slice(0,10).map(h => `<tr><td>${h.categoria}</td><td>R$ ${this.formatMoney(h.valor_unitario)}</td><td>${h.unidade}</td><td>${this.formatDate(h.data_emissao)}</td></tr>`).join('')}
            </table></div>
        </div>` : ''}

        ${c.historico_precos_compra?.length > 0 ? `
        <div class="card">
            <div class="card-header"><span class="card-title">${LI('trending-down',20)} Histórico de Preços (Compra)</span></div>
            <div class="table-container"><table>
                <tr><th>Categoria</th><th>Preço</th><th>Unidade</th><th>Data</th></tr>
                ${c.historico_precos_compra.slice(0,10).map(h => `<tr><td>${h.categoria}</td><td>R$ ${this.formatMoney(h.valor_unitario)}</td><td>${h.unidade}</td><td>${this.formatDate(h.data_emissao)}</td></tr>`).join('')}
            </table></div>
        </div>` : ''}

        ${c.resumo_anual_compra ? `
        <div class="card">
            <div class="card-header"><span class="card-title">${LI('bar-chart-3',20)} Resumo Compras ${c.resumo_anual_compra.ano}</span></div>
            <div class="stats-grid-2">
                <div class="mini-stat"><div class="mini-stat-value">R$ ${this.formatMoney(c.resumo_anual_compra.total_valor)}</div><div class="mini-stat-label">Total comprado de</div></div>
                <div class="mini-stat"><div class="mini-stat-value">${c.resumo_anual_compra.total_ocs || 0}</div><div class="mini-stat-label">Pedidos compra</div></div>
            </div>
        </div>` : ''}`;
    },

    // ===== PIPELINE COMERCIAL =====
    _pipelineTab: 'hoje',

    async renderPipeline() {
        const el = document.getElementById('page-content');
        el.innerHTML = `<div class="loading">${this.skeletonKPI(3)}${this.skeletonList(4)}</div>`;
        const data = await this.api('/api/pipeline');
        if (!data) return;
        this._pipelineData = data;

        const periodos = {hoje: data.hoje, semana: data.semana, mes: data.mes};
        const fat = data.faturamento;

        const funnel = data.funnel || [];
        const funnelHtml = funnel.length > 0 ? `
        <div class="card" style="margin-bottom:20px">
            <div class="card-header"><span class="card-title">${LI('target',20)} Funil de Vendas</span></div>
            <div class="pipeline-funnel">
                ${funnel.map((stage, i) => {
                    const maxVal = funnel[0]?.count || 1;
                    const width = Math.max(20, (stage.count / maxVal) * 100);
                    const colors = {'Rascunho':'#94a3b8','Enviada':'#60a5fa','Em Negociação':'#f59e0b','Aprovada':'#a78bfa','Convertida':'#10b981','Perdida':'#ef4444'};
                    const color = colors[stage.status] || '#94a3b8';
                    return `
                    <div class="funnel-stage">
                        <div class="funnel-label">${sanitize(stage.status)}</div>
                        <div class="funnel-bar-container">
                            <div class="funnel-bar" style="width:${width}%;background:${color}">
                                <span class="funnel-count">${stage.count}</span>
                            </div>
                        </div>
                        <div class="funnel-value">R$ ${APP.formatMoney(stage.valor)}</div>
                    </div>`;
                }).join('')}
            </div>
        </div>` : '';

        el.innerHTML = `
        ${this.pageHeader(LI('target',20)+' Pipeline Comercial', 'dashboard')}

        ${funnelHtml}

        <div class="pipeline-kpis">
            <div class="pipeline-kpi-card" onclick="APP.switchPipelineTab('hoje')">
                <div class="pipeline-kpi-label">Hoje</div>
                <div class="pipeline-kpi-row">
                    <div class="pipeline-kpi-block">
                        <div class="pipeline-kpi-value kpi-value">R$ ${this.formatMoney(data.hoje.total)}</div>
                        <div class="pipeline-kpi-sub">${data.hoje.count} proposta${data.hoje.count!==1?'s':''} criada${data.hoje.count!==1?'s':''}</div>
                    </div>
                    <div class="pipeline-kpi-arrow">${LI('arrow-up-right',16)}</div>
                    <div class="pipeline-kpi-block">
                        <div class="pipeline-kpi-value kpi-value" style="color:var(--success)">R$ ${this.formatMoney(fat.hoje.total)}</div>
                        <div class="pipeline-kpi-sub">${fat.hoje.count} OV${fat.hoje.count!==1?'s':''} faturada${fat.hoje.count!==1?'s':''}</div>
                    </div>
                </div>
            </div>
            <div class="pipeline-kpi-card" onclick="APP.switchPipelineTab('semana')">
                <div class="pipeline-kpi-label">Esta Semana</div>
                <div class="pipeline-kpi-row">
                    <div class="pipeline-kpi-block">
                        <div class="pipeline-kpi-value kpi-value">R$ ${this.formatMoney(data.semana.total)}</div>
                        <div class="pipeline-kpi-sub">${data.semana.count} proposta${data.semana.count!==1?'s':''}</div>
                    </div>
                    <div class="pipeline-kpi-arrow">${LI('arrow-up-right',16)}</div>
                    <div class="pipeline-kpi-block">
                        <div class="pipeline-kpi-value kpi-value" style="color:var(--success)">R$ ${this.formatMoney(fat.semana.total)}</div>
                        <div class="pipeline-kpi-sub">${fat.semana.count} OV${fat.semana.count!==1?'s':''}</div>
                    </div>
                </div>
            </div>
            <div class="pipeline-kpi-card" onclick="APP.switchPipelineTab('mes')">
                <div class="pipeline-kpi-label">Este Mês</div>
                <div class="pipeline-kpi-row">
                    <div class="pipeline-kpi-block">
                        <div class="pipeline-kpi-value kpi-value">R$ ${this.formatMoney(data.mes.total)}</div>
                        <div class="pipeline-kpi-sub">${data.mes.count} proposta${data.mes.count!==1?'s':''}</div>
                    </div>
                    <div class="pipeline-kpi-arrow">${LI('arrow-up-right',16)}</div>
                    <div class="pipeline-kpi-block">
                        <div class="pipeline-kpi-value kpi-value" style="color:var(--success)">R$ ${this.formatMoney(fat.mes.total)}</div>
                        <div class="pipeline-kpi-sub">${fat.mes.count} OV${fat.mes.count!==1?'s':''}</div>
                    </div>
                </div>
            </div>
        </div>

        ${data.mes.total > 0 ? `
        <div class="card" style="margin-top:16px">
            <div class="card-header"><span class="card-title">${LI('bar-chart-3',18)} Conversão do Mês</span></div>
            <div style="padding:12px">
                <div class="pipeline-conversion-bar">
                    <div class="pipeline-conv-fill pipeline-conv-convertida" style="width:${Math.round(data.mes.total_convertidas/data.mes.total*100)}%"></div>
                    <div class="pipeline-conv-fill pipeline-conv-aberta" style="width:${Math.round(data.mes.total_abertas/data.mes.total*100)}%"></div>
                    <div class="pipeline-conv-fill pipeline-conv-perdida" style="width:${Math.round(data.mes.total_perdidas/data.mes.total*100)}%"></div>
                </div>
                <div class="pipeline-conv-legend">
                    <span class="pipeline-conv-legend-item"><span class="pipeline-dot" style="background:var(--success)"></span>Convertida R$ ${this.formatMoney(data.mes.total_convertidas)} (${data.mes.count_convertidas})</span>
                    <span class="pipeline-conv-legend-item"><span class="pipeline-dot" style="background:var(--accent)"></span>Aberta R$ ${this.formatMoney(data.mes.total_abertas)} (${data.mes.count_abertas})</span>
                    <span class="pipeline-conv-legend-item"><span class="pipeline-dot" style="background:var(--danger)"></span>Perdida R$ ${this.formatMoney(data.mes.total_perdidas)} (${data.mes.count_perdidas})</span>
                </div>
            </div>
        </div>` : ''}

        ${data.vendedores.length > 0 ? `
        <div class="card" style="margin-top:16px">
            <div class="card-header"><span class="card-title">${LI('users',18)} Vendedores no Mês</span></div>
            <div class="table-container"><table>
                <tr><th>Vendedor</th><th>Propostas</th><th>Convertido</th><th>Total</th><th>Taxa</th></tr>
                ${data.vendedores.filter(v => v.propostas_criadas > 0).map(v => {
                    const taxa = v.valor_total_propostas > 0 ? Math.round(v.valor_convertido/v.valor_total_propostas*100) : 0;
                    return `<tr>
                        <td style="font-weight:600">${sanitize(v.nome)}</td>
                        <td>${v.propostas_criadas}</td>
                        <td style="color:var(--success);font-weight:600">R$ ${this.formatMoney(v.valor_convertido)}</td>
                        <td>R$ ${this.formatMoney(v.valor_total_propostas)}</td>
                        <td><span class="status-tag status-${taxa>=50?'aprovada':taxa>=25?'rascunho':'perdida'}">${taxa}%</span></td>
                    </tr>`;
                }).join('')}
            </table></div>
        </div>` : ''}

        <div class="card" style="margin-top:16px">
            <div class="card-header">
                <span class="card-title">${LI('list',18)} Pipeline Ativo</span>
                <span style="font-size:12px;color:var(--text-muted)">R$ ${this.formatMoney(data.total_pipeline)} em ${data.abertas.length} proposta${data.abertas.length!==1?'s':''}</span>
            </div>
            <div id="pipeline-list">
                ${this._renderPipelineList(data.abertas)}
            </div>
        </div>

        ${data.clientes_credito?.length > 0 ? `
        <div class="card" style="margin-top:16px">
            <div class="card-header"><span class="card-title">${LI('coins',18)} Crédito Comercial dos Clientes</span></div>
            <div class="table-container"><table>
                <tr><th>Cliente</th><th>Crédito Tomado</th><th>Limite</th><th>Disponível</th><th>Próx. Liberação</th><th>Status</th></tr>
                ${data.clientes_credito.map(cl => {
                    const disponivel = cl.credito_disponivel;
                    const statusMap = {
                        'disponivel': {tag: 'aprovada', text: 'Pode comprar'},
                        'aguardar': {tag: 'rascunho', text: 'Aguardar'},
                        'sem_limite': {tag: 'enviada', text: 'Sem limite'}
                    };
                    const st = statusMap[cl.status_comercial] || statusMap.sem_limite;
                    return `<tr onclick="APP.navigate('cadastro_view',{id:${cl.id}})" style="cursor:pointer">
                        <td style="font-weight:600">${sanitize(cl.razao_social)}</td>
                        <td style="color:var(--warning);font-weight:600">R$ ${this.formatMoney(cl.credito_tomado)}</td>
                        <td>${cl.limite_faturamento ? 'R$ '+this.formatMoney(cl.limite_faturamento) : '—'}</td>
                        <td style="color:${disponivel > 0 ? 'var(--success)' : disponivel !== null ? 'var(--danger)' : 'var(--text-muted)'};font-weight:600">${disponivel !== null ? 'R$ '+this.formatMoney(disponivel) : '—'}</td>
                        <td>${cl.proxima_liberacao ? this.formatDate(cl.proxima_liberacao) : '—'}</td>
                        <td><span class="status-tag status-${st.tag}">${st.text}</span></td>
                    </tr>`;
                }).join('')}
            </table></div>
        </div>` : ''}`;

        this._animateKPIs(el);
    },

    _renderPipelineList(items) {
        if (items.length === 0) return '<div style="padding:20px;text-align:center;color:var(--text-muted)">Nenhuma proposta aberta no momento</div>';
        return items.map(p => {
            const statusMap = {'Rascunho':'rascunho','Enviada':'enviada','Em Negociação':'negociacao','Aprovada':'aprovada'};
            const cls = statusMap[p.status] || 'rascunho';
            return `<div class="list-item" onclick="APP.navigate('proposta_view',{id:${p.id}})">
            <div class="list-item-content">
                <div class="list-item-title">${sanitize(p.razao_social || 'Sem cliente')} — ${sanitize(p.numero)}</div>
                <div class="list-item-sub">${sanitize(p.vendedor_nome || '')} · ${this.formatDate(p.data_criacao)}</div>
            </div>
            <div class="list-item-right">
                <div class="list-item-value">R$ ${this.formatMoney(p.valor)}</div>
                <span class="status-tag status-${cls}">${p.status}</span>
            </div>
        </div>`;
        }).join('');
    },

    switchPipelineTab(tab) {
        this._pipelineTab = tab;
    },

    // ===== FECHAMENTO =====
    _fechTab: 'vendas',

    async renderFechamento(params = {}) {
        const mes = params.mes || new Date().getMonth() + 1;
        const ano = params.ano || new Date().getFullYear();
        if (params.tab) this._fechTab = params.tab;
        const el = document.getElementById('page-content');
        el.innerHTML = `<div class="loading">${this.skeletonKPI(3)}${this.skeletonList(3)}</div>`;
        const data = await this.api(`/api/fechamento/${ano}/${mes}`);
        if (!data) return;
        this._fechData = data;
        this._fechMes = mes;
        this._fechAno = ano;

        const totalVendas = data.resultado.reduce((s, u) => s + u.total_comissao_vendas + (u.extra_gerente || 0), 0);
        const totalCompras = data.resultado.reduce((s, u) => s + u.total_comissao_compras, 0);
        const totalIntermediarios = data.intermediarios.reduce((s, i) => s + i.valor, 0);

        el.innerHTML = `
        ${this.pageHeader(`${LI("clipboard",14)} Fechamento ${mes}/${ano}`, 'dashboard', `
            <select class="form-control" style="width:auto;display:inline" onchange="APP.renderFechamento({mes:parseInt(this.value),ano:${ano}})">
                ${[1,2,3,4,5,6,7,8,9,10,11,12].map(m => `<option value="${m}" ${m===mes?'selected':''}>${m}</option>`).join('')}
            </select>
        `)}

        <div class="dash-tabs" style="margin-bottom:16px">
            <div class="dash-tab tab-vendas ${this._fechTab==='vendas'?'active':''}" onclick="APP.switchFechTab('vendas')">
                ${LI("wallet",16)} Vendas <span style="font-size:11px;opacity:.7">R$ ${this.formatMoney(totalVendas)}</span>
            </div>
            <div class="dash-tab tab-compras ${this._fechTab==='compras'?'active':''}" onclick="APP.switchFechTab('compras')">
                ${LI("download",16)} Compras <span style="font-size:11px;opacity:.7">R$ ${this.formatMoney(totalCompras + totalIntermediarios)}</span>
            </div>
        </div>

        <div id="fech-content"></div>`;

        this._renderFechTab();
    },

    switchFechTab(tab) {
        this._fechTab = tab;
        document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.tab-${tab}`).classList.add('active');
        this._renderFechTab();
    },

    _renderFechTab() {
        const el = document.getElementById('fech-content');
        if (!el) return;
        if (this._fechTab === 'vendas') {
            this._renderFechVendas(el);
        } else {
            this._renderFechCompras(el);
        }
    },

    _getQualColor(score) {
        if (score >= 65) return 'var(--success)';
        if (score >= 40) return 'var(--warning)';
        return 'var(--danger)';
    },
    _getQualLabel(tier) {
        if (tier === 'bonus_total') return LI('trophy',16)+' Bônus Total';
        if (tier === 'bonus_metade') return LI('zap',16)+' Metade do Bônus';
        return LI('x',16)+' Sem Bônus';
    },
    _getQualTagClass(tier) {
        if (tier === 'bonus_total') return 'status-aprovada';
        if (tier === 'bonus_metade') return 'status-negociacao';
        return 'status-perdida';
    },

    showQualitativoModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.onclick = e => { if (e.target === modal) modal.remove(); };
        modal.innerHTML = `<div class="modal" style="max-width:500px">
            <div class="modal-header"><span class="modal-title">${LI("bar-chart-3",20)} Como funciona o Qualitativo</span><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">x</button></div>
            <div style="padding:16px;font-size:13px;line-height:1.6">
                <p style="margin-bottom:12px"><strong>Formula:</strong></p>
                <div style="background:var(--bg-input);padding:12px;border-radius:var(--radius-sm);font-family:monospace;margin-bottom:12px">
                    H = 10 x entrada% + base x (1 - entrada%)
                </div>
                <p style="margin-bottom:8px"><strong>Valores base por condicao de pagamento:</strong></p>
                <table style="width:100%;font-size:12px;border-collapse:collapse;margin-bottom:12px">
                    <tr style="border-bottom:1px solid var(--border)"><td style="padding:4px">A vista</td><td style="font-weight:600">10</td></tr>
                    <tr style="border-bottom:1px solid var(--border)"><td style="padding:4px">28 dias</td><td style="font-weight:600">9</td></tr>
                    <tr style="border-bottom:1px solid var(--border)"><td style="padding:4px">28/56 dias</td><td style="font-weight:600">8</td></tr>
                    <tr style="border-bottom:1px solid var(--border)"><td style="padding:4px">28/56/84 dias</td><td style="font-weight:600">7</td></tr>
                    <tr style="border-bottom:1px solid var(--border)"><td style="padding:4px">30/60/90/120 dias</td><td style="font-weight:600">5</td></tr>
                </table>
                <p style="margin-bottom:8px"><strong>Faixas de bonus ABMT:</strong></p>
                <div style="display:grid;gap:6px">
                    <div style="display:flex;align-items:center;gap:8px;padding:6px;border-radius:4px;background:rgba(248,113,113,0.1)"><span style="font-weight:700;color:var(--danger)">0-40%</span><span>Sem bonus</span></div>
                    <div style="display:flex;align-items:center;gap:8px;padding:6px;border-radius:4px;background:rgba(251,191,36,0.1)"><span style="font-weight:700;color:var(--warning)">40-65%</span><span>Metade do bonus</span></div>
                    <div style="display:flex;align-items:center;gap:8px;padding:6px;border-radius:4px;background:rgba(52,211,153,0.1)"><span style="font-weight:700;color:var(--success)">65%+</span><span>Bonus total</span></div>
                </div>
            </div>
        </div>`;
        document.body.appendChild(modal);
    },

    showMetaExplanationModal(meta) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.onclick = e => { if (e.target === modal) modal.remove(); };
        const pctMes = meta && meta.meta_mensal > 0 ? Math.round(meta.realizado_mes / meta.meta_mensal * 100) : 0;
        modal.innerHTML = `<div class="modal" style="max-width:450px">
            <div class="modal-header"><span class="modal-title">${LI("target",20)} Como funciona a Meta</span><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">x</button></div>
            <div style="padding:16px;font-size:13px;line-height:1.6">
                <p style="margin-bottom:12px">A meta e definida mensalmente pelo gestor e representa o objetivo de faturamento (valor bruto de OVs) para cada vendedor.</p>
                <p style="margin-bottom:12px"><strong>Regras:</strong></p>
                <ul style="padding-left:20px;margin-bottom:12px">
                    <li>A meta mensal e dividida em 4 semanas</li>
                    <li>Apenas OVs com status ativo contam (nao canceladas)</li>
                    <li>A data de emissao da OV determina em qual mes ela conta</li>
                    <li>Propostas convertidas em OV sao contabilizadas imediatamente</li>
                </ul>
                ${meta ? `
                <div style="background:var(--bg-input);padding:12px;border-radius:var(--radius-sm)">
                    <div style="font-weight:700;margin-bottom:8px">Seu progresso atual:</div>
                    <div>Meta mensal: R$ ${this.formatMoney(meta.meta_mensal)}</div>
                    <div>Realizado: R$ ${this.formatMoney(meta.realizado_mes)} (${pctMes}%)</div>
                    <div class="progress" style="margin-top:8px"><div class="progress-bar" style="width:${Math.min(100,pctMes)}%;background:${pctMes>=100?'var(--success)':'var(--accent)'}"></div></div>
                </div>` : ''}
            </div>
        </div>`;
        document.body.appendChild(modal);
    },

    _fechVendedorFilter: 'todos',

    _renderFechVendas(el) {
        const data = this._fechData;
        const mes = this._fechMes, ano = this._fechAno;
        const totalVendas = data.resultado.reduce((s, u) => s + u.total_comissao_vendas + (u.extra_gerente || 0), 0);
        const fech = data.fechamento_vendas;
        const isFechado = fech && fech.status === 'Fechado';

        // Qualitativo geral (weighted avg of all users)
        const allVendas = data.resultado.flatMap(u => u.vendas);
        const qualTotal = allVendas.reduce((s, v) => s + (v.qualitativo?.score_pct || 0) * v.valor_bruto, 0);
        const qualPeso = allVendas.reduce((s, v) => s + v.valor_bruto, 0);
        const qualGeral = qualPeso > 0 ? Math.round(qualTotal / qualPeso * 10) / 10 : 0;

        // Vendedores with data for filter
        const vendedoresComDados = data.resultado.filter(u => u.vendas.length > 0 || u.extra_gerente > 0);
        const filtro = this._fechVendedorFilter;
        const vendedoresFiltrados = filtro === 'todos' ? vendedoresComDados : vendedoresComDados.filter(u => u.id === parseInt(filtro));

        el.innerHTML = `
        <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap">
            <div class="stat-card" style="text-align:center;flex:1;min-width:200px">
                <div class="stat-label">Total comissões VENDAS</div>
                <div class="stat-value" style="font-size:26px;color:var(--success)">R$ ${this.formatMoney(totalVendas)}</div>
                <div style="margin-top:8px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap">
                    <button class="btn btn-outline btn-sm" onclick="APP.exportFechamento('vendas')">${LI("file-text",14)} Exportar CSV</button>
                    ${!isFechado ?
                        `<button class="btn btn-outline btn-sm" style="color:var(--success);border-color:var(--success)" onclick="APP.fecharMes(${ano},${mes},'vendas')">${LI("check",14)} Fechar Mês</button>` :
                        `<span class="status-tag status-aprovada" style="font-size:13px">FECHADO</span>
                         <button class="btn btn-outline btn-sm" style="color:var(--danger);border-color:var(--danger);margin-left:4px" onclick="APP.reabrirMes(${ano},${mes},'vendas')">${LI("refresh-cw",14)} Reabrir</button>`}
                </div>
            </div>
            <div class="stat-card" style="text-align:center;flex:1;min-width:200px;border-left:3px solid ${this._getQualColor(qualGeral)}">
                <div class="stat-label">${LI("bar-chart-3",16)} Qualitativo Equipe <span style="cursor:pointer;font-size:14px" onclick="APP.showQualitativoModal()" title="Como funciona">${LI('info',14)}</span></div>
                <div class="stat-value" style="font-size:26px;color:${this._getQualColor(qualGeral)}">${qualGeral}%</div>
                <div style="margin-top:4px">
                    <div style="background:var(--bg-secondary);border-radius:8px;height:8px;overflow:hidden;margin:6px 0">
                        <div style="height:100%;width:${Math.min(qualGeral, 100)}%;background:${this._getQualColor(qualGeral)};border-radius:8px;transition:width .3s"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted)">
                        <span>0</span><span style="color:var(--danger)">40</span><span style="color:var(--warning)">65</span><span style="color:var(--success)">100</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- FILTROS -->
        <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center;flex-wrap:wrap">
            <span style="font-size:12px;color:var(--text-muted);font-weight:600">FILTRAR:</span>
            <div class="status-chips">
                <div class="status-chip ${filtro==='todos'?'active':''}" onclick="APP._fechVendedorFilter='todos';APP._renderFechTab()">Todos</div>
                ${vendedoresComDados.map(u => `<div class="status-chip ${filtro==String(u.id)?'active':''}" onclick="APP._fechVendedorFilter='${u.id}';APP._renderFechTab()">${sanitize(u.nome)}</div>`).join('')}
            </div>
        </div>

        ${vendedoresFiltrados.map(u => `
        <div class="card">
            <div class="card-header">
                <div>
                    <span class="card-title">${sanitize(u.nome)}</span>
                    <span class="status-tag status-${u.perfil==='gerente'?'negociacao':(u.perfil==='diretor'?'convertida':'rascunho')}">${u.perfil}</span>
                    <span class="status-tag ${this._getQualTagClass(u.qualitativo_tier)}" style="margin-left:4px">${this._getQualLabel(u.qualitativo_tier)}</span>
                </div>
                <div style="text-align:right">
                    <div style="font-size:18px;font-weight:700;color:var(--success)">R$ ${this.formatMoney(u.total_comissao_vendas + (u.extra_gerente || 0))}</div>
                    <div style="font-size:13px;color:${this._getQualColor(u.qualitativo_score)};font-weight:600">Qualidade: ${u.qualitativo_score}%</div>
                </div>
            </div>
            <div class="values-table">
                <div class="value-row"><span>Comissão vendas (${u.vendas.length} OVs)</span><span>R$ ${this.formatMoney(u.total_comissao_vendas)}</span></div>
                ${u.extra_gerente > 0 ? `<div class="value-row highlight"><span>Extra gerente (diferença)</span><span>R$ ${this.formatMoney(u.extra_gerente)}</span></div>` : ''}
                <div class="value-row total"><span>TOTAL VENDAS</span><span>R$ ${this.formatMoney(u.total_comissao_vendas + (u.extra_gerente || 0))}</span></div>
            </div>
            <!-- DETALHES SEMPRE VISÍVEIS -->
            <div style="margin-top:8px">
                <div style="display:grid;grid-template-columns:auto 1fr auto auto auto;gap:4px 12px;font-size:12px;padding:6px 0;border-bottom:1px solid var(--border);font-weight:600;color:var(--text-secondary)">
                    <span>OV</span><span>Cliente</span><span>Valor</span><span>Comissão</span><span>Nota</span>
                </div>
                ${u.vendas.map(v => `<div style="display:grid;grid-template-columns:auto 1fr auto auto auto;gap:4px 12px;font-size:12px;padding:6px 0;border-bottom:1px solid var(--border);align-items:center">
                    <span onclick="APP.navigate('ov_view',{id:${v.ov_id}})" style="cursor:pointer;color:var(--accent);text-decoration:underline">${sanitize(v.numero)}</span>
                    <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${sanitize(v.cliente)}</span>
                    <span>R$ ${this.formatMoney(v.valor_bruto)}</span>
                    <span style="color:var(--success);font-weight:600">R$ ${this.formatMoney(v.comissao)}</span>
                    <span style="color:${this._getQualColor(v.qualitativo?.score_pct||0)};font-weight:600" title="Entrada: ${Math.round((v.qualitativo?.entrada_pct||0)*100)}% | ${v.qualitativo?.faturamento||'?'}">${v.qualitativo?.score_pct||0}%</span>
                </div>`).join('')}
            </div>
        </div>`).join('')}

        ${vendedoresComDados.length === 0 ? '<div class="empty-state"><p>Nenhuma comissão de vendas neste mês</p></div>' : ''}`;
    },

    _renderFechCompras(el) {
        const data = this._fechData;
        const mes = this._fechMes, ano = this._fechAno;
        const totalCompras = data.resultado.reduce((s, u) => s + u.total_comissao_compras, 0);
        const totalIntermediarios = data.intermediarios.reduce((s, i) => s + i.valor, 0);
        const fech = data.fechamento_compras;
        const isFechado = fech && fech.status === 'Fechado';

        el.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <div class="stat-card" style="text-align:center;flex:1;margin-right:8px">
                <div class="stat-label">Total comissões COMPRAS</div>
                <div class="stat-value" style="font-size:26px;color:var(--info)">R$ ${this.formatMoney(totalCompras + totalIntermediarios)}</div>
            </div>
            <div>
                ${!isFechado ?
                    `<button class="btn btn-info btn-sm" style="background:var(--info);border-color:var(--info)" onclick="APP.fecharMes(${ano},${mes},'compras')">${LI("check",14)} Fechar Compras</button>` :
                    `<span class="status-tag status-aprovada" style="font-size:13px">FECHADO</span>
                     <button class="btn btn-outline btn-sm" style="color:var(--danger);border-color:var(--danger);margin-left:4px" onclick="APP.reabrirMes(${ano},${mes},'compras')">${LI("refresh-cw",14)} Reabrir</button>`}
                <button class="btn btn-outline btn-sm" style="margin-left:6px" onclick="APP.exportFechamento('compras')">${LI("file-text",14)} Exportar</button>
            </div>
        </div>

        ${data.resultado.filter(u => u.compras.length > 0).map(u => `
        <div class="card">
            <div class="card-header">
                <div><span class="card-title">${sanitize(u.nome)}</span> <span class="status-tag status-${u.perfil==='gerente'?'negociacao':(u.perfil==='diretor'?'convertida':'rascunho')}">${u.perfil}</span></div>
                <span style="font-size:18px;font-weight:700;color:var(--info)">R$ ${this.formatMoney(u.total_comissao_compras)}</span>
            </div>
            <div class="values-table">
                <div class="value-row"><span>Comissão compras (${u.compras.length} OCs)</span><span>R$ ${this.formatMoney(u.total_comissao_compras)}</span></div>
                <div class="value-row total"><span>TOTAL COMPRAS</span><span>R$ ${this.formatMoney(u.total_comissao_compras)}</span></div>
            </div>
            <details style="margin-top:8px"><summary style="cursor:pointer;font-size:12px;color:var(--text-secondary)">Ver detalhes (${u.compras.length} ordens)</summary>
                <div style="margin-top:6px">
                ${u.compras.map(c => `<div class="parcela-row"><span onclick="APP.navigate('oc_view',{id:${c.oc_id}})" style="cursor:pointer;color:var(--accent)">${sanitize(c.numero)}</span><span>${sanitize(c.fornecedor)}</span><span>R$ ${this.formatMoney(c.valor)}</span><span style="color:var(--info);font-weight:600">${c.percentual}% → R$ ${this.formatMoney(c.comissao)}</span></div>`).join('')}
                </div>
            </details>
        </div>`).join('')}

        ${data.intermediarios.length > 0 ? `
        <div class="card" style="border-left:3px solid var(--warning)">
            <div class="card-header">
                <span class="card-title">${LI("users",20)} Comissões de Intermediários</span>
                <span style="font-size:16px;font-weight:700;color:var(--warning)">R$ ${this.formatMoney(totalIntermediarios)}</span>
            </div>
            <div style="margin-top:8px">
                ${data.intermediarios.map(i => `<div class="parcela-row"><span style="font-weight:600">${sanitize(i.nome)}</span><span>${sanitize(i.oc)}</span><span style="color:var(--warning);font-weight:600">R$ ${this.formatMoney(i.valor)}</span></div>`).join('')}
            </div>
        </div>` : ''}

        ${data.resultado.filter(u => u.compras.length > 0).length === 0 && data.intermediarios.length === 0 ? '<div class="empty-state"><p>Nenhuma comissão de compras neste mês</p></div>' : ''}`;
    },

    async fecharMes(ano, mes, tipo = 'geral') {
        const label = tipo === 'vendas' ? 'VENDAS' : tipo === 'compras' ? 'COMPRAS' : '';
        if (!await this.confirm(`Confirma fechar ${label} ${mes}/${ano}? Os valores serão travados.`)) return;
        const res = await this.api(`/api/fechamento/${ano}/${mes}/fechar`, { method: 'POST', body: { tipo } });
        if (res?.ok) { this.toast(`${label} fechado!`, 'success'); this.renderFechamento({ mes, ano }); }
    },

    async reabrirMes(ano, mes, tipo = 'geral') {
        const label = tipo === 'vendas' ? 'VENDAS' : tipo === 'compras' ? 'COMPRAS' : '';
        const motivo = prompt(`Motivo para reabrir ${label} ${mes}/${ano}:`);
        if (!motivo || !motivo.trim()) { this.toast('Motivo é obrigatório', 'warning'); return; }
        const res = await this.api(`/api/fechamento/${ano}/${mes}/reabrir`, {
            method: 'POST', body: { tipo, motivo: motivo.trim() }
        });
        if (res?.ok) { this.toast(`${label} reaberto`, 'success'); this.renderFechamento({ mes, ano }); }
        else if (res?.error) { this.toast(res.error, 'danger'); }
    },

    // ===== RELATÓRIOS =====
    async renderRelatorios(params = {}) {
        const el = document.getElementById('page-content');
        const ano = params.ano || new Date().getFullYear();
        const trimestre = params.trimestre || Math.ceil((new Date().getMonth() + 1) / 3);

        el.innerHTML = `<div class="loading">${this.skeletonKPI(4)}<div class="skeleton skeleton-card" style="height:200px"></div></div>`;
        const [anual, tri] = await Promise.all([
            this.api(`/api/analytics/${ano}`),
            this.api(`/api/analytics/trimestre/${ano}/${trimestre}`)
        ]);

        el.innerHTML = `
        ${this.pageHeader(LI('trending-up',20)+' Relatórios', 'dashboard', `
            <select class="form-control" style="width:auto;display:inline" onchange="APP.renderRelatorios({ano:parseInt(this.value)})">
                ${Array.from({length:5},(_,i)=>new Date().getFullYear()-2+i).map(a => `<option value="${a}" ${a===ano?'selected':''}>${a}</option>`).join('')}
            </select>
        `)}

        <div class="tabs">
            ${[1,2,3,4].map(q => `<div class="tab ${q===trimestre?'active':''}" onclick="APP.renderRelatorios({ano:${ano},trimestre:${q}})">Q${q}</div>`).join('')}
            <div class="tab ${!trimestre?'active':''}" onclick="APP.renderRelatorios({ano:${ano}})">Anual</div>
        </div>

        ${anual ? `
        <div class="stats-grid-4">
            <div class="stat-card stat-green"><div class="stat-value">R$ ${this.formatMoney(anual.vendas_por_mes?.reduce((a,b)=>a+b, 0))}</div><div class="stat-label">Total vendas ${ano}</div></div>
            <div class="stat-card stat-blue"><div class="stat-value">R$ ${this.formatMoney(anual.compras_por_mes?.reduce((a,b)=>a+b, 0))}</div><div class="stat-label">Total compras ${ano}</div></div>
            <div class="stat-card"><div class="stat-value">R$ ${this.formatMoney(anual.ticket_medio)}</div><div class="stat-label">Ticket médio</div></div>
            <div class="stat-card"><div class="stat-value">${this.formatNumber(anual.taxa_conversao)}%</div><div class="stat-label">Taxa conversão</div></div>
        </div>

        <div class="grid-2">
            <div class="card">
                <div class="card-header"><span class="card-title">${LI("trending-up",20)} Evolução Mensal</span></div>
                <canvas id="chart-relatorio-mensal" height="200"></canvas>
            </div>
            <div class="card">
                <div class="card-header"><span class="card-title">${LI("pie-chart",20)} Mix de Produtos</span></div>
                <canvas id="chart-relatorio-mix" height="200"></canvas>
            </div>
        </div>

        <div class="card" style="margin-bottom:16px">
            <div class="card-header"><span class="card-title">${LI("users",20)} Performance por Vendedor</span></div>
            <canvas id="chart-relatorio-vendedores" height="150"></canvas>
        </div>

        <div class="grid-2">
            <div class="card">
                <div class="card-header"><span class="card-title">${LI("trophy",20)} Top 10 Clientes</span></div>
                <div class="ranking-list">
                    ${(anual.top_clientes || []).map((c, i) => `<div class="ranking-item">
                        <span class="ranking-pos">${i+1}º</span>
                        <div class="ranking-info"><div class="ranking-name">${sanitize(c.nome)}</div><div class="ranking-sub">${c.count} pedidos</div></div>
                        <div class="ranking-value">R$ ${this.formatMoney(c.total)}</div>
                    </div>`).join('')}
                </div>
            </div>
            <div class="card">
                <div class="card-header"><span class="card-title">${LI("factory",20)} Top 10 Fornecedores</span></div>
                <div class="ranking-list">
                    ${(anual.top_fornecedores || []).map((f, i) => `<div class="ranking-item">
                        <span class="ranking-pos">${i+1}º</span>
                        <div class="ranking-info"><div class="ranking-name">${sanitize(f.nome)}</div><div class="ranking-sub">${f.count} OCs</div></div>
                        <div class="ranking-value">R$ ${this.formatMoney(f.total)}</div>
                    </div>`).join('')}
                </div>
            </div>
        </div>` : ''}

        ${tri ? `
        <div class="card">
            <div class="card-header"><span class="card-title">${LI("bar-chart-3",20)} Trimestre Q${trimestre}/${ano}</span></div>
            ${tri.comparativo_anterior ? `
            <div class="stats-grid-2">
                <div class="mini-stat"><div class="mini-stat-value ${tri.comparativo_anterior.variacao_vendas >= 0 ? 'text-green' : 'text-red'}">
                    ${tri.comparativo_anterior.variacao_vendas >= 0 ? LI('arrow-up',12) : LI('arrow-down',12)} ${this.formatNumber(Math.abs(tri.comparativo_anterior.variacao_vendas))}%
                </div><div class="mini-stat-label">Vendas vs Q anterior</div></div>
                <div class="mini-stat"><div class="mini-stat-value ${tri.comparativo_anterior.variacao_compras >= 0 ? 'text-green' : 'text-red'}">
                    ${tri.comparativo_anterior.variacao_compras >= 0 ? LI('arrow-up',12) : LI('arrow-down',12)} ${this.formatNumber(Math.abs(tri.comparativo_anterior.variacao_compras))}%
                </div><div class="mini-stat-label">Compras vs Q anterior</div></div>
            </div>` : ''}
        </div>` : ''}`;

        if (anual) this._drawCharts(anual);
    },

    // ===== NOTES =====
    async renderNotas() {
        const el = document.getElementById('page-content');
        const data = await this.api('/api/notas');
        if (!data) return;
        el.innerHTML = `
        ${this.pageHeader(LI('sticky-note',20)+' Notas', 'dashboard', '<button class="btn btn-primary btn-sm" onclick="FORMS.renderNotaForm()">+ Nova</button>')}
        ${data.items.length === 0 ? `<div class="empty-state"><div class="empty-icon">${LI('sticky-note',48)}</div><p>Nenhuma nota</p><p class="empty-hint">Anote informacoes importantes sobre seus clientes</p></div>` :
            data.items.map(n => `<div class="card" ${n.fixada?'style="border-color:var(--warning)"':''}>
                <div class="card-header"><span class="card-title">${n.fixada?LI('pin',14)+' ':''}${sanitize(n.titulo || 'Sem título')}</span><span style="font-size:11px;color:var(--text-muted)">${this.formatDate(n.updated_at)}</span></div>
                <div style="font-size:13px;color:var(--text-secondary)">${sanitize((n.conteudo || '').substring(0, 150))}</div>
            </div>`).join('')}`;
    },

    // ===== FOLLOW-UPS =====
    async renderFollowups() {
        const el = document.getElementById('page-content');
        const data = await this.api('/api/followups');
        if (!data) return;
        const hoje = new Date().toISOString().split('T')[0];

        el.innerHTML = `
        ${this.pageHeader(LI('bell',20)+' Follow-ups', 'dashboard', '<button class="btn btn-primary btn-sm" onclick="FORMS.renderFollowupForm()">+ Novo</button>')}
        ${data.items.length === 0 ? `<div class="empty-state"><div class="empty-icon">${LI('bell',48)}</div><p>Nenhum follow-up pendente</p><p class="empty-hint">Otimo! Voce esta em dia com seus contatos</p></div>` :
            data.items.map(f => {
                const atrasado = f.data_hora.split(' ')[0] < hoje;
                return `<div class="list-item ${atrasado?'list-item-danger':''}">
                    <div class="list-item-content">
                        <div class="list-item-title">${atrasado?LI('alert-triangle',14)+' ':LI('clock',14)+' '}${sanitize(f.razao_social || 'Geral')} — ${sanitize(f.acao)}</div>
                        <div class="list-item-sub">${this.formatDateTime(f.data_hora)}</div>
                    </div>
                    <button class="btn btn-success btn-sm" onclick="APP.concluirFollowup(${f.id});event.stopPropagation()">${LI('check',14)}</button>
                </div>`;
            }).join('')}`;
    },

    async concluirFollowup(id) {
        if (!await this.confirm('Marcar follow-up como concluido?')) return;
        await this.api(`/api/followups/${id}/concluir`, { method: 'PUT' });
        this.renderFollowups();
    },

    // ===== INTELIGÊNCIA COMERCIAL =====
    _intelTab: 'overview',

    async renderInteligencia() {
        const el = document.getElementById('page-content');
        el.innerHTML = `<div class="loading">${this.skeletonKPI(4)}${this.skeletonList(6)}</div>`;
        const data = await this.api('/api/intelligence');
        if (!data) return;
        this._intelData = data;

        const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

        el.innerHTML = `
        ${this.pageHeader(LI('brain',20)+' Inteligência Comercial', 'dashboard')}

        <div class="dash-tabs" style="margin-bottom:16px">
            <div class="dash-tab tab-vendas ${this._intelTab==='overview'?'active':''}" onclick="APP._switchIntelTab('overview')">Visão Geral</div>
            <div class="dash-tab ${this._intelTab==='winloss'?'active':''}" onclick="APP._switchIntelTab('winloss')">Win/Loss</div>
            <div class="dash-tab ${this._intelTab==='spread'?'active':''}" onclick="APP._switchIntelTab('spread')">Spread</div>
            <div class="dash-tab ${this._intelTab==='aging'?'active':''}" onclick="APP._switchIntelTab('aging')">Aging</div>
            <div class="dash-tab ${this._intelTab==='concentracao'?'active':''}" onclick="APP._switchIntelTab('concentracao')">Concentração</div>
        </div>

        <div id="intel-content"></div>`;

        this._renderIntelTab();
    },

    _switchIntelTab(tab) {
        this._intelTab = tab;
        document.querySelectorAll('.dash-tabs .dash-tab').forEach((t, i) => {
            const tabs = ['overview','winloss','spread','aging','concentracao'];
            t.classList.toggle('active', tabs[i] === tab);
        });
        this._renderIntelTab();
    },

    _renderIntelTab() {
        const el = document.getElementById('intel-content');
        if (!el) return;
        const d = this._intelData;
        const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

        switch (this._intelTab) {
            case 'overview': this._renderIntelOverview(el, d, MESES); break;
            case 'winloss': this._renderIntelWinLoss(el, d, MESES); break;
            case 'spread': this._renderIntelSpread(el, d, MESES); break;
            case 'aging': this._renderIntelAging(el, d); break;
            case 'concentracao': this._renderIntelConcentracao(el, d); break;
        }
        this._animateKPIs(el);
    },

    _renderIntelOverview(el, d, MESES) {
        const wl = d.win_loss;
        const conc = d.concentracao;
        const cy = d.cycle_time;
        const ag = d.aging;
        const comp = d.comparativo;

        // D4: Revenue as first visible element
        el.innerHTML = `
        <!-- KPI EXECUTIVE SUMMARY -->
        <div class="kpi-grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr))">
            <div class="kpi-card kpi-green">
                <div class="kpi-label">Faturamento ${d.ano}</div>
                <div class="kpi-value green">R$ ${this.formatMoney(comp.total_vendas)}</div>
                <div class="kpi-sub">${comp.mensal.reduce((s,m) => s + m.vendas_count, 0)} vendas</div>
            </div>
            <div class="kpi-card kpi-blue">
                <div class="kpi-label">Compras ${d.ano}</div>
                <div class="kpi-value blue">R$ ${this.formatMoney(comp.total_compras)}</div>
                <div class="kpi-sub">${comp.mensal.reduce((s,m) => s + m.compras_count, 0)} OCs</div>
            </div>
            <div class="kpi-card ${comp.resultado >= 0 ? 'kpi-green' : 'kpi-red'}">
                <div class="kpi-label">Resultado Bruto</div>
                <div class="kpi-value ${comp.resultado >= 0 ? 'green' : ''}" style="${comp.resultado < 0 ? 'color:var(--danger)' : ''}">R$ ${this.formatMoney(comp.resultado)}</div>
                <div class="kpi-sub">${comp.resultado >= 0 ? 'Superávit' : 'Déficit'}</div>
            </div>
            <div class="kpi-card kpi-yellow">
                <div class="kpi-label">Taxa Conversão</div>
                <div class="kpi-value yellow">${wl.taxa_geral}%</div>
                <div class="kpi-sub">${wl.convertidas} de ${wl.total_vendas}</div>
            </div>
            <div class="kpi-card kpi-purple">
                <div class="kpi-label">Ciclo Médio Venda</div>
                <div class="kpi-value">${cy.avg_venda} dias</div>
                <div class="kpi-sub">proposta → conversão</div>
            </div>
            <div class="kpi-card" style="border-left:3px solid ${ag.resumo['90_plus'] > 0 ? 'var(--danger)' : 'var(--success)'}">
                <div class="kpi-label">A Receber Total</div>
                <div class="kpi-value">R$ ${this.formatMoney(ag.resumo.total)}</div>
                <div class="kpi-sub">${ag.resumo['90_plus'] > 0 ? `R$ ${this.formatMoney(ag.resumo['90_plus'])} vencido +90d` : 'Nenhum vencido +90d'}</div>
            </div>
        </div>

        <!-- CONCENTRAÇÃO ALERTA -->
        <div class="card" style="margin-top:16px">
            <div class="card-header">
                <span class="card-title">${LI('alert-triangle',18)} Risco de Concentração</span>
                <span class="status-tag status-${conc.hhi_classificacao==='Baixa'?'aprovada':conc.hhi_classificacao==='Moderada'?'rascunho':'perdida'}">${conc.hhi_classificacao}</span>
            </div>
            <div style="padding:12px;font-size:13px">
                <p><strong>${conc.pareto_80}</strong> de ${conc.total_clientes} clientes (${conc.pareto_80_pct}%) representam 80% do faturamento.</p>
                <p style="color:var(--text-muted);margin-top:4px">HHI: ${conc.hhi} — ${conc.hhi < 1500 ? 'Carteira bem diversificada' : conc.hhi < 2500 ? 'Concentração moderada, diversificar é recomendado' : 'Alta concentração — risco elevado de dependência'}</p>
            </div>
        </div>

        <!-- D3: TABELA COMPARATIVA MENSAL -->
        <div class="card" style="margin-top:16px">
            <div class="card-header"><span class="card-title">${LI('table',18)} Comparativo Mensal ${d.ano}</span></div>
            <div class="table-container"><table>
                <tr><th>Mês</th><th>Vendas</th><th>Compras</th><th>Resultado</th><th>Props</th><th>Conv.</th><th>Taxa</th></tr>
                ${comp.mensal.map((m, i) => `
                <tr${i + 1 === new Date().getMonth() + 1 ? ' style="background:var(--accent-soft);font-weight:600"' : ''}>
                    <td>${MESES[m.mes-1]}</td>
                    <td style="color:var(--success)">R$ ${this.formatMoney(m.vendas)}</td>
                    <td style="color:var(--accent)">R$ ${this.formatMoney(m.compras)}</td>
                    <td style="color:${m.resultado >= 0 ? 'var(--success)' : 'var(--danger)'}">R$ ${this.formatMoney(m.resultado)}</td>
                    <td>${m.propostas}</td>
                    <td>${m.conversoes}</td>
                    <td>${m.taxa}%</td>
                </tr>`).join('')}
                <tr style="font-weight:700;border-top:2px solid var(--border)">
                    <td>TOTAL</td>
                    <td style="color:var(--success)">R$ ${this.formatMoney(comp.total_vendas)}</td>
                    <td style="color:var(--accent)">R$ ${this.formatMoney(comp.total_compras)}</td>
                    <td style="color:${comp.resultado >= 0 ? 'var(--success)' : 'var(--danger)'}">R$ ${this.formatMoney(comp.resultado)}</td>
                    <td>${comp.mensal.reduce((s,m) => s + m.propostas, 0)}</td>
                    <td>${comp.mensal.reduce((s,m) => s + m.conversoes, 0)}</td>
                    <td>${comp.mensal.reduce((s,m) => s + m.propostas, 0) > 0 ? Math.round(comp.mensal.reduce((s,m) => s + m.conversoes, 0) / comp.mensal.reduce((s,m) => s + m.propostas, 0) * 100) : 0}%</td>
                </tr>
            </table></div>
        </div>

        <!-- C7: YOY COMPARISON -->
        <div class="card" style="margin-top:16px">
            <div class="card-header"><span class="card-title">${LI('git-compare',18)} Vendas ${d.yoy.ano_atual} vs ${d.yoy.ano_anterior}</span></div>
            <div class="table-container"><table>
                <tr><th>Mês</th><th>${d.yoy.ano_anterior}</th><th>${d.yoy.ano_atual}</th><th>Variação</th></tr>
                ${d.yoy.vendas.map((v, i) => `
                <tr>
                    <td>${MESES[v.mes-1]}</td>
                    <td>R$ ${this.formatMoney(v.anterior)}</td>
                    <td style="font-weight:600">R$ ${this.formatMoney(v.atual)}</td>
                    <td style="color:${v.variacao >= 0 ? 'var(--success)' : 'var(--danger)'}">
                        ${v.anterior > 0 ? `${v.variacao > 0 ? '+' : ''}${v.variacao}%` : (v.atual > 0 ? 'Novo' : '—')}
                    </td>
                </tr>`).join('')}
            </table></div>
        </div>`;
    },

    _renderIntelWinLoss(el, d, MESES) {
        const wl = d.win_loss;
        const totalPerdido = wl.motivos.reduce((s, m) => s + m.valor, 0);

        el.innerHTML = `
        <div class="kpi-grid">
            <div class="kpi-card kpi-green">
                <div class="kpi-label">Propostas Ganhas</div>
                <div class="kpi-value green">${wl.convertidas}</div>
                <div class="kpi-sub">${wl.taxa_geral}% taxa de conversão</div>
            </div>
            <div class="kpi-card kpi-red" style="border-left:3px solid var(--danger)">
                <div class="kpi-label">Propostas Perdidas</div>
                <div class="kpi-value" style="color:var(--danger)">${wl.perdidas}</div>
                <div class="kpi-sub">R$ ${this.formatMoney(totalPerdido)} perdidos</div>
            </div>
            <div class="kpi-card kpi-yellow">
                <div class="kpi-label">Total Propostas</div>
                <div class="kpi-value yellow">${wl.total_vendas}</div>
                <div class="kpi-sub">${d.ano}</div>
            </div>
        </div>

        <!-- Motivos de perda -->
        <div class="card" style="margin-top:16px">
            <div class="card-header"><span class="card-title">${LI('x-circle',18)} Motivos de Perda</span></div>
            ${wl.motivos.length > 0 ? `
            <div style="padding:12px">
                ${wl.motivos.map(m => {
                    const pct = wl.perdidas > 0 ? Math.round(m.count / wl.perdidas * 100) : 0;
                    return `
                    <div style="margin-bottom:10px">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                            <span style="font-weight:600;font-size:13px">${sanitize(m.motivo_perda || 'Não informado')}</span>
                            <span style="font-size:12px;color:var(--text-muted)">${m.count} (${pct}%) — R$ ${this.formatMoney(m.valor)}</span>
                        </div>
                        <div style="height:8px;background:var(--bg-secondary);border-radius:4px;overflow:hidden">
                            <div style="height:100%;width:${pct}%;background:var(--danger);border-radius:4px;transition:width 0.5s"></div>
                        </div>
                    </div>`;
                }).join('')}
            </div>` : '<div style="padding:20px;text-align:center;color:var(--text-muted)">Nenhuma proposta perdida registrada</div>'}
        </div>

        <!-- Tendência Win/Loss mensal -->
        <div class="card" style="margin-top:16px">
            <div class="card-header"><span class="card-title">${LI('trending-up',18)} Tendência Mensal de Conversão</span></div>
            <div class="table-container"><table>
                <tr><th>Mês</th><th>Total</th><th>Ganhas</th><th>Perdidas</th><th>Taxa</th><th>Tendência</th></tr>
                ${wl.mensal.filter(m => m.total > 0).map(m => `
                <tr>
                    <td>${MESES[m.mes-1]}</td>
                    <td>${m.total}</td>
                    <td style="color:var(--success)">${m.ganhas}</td>
                    <td style="color:var(--danger)">${m.perdidas}</td>
                    <td style="font-weight:600">${m.taxa}%</td>
                    <td>
                        <div style="height:6px;width:80px;background:var(--bg-secondary);border-radius:3px;display:inline-block;vertical-align:middle">
                            <div style="height:100%;width:${m.taxa}%;background:${m.taxa >= 50 ? 'var(--success)' : m.taxa >= 25 ? 'var(--warning)' : 'var(--danger)'};border-radius:3px"></div>
                        </div>
                    </td>
                </tr>`).join('')}
            </table></div>
        </div>`;
    },

    _renderIntelSpread(el, d, MESES) {
        const spread = d.spread;
        const totalSpread = spread.reduce((s, c) => s + c.spread, 0);

        el.innerHTML = `
        <div class="kpi-grid">
            <div class="kpi-card ${totalSpread >= 0 ? 'kpi-green' : 'kpi-red'}">
                <div class="kpi-label">Spread Total</div>
                <div class="kpi-value ${totalSpread >= 0 ? 'green' : ''}" style="${totalSpread < 0 ? 'color:var(--danger)' : ''}">R$ ${this.formatMoney(totalSpread)}</div>
                <div class="kpi-sub">Venda - Compra ${d.ano}</div>
            </div>
            <div class="kpi-card kpi-green">
                <div class="kpi-label">Total Vendas</div>
                <div class="kpi-value green">R$ ${this.formatMoney(spread.reduce((s,c) => s + c.venda, 0))}</div>
            </div>
            <div class="kpi-card kpi-blue">
                <div class="kpi-label">Total Compras</div>
                <div class="kpi-value blue">R$ ${this.formatMoney(spread.reduce((s,c) => s + c.compra, 0))}</div>
            </div>
        </div>

        <div class="card" style="margin-top:16px">
            <div class="card-header"><span class="card-title">${LI('git-compare',18)} Spread Compra vs Venda por Categoria</span></div>
            <div class="table-container"><table>
                <tr><th>Categoria</th><th>Venda</th><th>Compra</th><th>Spread R$</th><th>Spread %</th></tr>
                ${spread.map(c => `
                <tr>
                    <td style="font-weight:600">${sanitize(c.categoria)}</td>
                    <td style="color:var(--success)">R$ ${this.formatMoney(c.venda)}</td>
                    <td style="color:var(--accent)">R$ ${this.formatMoney(c.compra)}</td>
                    <td style="color:${c.spread >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight:600">R$ ${this.formatMoney(c.spread)}</td>
                    <td style="color:${c.spread_pct >= 0 ? 'var(--success)' : 'var(--danger)'}">${c.compra > 0 ? (c.spread_pct > 0 ? '+' : '') + c.spread_pct + '%' : '—'}</td>
                </tr>`).join('')}
            </table></div>
        </div>

        <!-- Cycle Time section -->
        <div class="card" style="margin-top:16px">
            <div class="card-header"><span class="card-title">${LI('clock',18)} Tempo de Ciclo — Proposta → Conversão</span></div>
            <div class="kpi-grid" style="padding:12px">
                <div class="kpi-card kpi-blue">
                    <div class="kpi-label">Ciclo Médio Venda</div>
                    <div class="kpi-value blue">${d.cycle_time.avg_venda} dias</div>
                </div>
                <div class="kpi-card kpi-yellow">
                    <div class="kpi-label">Ciclo Médio Compra</div>
                    <div class="kpi-value yellow">${d.cycle_time.avg_compra} dias</div>
                </div>
            </div>
            ${d.cycle_time.mensal.filter(m => m.count > 0).length > 0 ? `
            <div class="table-container"><table>
                <tr><th>Mês</th><th>Conversões</th><th>Média (dias)</th><th></th></tr>
                ${d.cycle_time.mensal.filter(m => m.count > 0).map(m => `
                <tr>
                    <td>${MESES[m.mes-1]}</td>
                    <td>${m.count}</td>
                    <td style="font-weight:600">${m.avg_dias}d</td>
                    <td><div style="height:6px;width:80px;background:var(--bg-secondary);border-radius:3px;display:inline-block"><div style="height:100%;width:${Math.min(100,m.avg_dias/30*100)}%;background:${m.avg_dias <= 7 ? 'var(--success)' : m.avg_dias <= 15 ? 'var(--warning)' : 'var(--danger)'};border-radius:3px"></div></div></td>
                </tr>`).join('')}
            </table></div>` : ''}
        </div>`;
    },

    _renderIntelAging(el, d) {
        const ag = d.aging;
        const buckets = [
            {key: 'corrente', label: 'A Vencer', color: 'var(--success)'},
            {key: '1_30', label: '1-30 dias', color: 'var(--warning)'},
            {key: '31_60', label: '31-60 dias', color: '#f97316'},
            {key: '61_90', label: '61-90 dias', color: 'var(--danger)'},
            {key: '90_plus', label: '+90 dias', color: '#7f1d1d'}
        ];

        el.innerHTML = `
        <div class="kpi-grid" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr))">
            ${buckets.map(b => `
            <div class="kpi-card" style="border-left:3px solid ${b.color}">
                <div class="kpi-label">${b.label}</div>
                <div class="kpi-value" style="color:${b.color}">R$ ${this.formatMoney(ag.resumo[b.key])}</div>
                <div class="kpi-sub">${ag.detail_count[b.key]} parcela${ag.detail_count[b.key] !== 1 ? 's' : ''}</div>
            </div>`).join('')}
        </div>

        <!-- Aging Bar Visual -->
        <div class="card" style="margin-top:16px">
            <div class="card-header">
                <span class="card-title">${LI('bar-chart-3',18)} Aging de Recebíveis</span>
                <span style="font-size:13px;font-weight:700">Total: R$ ${this.formatMoney(ag.resumo.total)}</span>
            </div>
            <div style="padding:12px">
                ${ag.resumo.total > 0 ? `
                <div style="display:flex;height:32px;border-radius:8px;overflow:hidden;margin-bottom:12px">
                    ${buckets.map(b => {
                        const pct = ag.resumo.total > 0 ? (ag.resumo[b.key] / ag.resumo.total * 100) : 0;
                        return pct > 0 ? `<div style="width:${pct}%;background:${b.color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:600;min-width:${pct > 5 ? '0' : '30px'}">${pct > 8 ? Math.round(pct)+'%' : ''}</div>` : '';
                    }).join('')}
                </div>
                <div style="display:flex;gap:12px;flex-wrap:wrap;font-size:11px">
                    ${buckets.map(b => `<span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:2px;background:${b.color}"></span>${b.label}</span>`).join('')}
                </div>` : '<p style="text-align:center;color:var(--text-muted)">Nenhum recebível em aberto</p>'}
            </div>
        </div>

        <!-- Top Devedores -->
        ${ag.devedores.length > 0 ? `
        <div class="card" style="margin-top:16px">
            <div class="card-header"><span class="card-title">${LI('users',18)} Maiores Devedores</span></div>
            <div class="table-container"><table>
                <tr><th>Cliente</th><th>Total Devendo</th><th>Parcelas</th><th>Mais Antiga</th></tr>
                ${ag.devedores.map(d => `
                <tr onclick="APP.navigate('cadastro_view',{id:${d.id}})" style="cursor:pointer">
                    <td style="font-weight:600">${sanitize(d.nome)}</td>
                    <td style="color:var(--danger);font-weight:600">R$ ${this.formatMoney(d.total_devendo)}</td>
                    <td>${d.parcelas_abertas}</td>
                    <td>${this.formatDate(d.parcela_mais_antiga)}</td>
                </tr>`).join('')}
            </table></div>
        </div>` : ''}`;
    },

    _renderIntelConcentracao(el, d) {
        const conc = d.concentracao;
        const topClientes = conc.clientes;

        el.innerHTML = `
        <div class="kpi-grid">
            <div class="kpi-card" style="border-left:3px solid ${conc.hhi_classificacao==='Baixa'?'var(--success)':conc.hhi_classificacao==='Moderada'?'var(--warning)':'var(--danger)'}">
                <div class="kpi-label">Índice HHI</div>
                <div class="kpi-value">${conc.hhi}</div>
                <div class="kpi-sub">${conc.hhi_classificacao} concentração</div>
            </div>
            <div class="kpi-card kpi-blue">
                <div class="kpi-label">Regra 80/20</div>
                <div class="kpi-value blue">${conc.pareto_80}</div>
                <div class="kpi-sub">clientes = 80% faturamento</div>
            </div>
            <div class="kpi-card kpi-green">
                <div class="kpi-label">Total Clientes</div>
                <div class="kpi-value green">${conc.total_clientes}</div>
                <div class="kpi-sub">com vendas em ${d.ano}</div>
            </div>
            <div class="kpi-card kpi-yellow">
                <div class="kpi-label">Faturamento Total</div>
                <div class="kpi-value yellow">R$ ${this.formatMoney(conc.total_vendas)}</div>
            </div>
        </div>

        <!-- Pareto Chart (visual) -->
        <div class="card" style="margin-top:16px">
            <div class="card-header"><span class="card-title">${LI('pie-chart',18)} Curva de Pareto — Concentração de Faturamento</span></div>
            <div style="padding:12px">
                ${topClientes.map((c, i) => {
                    const barW = Math.max(3, c.pct);
                    const isOver80 = c.acum > 80;
                    return `
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12px" onclick="APP.navigate('cadastro_view',{id:${c.id}})" class="list-item" style="cursor:pointer;padding:4px 0">
                        <span style="width:24px;text-align:right;color:var(--text-muted);font-weight:600">${i+1}</span>
                        <div style="flex:1;min-width:0">
                            <div style="display:flex;justify-content:space-between;margin-bottom:2px">
                                <span style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${sanitize(c.nome)}</span>
                                <span style="white-space:nowrap;margin-left:8px">R$ ${this.formatMoney(c.total)} (${c.pct}%)</span>
                            </div>
                            <div style="height:6px;background:var(--bg-secondary);border-radius:3px;overflow:hidden">
                                <div style="height:100%;width:${barW}%;background:${isOver80 ? 'var(--text-muted)' : 'var(--accent)'};border-radius:3px"></div>
                            </div>
                        </div>
                        <span style="width:50px;text-align:right;color:${c.acum <= 80 ? 'var(--accent)' : 'var(--text-muted)'};font-weight:600;font-size:11px">${c.acum}%</span>
                    </div>`;
                }).join('')}
            </div>
        </div>

        <!-- Risk Assessment -->
        <div class="card" style="margin-top:16px">
            <div class="card-header"><span class="card-title">${LI('shield',18)} Avaliação de Risco</span></div>
            <div style="padding:16px">
                <div style="display:grid;gap:12px">
                    ${conc.hhi < 1500 ? `
                    <div class="insight-card insight-green">
                        <span class="insight-icon">${LI('check-circle',18)}</span>
                        <span>Carteira diversificada. Baixo risco de dependência de clientes específicos.</span>
                    </div>` : conc.hhi < 2500 ? `
                    <div class="insight-card insight-yellow">
                        <span class="insight-icon">${LI('alert-triangle',18)}</span>
                        <span>Concentração moderada. Recomendado diversificar a base de clientes para reduzir risco.</span>
                    </div>` : `
                    <div class="insight-card insight-red" style="background:rgba(239,68,68,0.08);border-left:3px solid var(--danger)">
                        <span class="insight-icon">${LI('alert-octagon',18)}</span>
                        <span>Alta concentração! Perda de um cliente-chave pode impactar severamente o faturamento. Ação urgente de diversificação necessária.</span>
                    </div>`}
                    ${topClientes.length > 0 && topClientes[0].pct > 30 ? `
                    <div class="insight-card insight-yellow">
                        <span class="insight-icon">${LI('target',18)}</span>
                        <span>${sanitize(topClientes[0].nome)} representa ${topClientes[0].pct}% do faturamento — risco de dependência individual.</span>
                    </div>` : ''}
                </div>
            </div>
        </div>`;
    },

    // ===== CONFIG =====
    _configTab: 'empresa',

    async renderConfig() {
        const el = document.getElementById('page-content');
        const [config, users, sugestoes] = await Promise.all([
            this.api('/api/config'),
            this.api('/api/users'),
            this.user.perfil !== 'vendedor' ? this.api('/api/sugestoes') : null
        ]);
        if (!config) return;
        this._configData = config;
        this._configUsers = users;
        this._configSugestoes = sugestoes;

        el.innerHTML = `
        ${this.pageHeader(LI('settings',20)+' Configurações', 'dashboard')}
        <div class="tabs" style="margin-bottom:16px;flex-wrap:wrap">
            <div class="tab ${this._configTab==='empresa'?'active':''}" onclick="APP.switchConfigTab('empresa',event)">${LI("settings",16)} Empresa</div>
            <div class="tab ${this._configTab==='comissoes'?'active':''}" onclick="APP.switchConfigTab('comissoes',event)">${LI("dollar-sign",16)} Comissões</div>
            <div class="tab ${this._configTab==='impostos'?'active':''}" onclick="APP.switchConfigTab('impostos',event)">${LI("coins",16)} Impostos</div>
            <div class="tab ${this._configTab==='comercial'?'active':''}" onclick="APP.switchConfigTab('comercial',event)">${LI("clipboard",16)} Comercial</div>
            <div class="tab ${this._configTab==='equipe'?'active':''}" onclick="APP.switchConfigTab('equipe',event)">${LI("users",16)} Equipe</div>
            <div class="tab ${this._configTab==='metas'?'active':''}" onclick="APP.switchConfigTab('metas',event)">${LI("target",16)} Metas</div>
            <div class="tab ${this._configTab==='sistema'?'active':''}" onclick="APP.switchConfigTab('sistema',event)">${LI("settings",16)} Sistema</div>
        </div>
        <div id="config-content"></div>`;
        this._renderConfigTab();
    },

    switchConfigTab(tab, e) {
        this._configTab = tab;
        document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
        if (e && e.target) e.target.classList.add('active');
        this._renderConfigTab();
    },

    async _renderConfigTab() {
        const el = document.getElementById('config-content');
        if (!el) return;
        const config = this._configData;
        const users = this._configUsers;
        const sugestoes = this._configSugestoes;

        if (this._configTab === 'empresa') {
            el.innerHTML = `
            <div class="card"><div class="card-header"><span class="card-title">${LI("settings",20)} Dados da Empresa</span></div>
                <div class="form-row">
                    <div class="form-group"><label>Razão Social</label><input class="form-control" id="cfg-razao" value="${config.empresa_razao_social || ''}"></div>
                    <div class="form-group"><label>CNPJ</label><input class="form-control" id="cfg-cnpj" value="${config.empresa_cnpj || ''}"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Inscrição Estadual</label><input class="form-control" id="cfg-ie" value="${config.empresa_ie || ''}"></div>
                    <div class="form-group"><label>Endereço</label><input class="form-control" id="cfg-endereco" value="${config.empresa_endereco || ''}"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Telefone</label><input class="form-control" id="cfg-telefone" value="${config.empresa_telefone || ''}"></div>
                    <div class="form-group"><label>Email</label><input class="form-control" id="cfg-email" value="${config.empresa_email || ''}"></div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="APP.salvarConfigEmpresa(this)">Salvar Dados</button>
            </div>`;
        } else if (this._configTab === 'comissoes') {
            const comVendas = JSON.parse(config.comissao_vendas || '{}');
            const comCompras = JSON.parse(config.comissao_compras || '{}');
            const categorias = FORMS.CATEGORIAS;
            const perfis = [
                {key:'vendedor', label:'Vendedor'},
                {key:'gerente', label:'Gestor'},
                {key:'diretor', label:'Diretor'}
            ];
            el.innerHTML = `
            <div class="card">
                <div class="card-header"><span class="card-title">${LI("dollar-sign",20)} Comissões de Venda (% sobre valor líquido)</span></div>
                <p style="font-size:12px;color:var(--text-secondary);margin-bottom:12px">
                    Defina o percentual de comissão por <strong>categoria</strong> e <strong>perfil do vendedor</strong>. A comissão é calculada sobre o valor líquido (após impostos).
                </p>
                <div style="overflow-x:auto">
                <table class="comp-table" style="min-width:600px">
                    <thead><tr>
                        <th style="min-width:200px">Categoria</th>
                        ${perfis.map(p => `<th style="text-align:center;min-width:100px">${p.label} (%)</th>`).join('')}
                    </tr></thead>
                    <tbody>
                    ${categorias.map(cat => {
                        return `<tr>
                            <td style="font-weight:600;font-size:12px">${cat}</td>
                            ${perfis.map(p => {
                                const val = (comVendas[p.key] || {})[cat] || 0;
                                return `<td style="text-align:center"><input type="number" step="0.1" min="0" max="100" class="form-control" style="width:80px;margin:0 auto;text-align:center;font-size:12px" id="cv-${p.key}-${cat.replace(/[^a-zA-Z0-9]/g,'_')}" value="${val}"></td>`;
                            }).join('')}
                        </tr>`;
                    }).join('')}
                    </tbody>
                </table>
                </div>
                <button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="APP.salvarComissoesVendas(this)">
                    ${LI("check",14)} Salvar Comissões de Venda
                </button>
            </div>

            <div class="card" style="margin-top:16px">
                <div class="card-header"><span class="card-title">${LI("bar-chart-3",20)} Comissões de Compra (% sobre valor líquido)</span></div>
                <p style="font-size:12px;color:var(--text-secondary);margin-bottom:12px">
                    Percentual fixo por perfil para todas as categorias de compra.
                </p>
                <div class="form-row-3">
                    <div class="form-group"><label>Gestor (%)</label><input type="number" step="0.1" class="form-control" id="cfg-com-gerente" value="${comCompras.gerente || comCompras.Guilherme || 0}"></div>
                    <div class="form-group"><label>Vendedor (%)</label><input type="number" step="0.1" class="form-control" id="cfg-com-vendedor" value="${comCompras.vendedor || comCompras.Thiago || 0}"></div>
                    <div class="form-group"><label>Diretor (%)</label><input type="number" step="0.1" class="form-control" id="cfg-com-diretor" value="${comCompras.diretor || comCompras.Pedro || 0}"></div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="APP.salvarComissoesCompras(this)">
                    ${LI("check",14)} Salvar Comissões de Compra
                </button>
            </div>

            <div class="card" style="margin-top:16px">
                <div class="card-header"><span class="card-title">${LI("trophy",20)} Bônus Semanal</span></div>
                <p style="font-size:12px;color:var(--text-secondary);margin-bottom:12px">
                    Bônus pago ao vendedor que bater a meta semanal.
                </p>
                <div class="form-row">
                    <div class="form-group"><label>Meta Semanal (R$)</label><input type="number" step="100" class="form-control" id="cfg-bonus-meta" value="${JSON.parse(config.bonus_semanal || '{}').meta_semanal || 50000}"></div>
                    <div class="form-group"><label>Valor do Bônus (R$)</label><input type="number" step="10" class="form-control" id="cfg-bonus-valor" value="${JSON.parse(config.bonus_semanal || '{}').valor_bonus || 250}"></div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="APP.salvarBonusSemanal(this)">
                    ${LI("check",14)} Salvar Bônus
                </button>
            </div>`;
        } else if (this._configTab === 'impostos') {
            el.innerHTML = `
            <div class="card"><div class="card-header"><span class="card-title">${LI("coins",20)} Impostos e Margens</span></div>
                <div class="form-row-3">
                    <div class="form-group"><label>PIS/COFINS (%)</label><input type="number" step="0.01" class="form-control" id="cfg-pis" value="${config.pis_percentual || 9.25}"></div>
                    <div class="form-group"><label>Margem mínima alerta (%)</label><input type="number" step="0.1" class="form-control" id="cfg-margem" value="${config.margem_minima_alerta || 10}"></div>
                </div>
                <div style="margin-top:12px"><strong>Tabela ICMS por UF (saindo de SP):</strong></div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:6px;margin-top:8px">
                    ${['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map(uf => {
                        const tabela = JSON.parse(config.icms_tabela || '{}');
                        return `<div style="display:flex;align-items:center;gap:4px"><span style="font-weight:600;width:28px">${uf}</span><input type="number" step="0.1" class="form-control" style="width:70px;font-size:11px" id="cfg-icms-${uf}" value="${tabela[uf] || 0}">%</div>`;
                    }).join('')}
                </div>
                <button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="APP.salvarConfigImpostos(this)">Salvar Impostos</button>
            </div>`;
        } else if (this._configTab === 'comercial') {
            const templates = JSON.parse(config.templates_condicoes || '{}');
            const politica = JSON.parse(config.politica_comercial || '[]');
            const dados_banc = JSON.parse(config.dados_bancarios || '{}');
            el.innerHTML = `
            <div class="card">
                <div class="card-header"><span class="card-title">${LI("clipboard",20)} Condições Padrão</span></div>
                <p style="font-size:12px;color:var(--text-secondary);margin-bottom:12px">
                    Valores default ao criar nova proposta.
                </p>
                <div class="form-row-3">
                    <div class="form-group"><label>Prazo de Entrega</label><input class="form-control" id="cfg-tpl-prazo" value="${templates.prazo_entrega || ''}"></div>
                    <div class="form-group"><label>Garantia</label><input class="form-control" id="cfg-tpl-garantia" value="${templates.garantia || ''}"></div>
                    <div class="form-group"><label>Frete Padrão</label>
                        <select class="form-control" id="cfg-tpl-frete">
                            <option value="FOB" ${templates.frete==='FOB'?'selected':''}>FOB</option>
                            <option value="CIF" ${templates.frete==='CIF'?'selected':''}>CIF</option>
                        </select>
                    </div>
                </div>
                <div class="form-group"><label>Validade Padrão (dias)</label>
                    <input type="number" class="form-control" style="width:120px" id="cfg-tpl-validade" value="${config.validade_padrao || 7}">
                </div>
                <button class="btn btn-primary btn-sm" onclick="APP.salvarConfigComercial(this)">
                    ${LI("check",14)} Salvar Condições
                </button>
            </div>

            <div class="card" style="margin-top:16px">
                <div class="card-header"><span class="card-title">${LI("wallet",20)} Dados Bancários (PDF)</span></div>
                <div class="form-row">
                    <div class="form-group"><label>Banco</label><input class="form-control" id="cfg-banco" value="${dados_banc.banco || ''}"></div>
                    <div class="form-group"><label>Agência</label><input class="form-control" id="cfg-agencia" value="${dados_banc.agencia || ''}"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Conta</label><input class="form-control" id="cfg-conta" value="${dados_banc.conta || ''}"></div>
                    <div class="form-group"><label>Chave PIX</label><input class="form-control" id="cfg-pix" value="${dados_banc.pix || ''}"></div>
                </div>
                <div class="form-group"><label>Titular</label><input class="form-control" id="cfg-titular" value="${dados_banc.titular || ''}"></div>
                <button class="btn btn-primary btn-sm" onclick="APP.salvarConfigBancarios(this)">
                    ${LI("check",14)} Salvar Dados Bancários
                </button>
            </div>

            <div class="card" style="margin-top:16px">
                <div class="card-header">
                    <span class="card-title">${LI("book-open",20)} Política Comercial (PDF)</span>
                    <button class="btn btn-outline btn-sm" onclick="APP.addPoliticaItem()">+ Item</button>
                </div>
                <p style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">Itens exibidos no PDF quando "Incluir política" está marcado.</p>
                <div id="politica-items">
                    ${(Array.isArray(politica) ? politica : []).map((item, i) => `
                    <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px" data-pol-idx="${i}">
                        <input class="form-control politica-input" style="flex:1;font-size:12px" value="${sanitize(item)}">
                        <button class="btn btn-outline btn-sm" style="color:var(--danger)" onclick="this.parentElement.remove()">×</button>
                    </div>`).join('')}
                </div>
                <button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="APP.salvarPoliticaComercial(this)">
                    ${LI("check",14)} Salvar Política
                </button>
            </div>`;
        } else if (this._configTab === 'equipe') {
            el.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">${LI("users",20)} Equipe</span>
                    <button class="btn btn-primary btn-sm" onclick="APP.showUserForm()">+ Novo Usuário</button>
                </div>
                <div id="user-form-area"></div>
                <table style="width:100%;font-size:13px;border-collapse:collapse">
                    <thead><tr style="border-bottom:2px solid var(--border)">
                        <th style="text-align:left;padding:8px">Nome</th>
                        <th style="text-align:left;padding:8px">Login</th>
                        <th style="text-align:left;padding:8px">Perfil</th>
                        <th style="text-align:center;padding:8px">Status</th>
                        <th style="text-align:right;padding:8px">Ações</th>
                    </tr></thead>
                    <tbody>
                    ${(users?.items || []).map(u => `
                        <tr style="border-bottom:1px solid var(--border)">
                            <td style="padding:10px 8px;font-weight:600">${sanitize(u.nome)}</td>
                            <td style="padding:10px 8px;color:var(--text-secondary)">${sanitize(u.username)}</td>
                            <td style="padding:10px 8px">
                                <select class="form-control" style="width:110px;font-size:11px;padding:4px" onchange="APP.updateUserPerfil(${u.id},this.value)">
                                    <option value="vendedor" ${u.perfil==='vendedor'?'selected':''}>Vendedor</option>
                                    <option value="gerente" ${u.perfil==='gerente'?'selected':''}>Gestor</option>
                                    <option value="diretor" ${u.perfil==='diretor'?'selected':''}>Diretor</option>
                                </select>
                            </td>
                            <td style="padding:10px 8px;text-align:center">
                                <span class="status-tag status-${u.ativo?'aprovada':'perdida'}" style="cursor:pointer" onclick="APP.toggleUserAtivo(${u.id},${u.ativo?0:1})">${u.ativo?'Ativo':'Inativo'}</span>
                            </td>
                            <td style="padding:10px 8px;text-align:right">
                                <button class="btn btn-outline btn-sm" onclick="APP.showResetPassword(${u.id},${JSON.stringify(sanitize(u.nome))})">${LI("settings",14)}</button>
                            </td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
        } else if (this._configTab === 'metas') {
            const mesAtual = new Date().toISOString().slice(0, 7);
            const metas = await this.api(`/api/metas?mes=${mesAtual}`);
            el.innerHTML = `
            <div class="card"><div class="card-header"><span class="card-title">${LI("target",20)} Metas do Mês (${mesAtual})</span></div>
                ${(users?.items || []).filter(u => u.ativo).map(u => {
                    const m = metas?.items?.find(x => x.user_id === u.id) || {};
                    return `<div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;padding:8px;background:var(--bg-input);border-radius:var(--radius-sm)">
                        <span style="min-width:100px;font-weight:600">${sanitize(u.nome)}</span>
                        <div class="form-group" style="margin:0"><label style="font-size:10px;margin:0">Meta Mensal (R$)</label>
                        <input type="number" class="form-control" style="width:130px" id="meta-mensal-${u.id}" value="${m.meta_mensal || ''}"></div>
                        <div class="form-group" style="margin:0"><label style="font-size:10px;margin:0">Meta Semanal (R$)</label>
                        <input type="number" class="form-control" style="width:130px" id="meta-semanal-${u.id}" value="${m.meta_semanal || ''}"></div>
                        <button class="btn btn-sm btn-primary" onclick="APP.salvarMeta(${u.id},'${mesAtual}')">Salvar</button>
                    </div>`;
                }).join('')}
            </div>`;
        } else if (this._configTab === 'sistema') {
            el.innerHTML = `
            <div class="detail-grid">
                <div class="card"><div class="card-header"><span class="card-title">${LI("download",20)} Backup</span></div>
                    <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">Backups automáticos a cada 6 horas. Último backup ao iniciar o servidor.</p>
                    <div style="display:flex;gap:8px">
                        <button class="btn btn-outline btn-sm" onclick="window.open('/api/backup/exportar')">${LI("download",14)} Exportar Banco</button>
                        <button class="btn btn-outline btn-sm" onclick="APP.backupManual()">${LI("download",14)} Backup Agora</button>
                    </div>
                </div>
                ${sugestoes ? `
                <div class="card"><div class="card-header"><span class="card-title">${LI("message-circle",20)} Sugestoes da Equipe (${sugestoes.items.length})</span></div>
                    ${sugestoes.items.length === 0 ? '<p style="color:var(--text-secondary);padding:8px">Nenhuma sugestao</p>' :
                    sugestoes.items.map(s => `
                    <div style="border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px;margin-bottom:10px;border-left:3px solid ${s.status==='Nova'?'var(--accent)':(s.status==='Em Análise'?'var(--warning)':(s.status==='Implementada'?'var(--success)':'var(--danger)'))}">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                            <div style="display:flex;align-items:center;gap:8px">
                                <span class="status-tag status-${s.status==='Nova'?'rascunho':(s.status==='Em Análise'?'negociacao':(s.status==='Implementada'?'aprovada':'perdida'))}">${s.status}</span>
                                <strong>[${s.categoria}]</strong>
                                <span style="color:var(--text-secondary);font-size:12px">— ${s.user_nome}</span>
                            </div>
                            <select class="form-control" style="width:130px;font-size:11px" onchange="APP.updateSugestao(${s.id}, this.value)">
                                <option value="Nova" ${s.status==='Nova'?'selected':''}>Nova</option>
                                <option value="Em Análise" ${s.status==='Em Análise'?'selected':''}>Em Analise</option>
                                <option value="Implementada" ${s.status==='Implementada'?'selected':''}>Implementada</option>
                                <option value="Descartada" ${s.status==='Descartada'?'selected':''}>Descartada</option>
                            </select>
                        </div>
                        <p style="margin:0 0 8px;font-size:13px">${sanitize(s.texto)}</p>
                        <div style="display:flex;gap:6px;align-items:center">
                            <input type="text" class="form-control" style="flex:1;font-size:12px;padding:4px 8px" id="sugestao-resp-${s.id}" placeholder="Responder..." value="${s.resposta || ''}">
                            <button class="btn btn-sm btn-outline" onclick="APP.responderSugestao(${s.id})">Enviar</button>
                        </div>
                        ${s.resposta ? `<div style="margin-top:6px;font-size:11px;color:var(--text-muted);font-style:italic">Resposta: ${sanitize(s.resposta)}</div>` : ''}
                    </div>`).join('')}
                </div>` : ''}
            </div>`;
        }
    },

    async _configSave(btn, fn) {
        const el = btn instanceof HTMLElement ? btn : (btn?.target || null);
        if (el) { el.disabled = true; const ot = el.innerHTML; el.innerHTML = '<span class="spinner" style="width:12px;height:12px;border-width:2px;display:inline-block;vertical-align:middle"></span> Salvando...'; try { await fn(); } finally { el.innerHTML = ot; el.disabled = false; } }
        else { await fn(); }
    },

    async salvarConfigEmpresa(btn) {
        await this._configSave(btn, async () => {
            const res = await this.api('/api/config', { method: 'PUT', body: {
                empresa_razao_social: document.getElementById('cfg-razao').value,
                empresa_cnpj: document.getElementById('cfg-cnpj').value,
                empresa_ie: document.getElementById('cfg-ie').value,
                empresa_endereco: document.getElementById('cfg-endereco').value,
                empresa_telefone: document.getElementById('cfg-telefone').value,
                empresa_email: document.getElementById('cfg-email').value,
            }});
            if (res?.ok) this.toast('Dados da empresa salvos!', 'success');
        });
    },

    async salvarConfigImpostos(btn) {
        await this._configSave(btn, async () => {
            const icms = {};
            ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].forEach(uf => {
                icms[uf] = parseFloat(document.getElementById(`cfg-icms-${uf}`).value) || 0;
            });
            const res = await this.api('/api/config', { method: 'PUT', body: {
                pis_percentual: document.getElementById('cfg-pis').value,
                margem_minima_alerta: document.getElementById('cfg-margem').value,
                icms_tabela: JSON.stringify(icms)
            }});
            if (res?.ok) this.toast('Impostos salvos!', 'success');
        });
    },

    async salvarComissoesVendas(btn) {
        await this._configSave(btn, async () => {
            const categorias = FORMS.CATEGORIAS;
            const perfis = ['vendedor','gerente','diretor'];
            const comissao = {};
            perfis.forEach(p => {
                comissao[p] = {};
                categorias.forEach(cat => {
                    const id = `cv-${p}-${cat.replace(/[^a-zA-Z0-9]/g,'_')}`;
                    const el = document.getElementById(id);
                    comissao[p][cat] = parseFloat(el?.value) || 0;
                });
            });
            const res = await this.api('/api/config', { method: 'PUT', body: {
                comissao_vendas: JSON.stringify(comissao)
            }});
            if (res?.ok) this.toast('Comissões de venda salvas!', 'success');
        });
    },

    async salvarComissoesCompras(btn) {
        await this._configSave(btn, async () => {
            const res = await this.api('/api/config', { method: 'PUT', body: {
                comissao_compras: JSON.stringify({
                    gerente: parseFloat(document.getElementById('cfg-com-gerente').value) || 0,
                    diretor: parseFloat(document.getElementById('cfg-com-diretor').value) || 0,
                    vendedor: parseFloat(document.getElementById('cfg-com-vendedor').value) || 0,
                })
            }});
            if (res?.ok) this.toast('Comissões de compra salvas!', 'success');
        });
    },

    async salvarBonusSemanal(btn) {
        await this._configSave(btn, async () => {
            const res = await this.api('/api/config', { method: 'PUT', body: {
                bonus_semanal: JSON.stringify({
                    meta_semanal: parseFloat(document.getElementById('cfg-bonus-meta').value) || 0,
                    valor_bonus: parseFloat(document.getElementById('cfg-bonus-valor').value) || 0,
                })
            }});
            if (res?.ok) this.toast('Bônus semanal salvo!', 'success');
        });
    },

    async salvarConfigComercial(btn) {
        await this._configSave(btn, async () => {
            const res = await this.api('/api/config', { method: 'PUT', body: {
                templates_condicoes: JSON.stringify({
                    prazo_entrega: document.getElementById('cfg-tpl-prazo').value,
                    garantia: document.getElementById('cfg-tpl-garantia').value,
                    frete: document.getElementById('cfg-tpl-frete').value,
                }),
                validade_padrao: document.getElementById('cfg-tpl-validade').value,
            }});
            if (res?.ok) this.toast('Condições comerciais salvas!', 'success');
        });
    },

    async salvarConfigBancarios(btn) {
        await this._configSave(btn, async () => {
            const res = await this.api('/api/config', { method: 'PUT', body: {
                dados_bancarios: JSON.stringify({
                    banco: document.getElementById('cfg-banco').value,
                    agencia: document.getElementById('cfg-agencia').value,
                    conta: document.getElementById('cfg-conta').value,
                    pix: document.getElementById('cfg-pix').value,
                    titular: document.getElementById('cfg-titular').value,
                })
            }});
            if (res?.ok) this.toast('Dados bancários salvos!', 'success');
        });
    },

    addPoliticaItem() {
        const container = document.getElementById('politica-items');
        if (!container) return;
        const div = document.createElement('div');
        div.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:6px';
        div.innerHTML = `<input class="form-control politica-input" style="flex:1;font-size:12px" placeholder="Nova cláusula...">
            <button class="btn btn-outline btn-sm" style="color:var(--danger)" onclick="this.parentElement.remove()">×</button>`;
        container.appendChild(div);
        div.querySelector('input').focus();
    },

    async salvarPoliticaComercial(btn) {
        await this._configSave(btn, async () => {
            const inputs = document.querySelectorAll('.politica-input');
            const items = [];
            inputs.forEach(inp => { if (inp.value.trim()) items.push(inp.value.trim()); });
            const res = await this.api('/api/config', { method: 'PUT', body: {
                politica_comercial: JSON.stringify(items)
            }});
            if (res?.ok) this.toast('Política comercial salva!', 'success');
        });
    },

    showUserForm() {
        document.getElementById('user-form-area').innerHTML = `
        <div style="background:var(--bg-input);padding:16px;border-radius:var(--radius-sm);margin-bottom:16px">
            <h4 style="margin-bottom:12px">Novo Usuário</h4>
            <div class="form-row">
                <div class="form-group"><label>Nome completo</label><input class="form-control" id="new-user-nome"></div>
                <div class="form-group"><label>Login (username)</label><input class="form-control" id="new-user-username"></div>
            </div>
            <div class="form-row-3">
                <div class="form-group"><label>Senha</label><input type="password" class="form-control" id="new-user-password"></div>
                <div class="form-group"><label>Perfil</label>
                    <select class="form-control" id="new-user-perfil">
                        <option value="vendedor">Vendedor</option>
                        <option value="gerente">Gestor</option>
                        <option value="diretor">Diretor</option>
                    </select>
                </div>
            </div>
            <div style="display:flex;gap:8px;margin-top:8px">
                <button class="btn btn-primary btn-sm" onclick="APP.criarUsuario()">Criar Usuário</button>
                <button class="btn btn-outline btn-sm" onclick="document.getElementById('user-form-area').innerHTML=''">Cancelar</button>
            </div>
        </div>`;
    },

    async criarUsuario() {
        const nome = document.getElementById('new-user-nome').value.trim();
        const username = document.getElementById('new-user-username').value.trim();
        const password = document.getElementById('new-user-password').value;
        const perfil = document.getElementById('new-user-perfil').value;
        if (!nome || !username || !password) return this.toast('Preencha todos os campos', 'danger');
        const res = await this.api('/api/users', { method: 'POST', body: { nome, username, password, perfil } });
        if (res?.ok) { this.toast('Usuário criado!', 'success'); this.renderConfig(); }
        else this.toast(res?.error || 'Erro ao criar', 'danger');
    },

    async updateUserPerfil(id, perfil) {
        const res = await this.api(`/api/users/${id}`, { method: 'PUT', body: { perfil } });
        if (res?.ok) this.toast('Perfil atualizado!', 'success');
    },

    async toggleUserAtivo(id, ativo) {
        if (!await this.confirm(ativo ? 'Ativar este usuario?' : 'Desativar este usuario? Ele perdera acesso ao sistema.')) return;
        const res = await this.api(`/api/users/${id}`, { method: 'PUT', body: { ativo } });
        if (res?.ok) { this.toast(ativo ? 'Usuário ativado' : 'Usuário desativado', 'success'); this.renderConfig(); }
    },

    async showResetPassword(id, nome) {
        const pw = await this.prompt(`Nova senha para ${nome}:`);
        if (!pw) return;
        const res = await this.api(`/api/users/${id}`, { method: 'PUT', body: { password: pw } });
        if (res?.ok) this.toast('Senha alterada!', 'success');
    },

    async salvarMeta(userId, mes) {
        const mensal = parseFloat(document.getElementById(`meta-mensal-${userId}`).value) || 0;
        const semanal = parseFloat(document.getElementById(`meta-semanal-${userId}`).value) || 0;
        const res = await this.api('/api/metas', { method: 'POST', body: { user_id: userId, mes, meta_mensal: mensal, meta_semanal: semanal } });
        if (res?.ok) this.toast('Meta salva!', 'success');
    },

    async updateSugestao(id, status) {
        await this.api(`/api/sugestoes/${id}`, { method: 'PUT', body: { status } });
        this.toast(`Status: ${status}`, 'success');
    },

    async responderSugestao(id) {
        const input = document.getElementById(`sugestao-resp-${id}`);
        const resposta = input?.value?.trim();
        if (!resposta) return this.toast('Escreva uma resposta', 'warning');
        const res = await this.api(`/api/sugestoes/${id}`, { method: 'PUT', body: { resposta } });
        if (res?.ok) this.toast('Resposta enviada!', 'success');
    },

    async backupManual() {
        const res = await this.api('/api/backup/manual', { method: 'POST' });
        if (res?.ok) this.toast('Backup feito!', 'success');
    },

    // ===== NOTIFICATIONS =====
    async renderNotificacoes() {
        const el = document.getElementById('page-content');
        const data = await this.api('/api/notificacoes');
        if (!data) return;
        await this.api('/api/notificacoes/ler', { method: 'POST' });
        el.innerHTML = `${this.pageHeader(LI('bell',20)+' Notificações', 'dashboard')}
        ${data.items.length === 0 ? `<div class="empty-state"><div class="empty-icon">${LI('bell',48)}</div><p>Sem notificacoes</p><p class="empty-hint">Voce esta atualizado!</p></div>` :
            data.items.map(n => `<div class="list-item"><div class="list-item-content"><div class="list-item-title">${sanitize(n.titulo)}</div><div class="list-item-sub">${sanitize(n.mensagem || '')} · ${this.formatDateTime(n.created_at)}</div></div></div>`).join('')}`;
    },

    // ===== SEARCH =====
    _searchTimeout: null,
    debounceSearch(q) {
        clearTimeout(this._searchTimeout);
        this._searchTimeout = setTimeout(() => this.globalSearch(q), 300);
    },

    async globalSearch(q) {
        const el = document.getElementById('search-results');
        const spinner = document.getElementById('search-spinner');
        if (!q || q.length < 2) { el.style.display = 'none'; if (spinner) spinner.style.display = 'none'; return; }
        if (spinner) spinner.style.display = 'block';
        const data = await this.api(`/api/busca?q=${encodeURIComponent(q)}`);
        if (spinner) spinner.style.display = 'none';
        if (!data || data.items.length === 0) { el.style.display = 'block'; el.innerHTML = '<div style="padding:12px;text-align:center;color:var(--text-secondary);font-size:13px">Nenhum resultado encontrado</div>'; return; }
        el.style.display = 'block';
        el.innerHTML = data.items.map(r => `
        <div class="search-result-item" onclick="APP.navigate('${r.tipo==='cadastro'?'cadastro_view':(r.tipo==='proposta'?'proposta_view':(r.tipo==='ov'?'ov_view':'oc_view'))}',{id:${r.id}});document.getElementById('search-results').style.display='none';document.getElementById('global-search').value=''">
            <div class="search-result-type">${sanitize(r.tipo)}</div>
            <div style="font-weight:500">${sanitize(r.titulo)}</div>
            <div style="font-size:12px;color:var(--text-secondary)">${sanitize(r.subtitulo || '')}</div>
        </div>`).join('');
    },

    // ===== NOTIFICATION DROPDOWN =====
    _notifDropdownOpen: false,
    async toggleNotifDropdown() {
        const dd = document.getElementById('notif-dropdown');
        if (!dd) { this.navigate('notificacoes'); return; }
        this._notifDropdownOpen = !this._notifDropdownOpen;
        if (!this._notifDropdownOpen) { dd.style.display = 'none'; return; }
        dd.style.display = 'block';
        dd.innerHTML = '<div style="padding:12px;text-align:center"><div class="spinner" style="margin:0 auto"></div></div>';
        const [followups, pipeline, propostas] = await Promise.all([
            this.api('/api/followups'),
            this.user.perfil !== 'vendedor' ? this.api('/api/pipeline') : null,
            this.api('/api/propostas?tipo=VENDA&status=Enviada')
        ]);
        const hoje = new Date().toISOString().split('T')[0];
        const em2d = new Date(Date.now() + 2*86400000).toISOString().split('T')[0];
        const atrasados = (followups?.items || []).filter(f => f.data_hora.split(' ')[0] <= hoje);
        const expirandoPropostas = (propostas?.items || []).filter(p => p.data_expiracao && p.data_expiracao <= em2d).slice(0, 5);

        let html = '<div style="padding:8px;max-height:360px;overflow-y:auto">';
        html += '<div style="font-size:11px;font-weight:700;color:var(--text-muted);padding:4px 8px;text-transform:uppercase">Follow-ups atrasados</div>';
        if (atrasados.length > 0) {
            html += atrasados.slice(0, 5).map(f => `<div class="search-result-item" onclick="APP.navigate('followups');APP.toggleNotifDropdown()" style="padding:8px;border-bottom:1px solid var(--border);cursor:pointer"><div style="font-size:12px;font-weight:600;color:var(--danger)">${sanitize(f.razao_social || 'Geral')}</div><div style="font-size:11px;color:var(--text-secondary)">${sanitize(f.acao)} - ${this.formatDateTime(f.data_hora)}</div></div>`).join('');
        } else { html += '<div style="padding:6px 8px;font-size:12px;color:var(--text-muted)">Nenhum atrasado</div>'; }

        if (pipeline && pipeline.hoje.count > 0) {
            html += '<div style="font-size:11px;font-weight:700;color:var(--text-muted);padding:8px 8px 4px;text-transform:uppercase">Pipeline hoje</div>';
            html += `<div class="search-result-item" onclick="APP.navigate('pipeline');APP.toggleNotifDropdown()" style="padding:8px;border-bottom:1px solid var(--border);cursor:pointer"><div style="font-size:12px;font-weight:600">${pipeline.hoje.count} proposta${pipeline.hoje.count!==1?'s':''} · R$ ${this.formatMoney(pipeline.hoje.total)}</div><div style="font-size:11px;color:var(--success)">Faturado: R$ ${this.formatMoney(pipeline.faturamento.hoje.total)}</div></div>`;
        }

        if (expirandoPropostas.length > 0) {
            html += '<div style="font-size:11px;font-weight:700;color:var(--text-muted);padding:8px 8px 4px;text-transform:uppercase">Propostas expirando</div>';
            html += expirandoPropostas.map(p => `<div class="search-result-item" onclick="APP.navigate('proposta_view',{id:${p.id}});APP.toggleNotifDropdown()" style="padding:8px;border-bottom:1px solid var(--border);cursor:pointer"><div style="font-size:12px;font-weight:600">${sanitize(p.razao_social || p.numero)}</div><div style="font-size:11px;color:var(--warning)">Validade: ${this.formatDate(p.data_expiracao)}</div></div>`).join('');
        }

        if (atrasados.length === 0 && (!pipeline || pipeline.hoje.count === 0) && expirandoPropostas.length === 0) {
            html += `<div style="padding:24px 16px;text-align:center"><div style="margin-bottom:8px">${LI('check-circle',32)}</div><div style="font-size:13px;color:var(--text-muted)">Tudo em dia! Nenhuma pendência.</div></div>`;
        }
        html += '<div style="padding:8px;text-align:center;margin-top:4px"><a style="font-size:12px;color:var(--accent);cursor:pointer" onclick="APP.navigate(\'notificacoes\');APP.toggleNotifDropdown()">Ver todas notificacoes</a></div>';
        html += '</div>';
        dd.innerHTML = html;
    },

    // ===== HOME PAGE =====
    async renderHome() {
        const el = document.getElementById('page-content');
        const recent = await this.api('/api/propostas?per_page=5');
        const hora = new Date().getHours();
        const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
        el.innerHTML = `
        <div class="home-page">
            <div style="text-align:center;padding:40px 20px 24px;position:relative">
                <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center top, rgba(99,102,241,0.12), transparent 70%);pointer-events:none"></div>
                <div style="font-size:36px;font-weight:900;background:linear-gradient(135deg,#6366f1,#8b5cf6,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:2px;position:relative">ABMT</div>
                <div style="font-size:14px;color:var(--text-secondary);margin-top:4px;font-weight:500;letter-spacing:3px;text-transform:uppercase;position:relative">Sistema Comercial</div>
                <div style="font-size:15px;color:var(--text-primary);margin-top:16px;position:relative">${saudacao}, <strong>${sanitize(this.user.nome)}</strong></div>
            </div>
            <div class="quick-actions-grid" style="margin-top:16px">
                <div class="quick-action" onclick="APP.navigate('proposta_form',{tipo:'VENDA'})"><span class="qa-icon">${LI("upload",20)}</span><span>Nova Venda</span></div>
                <div class="quick-action" onclick="APP.navigate('proposta_form',{tipo:'COMPRA'})"><span class="qa-icon">${LI("download",20)}</span><span>Nova Compra</span></div>
                <div class="quick-action" onclick="APP.navigate('dashboard')"><span class="qa-icon">${LI("layout-dashboard",20)}</span><span>Ver Dashboard</span></div>
            </div>
            ${recent && recent.items.length > 0 ? `
            <div class="card" style="margin-top:24px">
                <div class="card-header"><span class="card-title">${LI("clock",20)} Atividade Recente</span></div>
                ${recent.items.slice(0, 5).map(p => `
                <div class="list-item" onclick="APP.navigate('proposta_view',{id:${p.id}})">
                    <div class="list-item-badge">${sanitize(p.numero.replace('PROP-',''))}</div>
                    <div class="list-item-content">
                        <div class="list-item-title">${sanitize(p.razao_social || p.nome_fantasia || 'Sem cliente')}</div>
                        <div class="list-item-sub">${sanitize(p.tipo)} · ${this.formatDate(p.data_emissao)}</div>
                    </div>
                    <div class="list-item-right">
                        <div class="list-item-value">R$ ${this.formatMoney(p.valor_total)}</div>
                        <span class="status-tag status-${this.statusClass(p.status)}">${p.status}</span>
                    </div>
                </div>`).join('')}
            </div>` : ''}
        </div>`;
    },

    // ===== GUIA DO VENDEDOR =====
    renderGuia() {
        const el = document.getElementById('page-content');
        const _step = (n, text) => `<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px"><span style="background:var(--accent);color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${n}</span><span>${text}</span></div>`;
        const _tip = (text) => `<div style="background:var(--bg-secondary);border-radius:8px;padding:10px 12px;margin:8px 0;font-size:12px">${text}</div>`;
        const _section = (icon, title, body) => `<div class="card" style="margin-bottom:16px"><div class="card-title" style="font-size:16px;margin-bottom:12px">${icon} ${title}</div><div style="font-size:13px;color:var(--text-secondary);line-height:1.7">${body}</div></div>`;

        el.innerHTML = `
        ${this.pageHeader(LI('book-open',20)+' Guia Completo do Sistema', 'dashboard')}
        <div style="max-width:800px;margin:0 auto">

        <!-- ÍNDICE -->
        <div class="card" style="margin-bottom:16px;border:1px solid var(--accent)">
            <div class="card-title" style="font-size:16px;margin-bottom:8px">${LI("list",20)} Neste guia</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px">
                <a href="#guia-1" style="padding:6px;border-radius:4px;cursor:pointer;color:var(--accent)" onclick="document.getElementById('guia-1').scrollIntoView({behavior:'smooth'});return false">1. O que é o sistema</a>
                <a href="#guia-2" style="padding:6px;border-radius:4px;cursor:pointer;color:var(--accent)" onclick="document.getElementById('guia-2').scrollIntoView({behavior:'smooth'});return false">2. Entendendo os termos</a>
                <a href="#guia-3" style="padding:6px;border-radius:4px;cursor:pointer;color:var(--accent)" onclick="document.getElementById('guia-3').scrollIntoView({behavior:'smooth'});return false">3. Fluxo de Venda</a>
                <a href="#guia-4" style="padding:6px;border-radius:4px;cursor:pointer;color:var(--accent)" onclick="document.getElementById('guia-4').scrollIntoView({behavior:'smooth'});return false">4. Fluxo de Compra</a>
                <a href="#guia-5" style="padding:6px;border-radius:4px;cursor:pointer;color:var(--accent)" onclick="document.getElementById('guia-5').scrollIntoView({behavior:'smooth'});return false">5. Cadastrando clientes</a>
                <a href="#guia-6" style="padding:6px;border-radius:4px;cursor:pointer;color:var(--accent)" onclick="document.getElementById('guia-6').scrollIntoView({behavior:'smooth'});return false">6. Rotina diária</a>
                <a href="#guia-7" style="padding:6px;border-radius:4px;cursor:pointer;color:var(--accent)" onclick="document.getElementById('guia-7').scrollIntoView({behavior:'smooth'});return false">7. Busca e navegação</a>
                <a href="#guia-8" style="padding:6px;border-radius:4px;cursor:pointer;color:var(--accent)" onclick="document.getElementById('guia-8').scrollIntoView({behavior:'smooth'});return false">8. Gerando PDF</a>
                <a href="#guia-9" style="padding:6px;border-radius:4px;cursor:pointer;color:var(--accent)" onclick="document.getElementById('guia-9').scrollIntoView({behavior:'smooth'});return false">9. Meta e comissão</a>
                <a href="#guia-10" style="padding:6px;border-radius:4px;cursor:pointer;color:var(--accent)" onclick="document.getElementById('guia-10').scrollIntoView({behavior:'smooth'});return false">10. Nota qualitativa</a>
                <a href="#guia-11" style="padding:6px;border-radius:4px;cursor:pointer;color:var(--accent)" onclick="document.getElementById('guia-11').scrollIntoView({behavior:'smooth'});return false">11. Dicas e truques</a>
                <a href="#guia-12" style="padding:6px;border-radius:4px;cursor:pointer;color:var(--accent)" onclick="document.getElementById('guia-12').scrollIntoView({behavior:'smooth'});return false">12. No celular</a>
                <a href="#guia-13" style="padding:6px;border-radius:4px;cursor:pointer;color:var(--accent)" onclick="document.getElementById('guia-13').scrollIntoView({behavior:'smooth'});return false">13. Assistente IA</a>
                <a href="#guia-14" style="padding:6px;border-radius:4px;cursor:pointer;color:var(--accent)" onclick="document.getElementById('guia-14').scrollIntoView({behavior:'smooth'});return false">14. Atalhos rápidos</a>
            </div>
        </div>

        <!-- 1. O QUE É O SISTEMA -->
        <div id="guia-1"></div>
        ${_section(LI("monitor",20), 'O que é esse sistema?',
            `<p style="margin:0">É o sistema comercial da ABMT. Tudo que você faz no comercial passa por aqui: criar propostas de venda e compra, converter em ordens, acompanhar clientes, ver suas comissões e follow-ups. Funciona no celular e no computador — não precisa instalar nada, é pelo navegador.</p>
            ${_tip('<strong>O que você pode fazer aqui:</strong> Criar propostas, gerar PDFs, acompanhar ordens de venda/compra, gerenciar clientes, controlar follow-ups, ver suas metas e comissões, e usar o assistente de IA para consultas rápidas.')}`
        )}

        <!-- 2. ENTENDENDO OS TERMOS -->
        <div id="guia-2"></div>
        <div class="card" style="margin-bottom:16px">
            <div class="card-title" style="font-size:16px;margin-bottom:12px">${LI("book-open",20)} Entendendo os termos</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.7">
                <div style="display:grid;gap:8px">
                    <div style="background:var(--bg-secondary);border-radius:8px;padding:10px 12px;border-left:3px solid var(--accent)">
                        <strong style="color:var(--text-primary)">Proposta</strong> — O documento que você cria para negociar com o cliente ou fornecedor. Pode ser de <strong>Venda</strong> ou <strong>Compra</strong>. Tem status: Rascunho → Enviada → Em Negociação → Aprovada → Convertida (ou Perdida/Expirada).
                    </div>
                    <div style="background:var(--bg-secondary);border-radius:8px;padding:10px 12px;border-left:3px solid var(--success)">
                        <strong style="color:var(--text-primary)">OV (Ordem de Venda)</strong> — Quando o cliente aprova uma proposta de venda, você converte em OV. É o pedido confirmado. Gera parcelas de recebimento automaticamente.
                    </div>
                    <div style="background:var(--bg-secondary);border-radius:8px;padding:10px 12px;border-left:3px solid #a78bfa">
                        <strong style="color:var(--text-primary)">OC (Ordem de Compra)</strong> — Quando uma proposta de compra é aprovada, vira OC. É o pedido de compra confirmado. Gera parcelas de pagamento (contas a pagar).
                    </div>
                    <div style="background:var(--bg-secondary);border-radius:8px;padding:10px 12px;border-left:3px solid var(--warning)">
                        <strong style="color:var(--text-primary)">Follow-up</strong> — Lembrete de retorno. Você agenda uma data para ligar, enviar mensagem ou visitar o cliente. O sistema avisa quando está atrasado.
                    </div>
                    <div style="background:var(--bg-secondary);border-radius:8px;padding:10px 12px;border-left:3px solid var(--danger)">
                        <strong style="color:var(--text-primary)">Cadastro</strong> — Ficha do cliente ou fornecedor: CNPJ, endereço, contatos. Cada proposta e ordem é vinculada a um cadastro.
                    </div>
                </div>
            </div>
        </div>

        <!-- 3. FLUXO DE VENDA -->
        <div id="guia-3"></div>
        <div class="card" style="margin-bottom:16px">
            <div class="card-title" style="font-size:16px;margin-bottom:12px">${LI("upload",20)} Fluxo Completo de Venda</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.7">
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px;font-size:11px;font-weight:600">
                    <span style="background:var(--bg-input);padding:4px 10px;border-radius:12px">Cadastro</span>
                    <span style="color:var(--text-muted)">→</span>
                    <span style="background:var(--accent);color:white;padding:4px 10px;border-radius:12px">Proposta</span>
                    <span style="color:var(--text-muted)">→</span>
                    <span style="background:var(--warning);color:white;padding:4px 10px;border-radius:12px">Negociação</span>
                    <span style="color:var(--text-muted)">→</span>
                    <span style="background:var(--success);color:white;padding:4px 10px;border-radius:12px">Aprovada</span>
                    <span style="color:var(--text-muted)">→</span>
                    <span style="background:var(--success);color:white;padding:4px 10px;border-radius:12px">OV</span>
                </div>
                ${_step(1, '<strong>Cadastre o cliente</strong> — Vá em Clientes → + Novo. Digite o CNPJ e o sistema puxa os dados automaticamente da Receita Federal.')}
                ${_step(2, '<strong>Crie a proposta de venda</strong> — Dashboard → "+ Proposta Venda". Selecione o cliente, adicione os itens (categoria, quantidade, valor unitário), escolha condição de pagamento e frete.')}
                ${_step(3, '<strong>Gere o PDF e envie</strong> — Abra a proposta → botão "PDF". Baixe e envie por WhatsApp ou e-mail para o cliente.')}
                ${_step(4, '<strong>Agende follow-up</strong> — Crie um lembrete para ligar de volta em 2-3 dias. Não espere o cliente retornar sozinho.')}
                ${_step(5, '<strong>Negocie</strong> — Se precisar ajustar preço ou condição, edite a proposta. Pode duplicar para criar uma contra-proposta.')}
                ${_step(6, '<strong>Converta em OV</strong> — Cliente aprovou? Abra a proposta → "Converter em Venda". O sistema gera a OV e as parcelas de recebimento automaticamente.')}
                ${_tip('<strong>Importante:</strong> Ao converter, o valor da OV entra na sua meta mensal. A nota qualitativa é calculada pela condição de pagamento.')}
            </div>
        </div>

        <!-- 4. FLUXO DE COMPRA -->
        <div id="guia-4"></div>
        <div class="card" style="margin-bottom:16px">
            <div class="card-title" style="font-size:16px;margin-bottom:12px">${LI("download",20)} Fluxo de Compra</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.7">
                <p style="margin:0 0 8px">Compras funcionam igual vendas, mas ao contrário: você compra material de um fornecedor.</p>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px;font-size:11px;font-weight:600">
                    <span style="background:var(--bg-input);padding:4px 10px;border-radius:12px">Fornecedor</span>
                    <span style="color:var(--text-muted)">→</span>
                    <span style="background:#a78bfa;color:white;padding:4px 10px;border-radius:12px">Prop. Compra</span>
                    <span style="color:var(--text-muted)">→</span>
                    <span style="background:#a78bfa;color:white;padding:4px 10px;border-radius:12px">OC</span>
                </div>
                ${_step(1, '<strong>Cadastre o fornecedor</strong> — Mesmo processo: Clientes → + Novo. Fornecedores e clientes ficam na mesma base.')}
                ${_step(2, '<strong>Crie proposta de compra</strong> — Dashboard → "+ Proposta Compra". Selecione o fornecedor, itens e condição.')}
                ${_step(3, '<strong>Converta em OC</strong> — Fornecedor confirmou? Abra a proposta → "Converter em Compra". Gera a OC e parcelas de pagamento (contas a pagar).')}
                ${_tip('<strong>Compras também geram comissão!</strong> O percentual de comissão de compra é diferente do de venda e é configurado pelo gestor.')}
            </div>
        </div>

        <!-- 5. CADASTRANDO CLIENTES -->
        <div id="guia-5"></div>
        <div class="card" style="margin-bottom:16px">
            <div class="card-title" style="font-size:16px;margin-bottom:12px">${LI("users",20)} Cadastrando Clientes e Fornecedores</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.7">
                ${_step(1, 'Vá em <strong>Clientes</strong> no menu lateral (ou aba inferior no celular).')}
                ${_step(2, 'Clique em <strong>+ Novo</strong>.')}
                ${_step(3, 'Digite o <strong>CNPJ ou CPF</strong>. Se for CNPJ, clique "Buscar" — o sistema puxa razão social, endereço e tudo da Receita automaticamente.')}
                ${_step(4, 'Preencha os campos de contato: <strong>nome, telefone, WhatsApp, e-mail</strong>. Isso é fundamental para follow-ups.')}
                ${_step(5, 'Escolha o <strong>segmento</strong> (Reformador, Fabricante, Reciclagem, etc.) — ajuda nos filtros e relatórios.')}
                ${_step(6, 'Salve. Pronto! Agora você pode criar propostas para esse cliente.')}
                ${_tip('<strong>Tela do cliente:</strong> Ao abrir um cadastro, você vê todo o histórico: propostas, OVs, OCs, crédito disponível, última compra, e pode criar proposta diretamente de lá.')}
            </div>
        </div>

        <!-- 6. ROTINA DIÁRIA -->
        <div id="guia-6"></div>
        <div class="card" style="margin-bottom:16px">
            <div class="card-title" style="font-size:16px;margin-bottom:12px">${LI("calendar",20)} Sua rotina no sistema</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.8">
                ${_step(1, '<strong>Abra o Dashboard</strong> — Veja seu faturamento, follow-ups pendentes, propostas abertas e progresso de meta.')}
                ${_step(2, '<strong>Resolva os follow-ups</strong> — O ${LI("bell",14)} no topo mostra o que está atrasado. Não deixe acumular. Cada follow-up resolvido é um passo mais perto da venda.')}
                ${_step(3, '<strong>Verifique propostas enviadas</strong> — Propostas sem retorno há dias precisam de um empurrão. Ligue, mande mensagem.')}
                ${_step(4, '<strong>Crie novas propostas</strong> — Todo dia tem que ter ação comercial. Mesmo que seja uma proposta de prospecção.')}
                ${_step(5, '<strong>Converta aprovadas</strong> — Se tem proposta aprovada esperando, converta logo em OV.')}
                ${_tip('<strong>Regra de ouro:</strong> Faturamento depende de você. Todo dia tem que ter ação comercial, sem exceção.')}
            </div>
        </div>

        <!-- 7. BUSCA E NAVEGAÇÃO -->
        <div id="guia-7"></div>
        <div class="card" style="margin-bottom:16px">
            <div class="card-title" style="font-size:16px;margin-bottom:12px">${LI("search",20)} Busca e Navegação</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.7">
                <p style="margin:0 0 8px">O <strong>campo de busca no topo</strong> da tela pesquisa em tudo ao mesmo tempo:</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;margin-bottom:8px">
                    <div style="background:var(--bg-secondary);padding:8px;border-radius:6px">${LI("users",14)} Clientes por nome ou CNPJ</div>
                    <div style="background:var(--bg-secondary);padding:8px;border-radius:6px">${LI("file-text",14)} Propostas por número</div>
                    <div style="background:var(--bg-secondary);padding:8px;border-radius:6px">${LI("package",14)} OVs por número ou cliente</div>
                    <div style="background:var(--bg-secondary);padding:8px;border-radius:6px">${LI("download",14)} OCs por número ou fornecedor</div>
                </div>
                <p style="margin:0">Digite pelo menos 2 caracteres e os resultados aparecem instantaneamente. Clique no resultado para ir direto.</p>
                ${_tip('<strong>Menu lateral (desktop):</strong> No computador, use o menu à esquerda para navegar entre as seções. <strong>No celular:</strong> use a barra inferior ou o menu hambúrguer no canto superior.')}
            </div>
        </div>

        <!-- 8. GERANDO PDF -->
        <div id="guia-8"></div>
        <div class="card" style="margin-bottom:16px">
            <div class="card-title" style="font-size:16px;margin-bottom:12px">${LI("file-text",20)} Gerando PDF da Proposta</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.7">
                ${_step(1, 'Abra a proposta (Vendas → Propostas → clique na proposta).')}
                ${_step(2, 'Clique no botão <strong>"PDF"</strong> na barra de ações.')}
                ${_step(3, 'O PDF é gerado com: dados da empresa, dados do cliente, itens com valores, condição de pagamento, frete e observações.')}
                ${_step(4, 'Baixe e envie por <strong>WhatsApp</strong> ou <strong>e-mail</strong> para o cliente.')}
                ${_tip('<strong>Opções do PDF:</strong> Na proposta, você pode marcar "Incluir dados bancários" e "Incluir política comercial" para que apareçam no PDF. O gestor configura esses textos em Configurações → Comercial.')}
            </div>
        </div>

        <!-- 9. META E COMISSÃO -->
        <div id="guia-9"></div>
        <div class="card" style="margin-bottom:16px">
            <div class="card-title" style="font-size:16px;margin-bottom:12px">${LI("target",20)} Meta e Comissão</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.7">
                <p style="margin:0 0 8px">Todo mês o gestor define uma <strong>meta mensal em R$</strong> para cada vendedor. Ela é dividida automaticamente por semana.</p>
                ${_tip('<strong>Exemplo:</strong> Meta mensal: R$ 500.000 → Meta semanal: R$ 125.000')}
                <p style="margin:8px 0">Quando você converte uma proposta em OV, o sistema mostra automaticamente seu progresso. O valor que conta é o <strong>valor bruto da OV</strong>.</p>
                <p style="margin:8px 0"><strong>Comissão de venda:</strong> Cada categoria de material tem um percentual diferente de comissão. A comissão é calculada sobre o valor <strong>líquido</strong> (após impostos). Você pode ver as taxas em Configurações → Comissões.</p>
                <p style="margin:0"><strong>Comissão de compra:</strong> Compras também geram comissão, com percentuais configurados por perfil (vendedor, gerente, diretor).</p>
            </div>
        </div>

        <!-- 10. NOTA QUALITATIVA -->
        <div id="guia-10"></div>
        <div class="card" style="margin-bottom:16px">
            <div class="card-title" style="font-size:16px;margin-bottom:12px">${LI("bar-chart-3",20)} Nota Qualitativa (Bônus)</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.7">
                <p style="margin:0 0 8px">Cada venda recebe uma <strong>nota de 0 a 10</strong> baseada na condição de pagamento. Quanto melhor para a empresa, maior a nota.</p>
                <div style="background:var(--bg-secondary);border-radius:8px;padding:12px;margin:8px 0">
                    <div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:8px">Tabela de notas:</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px">
                        <div>${LI("coins",14)} À vista = <strong style="color:var(--success)">10</strong></div>
                        <div>${LI("calendar",14)} 28 dias = <strong style="color:var(--success)">9</strong></div>
                        <div>${LI("calendar",14)} 28/56 dias = <strong style="color:var(--warning)">8</strong></div>
                        <div>${LI("calendar",14)} 28/56/84 = <strong style="color:var(--warning)">7</strong></div>
                        <div>${LI("calendar",14)} 30/60/90 = <strong style="color:var(--danger)">6</strong></div>
                        <div>${LI("calendar",14)} 30/60/90/120 = <strong style="color:var(--danger)">5</strong></div>
                    </div>
                </div>
                <p style="margin:8px 0">Se o cliente pagar <strong>entrada</strong>, a nota sobe.</p>
                <div style="background:var(--bg-secondary);border-radius:8px;padding:12px;margin:8px 0">
                    <div style="font-size:12px;font-weight:600;margin-bottom:8px">Faixas de bônus:</div>
                    <div style="display:flex;flex-direction:column;gap:6px;font-size:12px">
                        <div style="display:flex;align-items:center;gap:8px"><span style="background:var(--danger);color:white;padding:2px 8px;border-radius:4px;font-weight:600;min-width:60px;text-align:center">0-40%</span> Sem bônus</div>
                        <div style="display:flex;align-items:center;gap:8px"><span style="background:var(--warning);color:white;padding:2px 8px;border-radius:4px;font-weight:600;min-width:60px;text-align:center">40-65%</span> Metade do bônus</div>
                        <div style="display:flex;align-items:center;gap:8px"><span style="background:var(--success);color:white;padding:2px 8px;border-radius:4px;font-weight:600;min-width:60px;text-align:center">65%+</span> Bônus total</div>
                    </div>
                </div>
                ${_tip('<strong>Dica:</strong> Negociar entrada e prazos curtos melhora sua nota e garante bônus no fechamento.')}
            </div>
        </div>

        <!-- 11. DICAS E TRUQUES -->
        <div id="guia-11"></div>
        <div class="card" style="margin-bottom:16px">
            <div class="card-title" style="font-size:16px;margin-bottom:12px">${LI("zap",20)} Dicas e Truques</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.7">
                <div style="display:grid;gap:8px">
                    <div style="background:var(--bg-secondary);padding:10px 12px;border-radius:8px">
                        <strong>${LI("clipboard",14)} Duplicar proposta:</strong> Abra uma proposta → botão "Duplicar". Cria uma cópia como Rascunho. Útil para fazer contra-proposta ou reaproveitar itens.
                    </div>
                    <div style="background:var(--bg-secondary);padding:10px 12px;border-radius:8px">
                        <strong>${LI("git-compare",14)} Vincular propostas:</strong> Uma proposta de venda pode ser vinculada a uma de compra. Assim o gestor sabe que material comprado vai para qual venda.
                    </div>
                    <div style="background:var(--bg-secondary);padding:10px 12px;border-radius:8px">
                        <strong>${LI("edit",14)} Editar depois de enviar:</strong> Pode editar proposta mesmo depois de enviada. Só não pode editar depois de convertida em OV/OC.
                    </div>
                    <div style="background:var(--bg-secondary);padding:10px 12px;border-radius:8px">
                        <strong>${LI("eye",14)} Ocultar valores:</strong> No Dashboard, clique "Ocultar valores" para esconder os números se alguém estiver olhando sua tela.
                    </div>
                    <div style="background:var(--bg-secondary);padding:10px 12px;border-radius:8px">
                        <strong>${LI("sticky-note",14)} Notas pessoais:</strong> Use a seção "Notas" no menu para anotar informações que não cabem em uma proposta — combinados verbais, ideias de prospecção, etc.
                    </div>
                </div>
            </div>
        </div>

        <!-- 12. NO CELULAR -->
        <div id="guia-12"></div>
        <div class="card" style="margin-bottom:16px">
            <div class="card-title" style="font-size:16px;margin-bottom:12px">${LI("monitor",20)} Usando no Celular</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.7">
                <p style="margin:0 0 8px">O sistema funciona direto no navegador do celular (Chrome, Safari). Não precisa instalar app.</p>
                <div style="display:grid;gap:8px">
                    <div style="background:var(--bg-secondary);padding:10px 12px;border-radius:8px">
                        <strong>Adicionar na tela inicial:</strong> No Chrome, toque nos 3 pontinhos → "Adicionar à tela inicial". Fica como um app com ícone.
                    </div>
                    <div style="background:var(--bg-secondary);padding:10px 12px;border-radius:8px">
                        <strong>Navegação:</strong> Use a barra inferior (Início, Vendas, Compras, Clientes, Mais). O menu lateral abre pelo ícone no canto superior.
                    </div>
                    <div style="background:var(--bg-secondary);padding:10px 12px;border-radius:8px">
                        <strong>Atualizar dados:</strong> Puxe a tela para baixo (pull-to-refresh) no Dashboard para atualizar os números.
                    </div>
                    <div style="background:var(--bg-secondary);padding:10px 12px;border-radius:8px">
                        <strong>Funciona offline?</strong> O sistema salva a interface no celular, mas precisa de internet para carregar os dados. Se ficar sem conexão, aparece um aviso.
                    </div>
                </div>
            </div>
        </div>

        <!-- 13. ASSISTENTE IA -->
        <div id="guia-13"></div>
        <div class="card" style="margin-bottom:16px;border:1px solid var(--accent)">
            <div class="card-title" style="font-size:16px;margin-bottom:12px">${LI("bot",20)} Assistente IA — Seu copiloto comercial</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.7">
                <p style="margin:0 0 8px">Clique no <strong style="color:var(--accent)">botão ${LI("message-circle",14)}</strong> no canto inferior direito para abrir o assistente. Ele consulta seus dados em tempo real.</p>
                <div style="font-size:12px;font-weight:600;margin-bottom:8px">Exemplos do que perguntar:</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px">
                    <div style="background:var(--bg-secondary);padding:8px;border-radius:6px">${LI("trending-up",14)} "Quanto faturei este mês?"</div>
                    <div style="background:var(--bg-secondary);padding:8px;border-radius:6px">${LI("users",14)} "Clientes inativos há 3 meses"</div>
                    <div style="background:var(--bg-secondary);padding:8px;border-radius:6px">${LI("file-text",14)} "Propostas abertas"</div>
                    <div style="background:var(--bg-secondary);padding:8px;border-radius:6px">${LI("coins",14)} "Minha comissão estimada"</div>
                    <div style="background:var(--bg-secondary);padding:8px;border-radius:6px">${LI("target",14)} "Quanto falta pra meta?"</div>
                    <div style="background:var(--bg-secondary);padding:8px;border-radius:6px">${LI("package",14)} "Produtos mais vendidos"</div>
                    <div style="background:var(--bg-secondary);padding:8px;border-radius:6px">${LI("bar-chart-3",14)} "Compara com mês passado"</div>
                    <div style="background:var(--bg-secondary);padding:8px;border-radius:6px">${LI("flame",14)} "Clientes que podem recomprar"</div>
                </div>
                <p style="margin:10px 0 0;font-size:12px;color:var(--text-muted)"><strong>Aba Sugestões:</strong> Dentro do assistente, use a aba "Sugestões" para enviar ideias de melhoria para o gestor. Toda sugestão é registrada.</p>
            </div>
            <div style="margin-top:12px;text-align:center">
                <button class="btn btn-primary btn-sm" onclick="APP.toggleAssistente()">${LI("message-circle",16)} Abrir Assistente</button>
            </div>
        </div>

        <!-- 14. ATALHOS RÁPIDOS -->
        <div id="guia-14"></div>
        <div class="card" style="margin-bottom:16px">
            <div class="card-title" style="font-size:16px;margin-bottom:12px">${LI("zap",20)} Atalhos rápidos</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">
                <div style="background:var(--bg-secondary);padding:10px;border-radius:8px;cursor:pointer" onclick="APP.navigate('proposta_form',{tipo:'VENDA'})">
                    <div style="font-weight:600;margin-bottom:2px">${LI("upload",14)} Nova Proposta Venda</div>
                    <div style="color:var(--text-muted)">Criar proposta de venda</div>
                </div>
                <div style="background:var(--bg-secondary);padding:10px;border-radius:8px;cursor:pointer" onclick="APP.navigate('proposta_form',{tipo:'COMPRA'})">
                    <div style="font-weight:600;margin-bottom:2px">${LI("download",14)} Nova Proposta Compra</div>
                    <div style="color:var(--text-muted)">Criar proposta de compra</div>
                </div>
                <div style="background:var(--bg-secondary);padding:10px;border-radius:8px;cursor:pointer" onclick="APP.navigate('vendas',{tab:'propostas'})">
                    <div style="font-weight:600;margin-bottom:2px">${LI("file-text",14)} Minhas Propostas</div>
                    <div style="color:var(--text-muted)">Ver e gerenciar propostas</div>
                </div>
                <div style="background:var(--bg-secondary);padding:10px;border-radius:8px;cursor:pointer" onclick="APP.navigate('vendas',{tab:'ovs'})">
                    <div style="font-weight:600;margin-bottom:2px">${LI("package",14)} Ordens de Venda</div>
                    <div style="color:var(--text-muted)">Acompanhar OVs</div>
                </div>
                <div style="background:var(--bg-secondary);padding:10px;border-radius:8px;cursor:pointer" onclick="APP.navigate('cadastros')">
                    <div style="font-weight:600;margin-bottom:2px">${LI("users",14)} Clientes</div>
                    <div style="color:var(--text-muted)">Cadastrar e consultar</div>
                </div>
                <div style="background:var(--bg-secondary);padding:10px;border-radius:8px;cursor:pointer" onclick="APP.navigate('followups')">
                    <div style="font-weight:600;margin-bottom:2px">${LI("bell",14)} Follow-ups</div>
                    <div style="color:var(--text-muted)">Retornos pendentes</div>
                </div>
                <div style="background:var(--bg-secondary);padding:10px;border-radius:8px;cursor:pointer" onclick="APP.navigate('notas')">
                    <div style="font-weight:600;margin-bottom:2px">${LI("sticky-note",14)} Notas</div>
                    <div style="color:var(--text-muted)">Anotações pessoais</div>
                </div>
                <div style="background:var(--bg-secondary);padding:10px;border-radius:8px;cursor:pointer" onclick="APP.navigate('fechamento')">
                    <div style="font-weight:600;margin-bottom:2px">${LI("clipboard",14)} Fechamento</div>
                    <div style="color:var(--text-muted)">Comissões e qualitativo</div>
                </div>
            </div>
        </div>

        </div>`;
    },

    // ===== ASSISTENTE IA =====
    toggleAssistente() {
        const panel = document.getElementById('assistente-panel');
        if (panel) panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    },

    switchAssistenteTab(tab) {
        document.getElementById('assistente-chat').style.display = tab === 'chat' ? 'flex' : 'none';
        document.getElementById('assistente-sugestoes').style.display = tab === 'sugestoes' ? 'block' : 'none';
        document.querySelectorAll('.assistente-tab').forEach((t, i) => {
            t.classList.toggle('active', (i === 0 && tab === 'chat') || (i === 1 && tab === 'sugestoes'));
        });
    },

    async sendAssistente() {
        const input = document.getElementById('assistente-input');
        const pergunta = input.value.trim();
        if (!pergunta) return;
        input.value = '';

        const msgs = document.getElementById('assistente-messages');
        const timeNow = new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'});
        msgs.innerHTML += `<div class="assistente-msg user">${sanitize(pergunta)}<div class="assistente-msg-time">${timeNow}</div></div>`;
        msgs.innerHTML += `<div class="assistente-msg bot" id="assistente-typing"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
        msgs.scrollTop = msgs.scrollHeight;

        // Try insights endpoint first (real data queries)
        let res = await this.api('/api/ia/insights', { method: 'POST', body: { pergunta } });
        if (!res || !res.resposta) {
            // Fallback to keyword matching
            res = await this.api('/api/ia/ask', { method: 'POST', body: { pergunta } });
        }
        if (!res || !res.resposta) {
            // Final fallback to legacy endpoint
            res = await this.api('/api/assistente', { method: 'POST', body: { pergunta } });
        }

        const typingEl = document.getElementById('assistente-typing');
        if (typingEl) typingEl.remove();

        const replyTime = new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'});
        if (res && res.resposta) {
            msgs.innerHTML += `<div class="assistente-msg bot">${sanitize(res.resposta)}<div class="assistente-msg-time">${replyTime}</div></div>`;
        } else {
            msgs.innerHTML += `<div class="assistente-msg bot">Desculpe, nao consegui encontrar uma resposta. Tente reformular a pergunta.<div class="assistente-msg-time">${replyTime}</div></div>`;
        }
        msgs.scrollTop = msgs.scrollHeight;
    },

    sendAssistenteSuggestion(text) {
        const input = document.getElementById('assistente-input');
        if (input) { input.value = text; this.sendAssistente(); }
    },

    async enviarSugestao() {
        const categoria = document.getElementById('sugestao-categoria').value;
        const texto = document.getElementById('sugestao-texto').value.trim();
        if (!texto) return this.toast('Escreva sua sugestao', 'warning');

        const res = await this.api('/api/sugestoes', { method: 'POST', body: { categoria, texto } });
        if (res?.ok) {
            this.toast('Sugestao enviada! Obrigado.', 'success');
            document.getElementById('sugestao-texto').value = '';
            // Show success message in place
            const form = document.getElementById('assistente-sugestoes');
            if (form) {
                const successDiv = document.createElement('div');
                successDiv.style.cssText = 'background:var(--success);color:white;padding:12px;border-radius:var(--radius-sm);margin:12px;text-align:center;font-weight:600';
                successDiv.textContent = 'Sugestao enviada com sucesso! Obrigado pelo feedback.';
                form.prepend(successDiv);
                setTimeout(() => successDiv.remove(), 4000);
            }
        }
    },

    confirm(msg) {
        return new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `<div class="modal confirm-modal">
                <div class="modal-header"><span class="modal-title">${LI('alert-circle',20)} Confirmação</span></div>
                <div style="padding:16px;font-size:14px;color:var(--text-secondary)">${msg}</div>
                <div style="padding:0 16px 16px;display:flex;gap:8px;justify-content:flex-end">
                    <button class="btn btn-outline btn-sm" id="confirm-cancel">Cancelar</button>
                    <button class="btn btn-primary btn-sm" id="confirm-ok">Confirmar</button>
                </div>
            </div>`;
            document.body.appendChild(overlay);
            overlay.querySelector('#confirm-ok').onclick = () => { overlay.remove(); resolve(true); };
            overlay.querySelector('#confirm-cancel').onclick = () => { overlay.remove(); resolve(false); };
            overlay.onclick = e => { if (e.target === overlay) { overlay.remove(); resolve(false); } };
        });
    },

    prompt(msg, defaultVal = '') {
        return new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `<div class="modal confirm-modal">
                <div class="modal-header"><span class="modal-title">${LI('edit',20)} Entrada</span><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">${LI('x',16)}</button></div>
                <div style="padding:16px"><label style="font-size:14px;color:var(--text-secondary);display:block;margin-bottom:8px">${msg}</label>
                <input type="text" class="form-control" id="prompt-input" value="${defaultVal}"></div>
                <div style="padding:0 16px 16px;display:flex;gap:8px;justify-content:flex-end">
                    <button class="btn btn-outline btn-sm" id="prompt-cancel">Cancelar</button>
                    <button class="btn btn-primary btn-sm" id="prompt-ok">OK</button>
                </div>
            </div>`;
            document.body.appendChild(overlay);
            const input = overlay.querySelector('#prompt-input');
            setTimeout(() => input.focus(), 100);
            input.onkeydown = e => { if (e.key === 'Enter') { overlay.remove(); resolve(input.value); } };
            overlay.querySelector('#prompt-ok').onclick = () => { overlay.remove(); resolve(input.value); };
            overlay.querySelector('#prompt-cancel').onclick = () => { overlay.remove(); resolve(null); };
            overlay.onclick = e => { if (e.target === overlay) { overlay.remove(); resolve(null); } };
        });
    },

    showModal(title, html) {
        this.closeModal();
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'generic-modal';
        overlay.innerHTML = `<div class="modal">
            <div class="modal-header"><span class="modal-title">${title}</span><button class="modal-close" onclick="APP.closeModal()">${LI('x',16)}</button></div>
            <div style="padding:16px">${html}</div>
        </div>`;
        document.body.appendChild(overlay);
        overlay.onclick = e => { if (e.target === overlay) this.closeModal(); };
    },

    closeModal() {
        const m = document.getElementById('generic-modal');
        if (m) m.remove();
    },

    async doLogout() { if (!await this.confirm('Tem certeza que deseja sair?')) return; await this.api('/api/logout', { method: 'POST' }); this.user = null; this.renderLogin(); },

    // ===== SIDEBAR MOBILE =====
    toggleSidebar() {
        const sb = document.getElementById('sidebar');
        const bd = document.getElementById('sidebar-backdrop');
        sb.classList.toggle('open');
        if (bd) bd.classList.toggle('show');
    },
    closeSidebar() {
        const sb = document.getElementById('sidebar');
        const bd = document.getElementById('sidebar-backdrop');
        sb.classList.remove('open');
        if (bd) bd.classList.remove('show');
    },

    // ===== FOLLOW-UP BADGE =====
    async updateFollowupBadge() {
        const data = await this.api('/api/followups');
        if (!data) return;
        const hoje = new Date().toISOString().split('T')[0];
        const vencidos = data.items.filter(f => f.data_hora.split(' ')[0] <= hoje).length;
        const badge = document.getElementById('notif-badge');
        if (badge) {
            if (vencidos > 0) { badge.style.display = 'inline'; badge.textContent = vencidos; }
            else { badge.style.display = 'none'; }
        }
    },

    // ===== FECHAMENTO EXPORT =====
    async exportFechamento(tipo) {
        const mes = this._fechMes, ano = this._fechAno;
        window.open(`/api/fechamento/${ano}/${mes}/export?tipo=${tipo}`, '_blank');
    },

    // ===== FORM SUBMIT PROTECTION =====
    setSubmitting(form, loading) {
        const btn = form?.querySelector('[type="submit"]') || form?.querySelector('.btn-primary');
        if (!btn) return;
        btn.disabled = loading;
        if (loading) { btn.dataset.originalText = btn.innerHTML; btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;vertical-align:middle"></span> Salvando...'; }
        else { btn.innerHTML = btn.dataset.originalText || btn.innerHTML; }
    },

    // ===== LOADING SKELETON =====
    showLoading(container) {
        const el = typeof container === 'string' ? document.getElementById(container) : container;
        if (!el) return;
        el.innerHTML = `<div style="padding:24px;display:flex;flex-direction:column;gap:12px">
            <div class="skeleton" style="height:20px;width:60%;border-radius:6px"></div>
            <div class="skeleton" style="height:14px;width:90%;border-radius:4px"></div>
            <div class="skeleton" style="height:14px;width:75%;border-radius:4px"></div>
            <div class="skeleton" style="height:40px;width:100%;border-radius:8px;margin-top:8px"></div>
            <div class="skeleton" style="height:40px;width:100%;border-radius:8px"></div>
        </div>`;
    },

    // ===== ACTION BUTTON PROTECTION =====
    _actionLock: false,
    async safeAction(btn, fn) {
        if (this._actionLock) return;
        this._actionLock = true;
        const el = typeof btn === 'string' ? document.querySelector(btn) : btn;
        const orig = el?.innerHTML;
        if (el) { el.disabled = true; el.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;vertical-align:middle"></span>'; }
        try { await fn(); }
        finally { this._actionLock = false; if (el) { el.disabled = false; el.innerHTML = orig; } }
    },

    // ===== DIRTY FORM TRACKING =====
    _formDirty: false,
    markFormDirty() { this._formDirty = true; },
    clearFormDirty() { this._formDirty = false; },
    checkDirtyForm() {
        if (!this._formDirty) return true;
        if (confirm('Você tem alterações não salvas. Deseja sair sem salvar?')) {
            this._formDirty = false;
            return true;
        }
        return false;
    },

    // ===== UTILS =====
    formatMoney(v) { return (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
    formatNumber(v) { return (v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 }); },
    formatDate(d) {
        if (!d) return '-';
        try {
            // Evitar bug de timezone: date-only strings (YYYY-MM-DD) são parsed como UTC
            const s = String(d);
            if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + 'T00:00:00').toLocaleDateString('pt-BR');
            if (/^\d{4}-\d{2}-\d{2}[ T]/.test(s)) return new Date(s.replace(' ', 'T')).toLocaleDateString('pt-BR');
            return new Date(s).toLocaleDateString('pt-BR');
        } catch { return d; }
    },
    formatDateTime(d) {
        if (!d) return '-';
        try {
            const s = String(d);
            if (/^\d{4}-\d{2}-\d{2} /.test(s)) return new Date(s.replace(' ', 'T')).toLocaleString('pt-BR');
            return new Date(s).toLocaleString('pt-BR');
        } catch { return d; }
    },
    statusClass(s) {
        const map = {'Rascunho':'rascunho','Enviada':'enviada','Em Negociação':'negociacao','Aprovada':'aprovada',
            'Convertida':'convertida','Perdida':'perdida','Expirada':'expirada','Cancelada':'cancelada',
            'Enviada ao Fornecedor':'enviada','Confirmada':'aprovada','Recebida Parcial':'negociacao',
            'Recebida Total':'aprovada','Em Separação':'negociacao','Faturada':'convertida','Entregue':'aprovada'};
        return map[s] || 'rascunho';
    },
    toast(msg, type = 'info') {
        const iconMap = { success: LI('check-circle',16), danger: LI('x-circle',16), warning: LI('alert-circle',16), info: LI('info',16) };
        const t = document.createElement('div');
        t.className = `toast toast-${type} show`;
        t.innerHTML = `<span class="toast-icon">${iconMap[type] || iconMap.info}</span><span>${sanitize(msg)}</span>`;
        document.body.appendChild(t);
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
    },

    // ===== COUNT-UP ANIMATION =====
    countUp(el, target, prefix = '', suffix = '', duration = 800, decimals = 2) {
        if (!el || isNaN(target)) return;
        const start = 0;
        const startTime = performance.now();
        el.classList.add('counting');
        const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + (target - start) * eased;
            el.textContent = prefix + current.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
            if (progress < 1) requestAnimationFrame(step);
            else el.classList.remove('counting');
        };
        requestAnimationFrame(step);
    },

    // ===== RIPPLE EFFECT =====
    initRipple() {
        document.addEventListener('pointerdown', (e) => {
            const target = e.target.closest('.btn, .nav-link, .nav-item, .quick-action, .kpi-card, .list-item, .stat-card');
            if (!target) return;
            const rect = target.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            target.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        });
    },

    // ===== PULL-TO-REFRESH =====
    initPullToRefresh() {
        let startY = 0, pulling = false;
        const content = document.querySelector('.content');
        if (!content) return;
        content.addEventListener('touchstart', e => {
            if (content.scrollTop === 0 && this.currentPage === 'dashboard') {
                startY = e.touches[0].clientY;
                pulling = true;
            }
        }, { passive: true });
        content.addEventListener('touchmove', e => {
            if (!pulling) return;
            const diff = e.touches[0].clientY - startY;
            const indicator = document.getElementById('pull-refresh-indicator');
            if (diff > 0 && diff < 120 && indicator) {
                indicator.style.height = Math.min(diff * 0.5, 50) + 'px';
                indicator.style.opacity = Math.min(diff / 80, 1);
            }
        }, { passive: true });
        content.addEventListener('touchend', e => {
            if (!pulling) return;
            pulling = false;
            const indicator = document.getElementById('pull-refresh-indicator');
            if (indicator && parseFloat(indicator.style.height) > 40) {
                indicator.innerHTML = `<div style="display:flex;align-items:center;gap:6px;justify-content:center">${LI('refresh-cw',14)} Atualizando...</div>`;
                this.renderDashboard();
            }
            if (indicator) { indicator.style.height = '0'; indicator.style.opacity = '0'; }
        });
    },

    // ===== SKELETON LOADING HELPERS =====
    skeletonKPI(count = 4) {
        return `<div class="kpi-grid">${Array(count).fill(`
            <div class="kpi-card">
                <div class="skeleton skeleton-text" style="width:60%"></div>
                <div class="skeleton skeleton-value"></div>
                <div class="skeleton skeleton-text" style="width:40%"></div>
            </div>`).join('')}</div>`;
    },

    skeletonList(count = 3) {
        return Array(count).fill(`<div class="skeleton-list-item"><div class="skeleton" style="width:36px;height:36px;border-radius:50%"></div><div style="flex:1"><div class="skeleton skeleton-text" style="width:70%"></div><div class="skeleton skeleton-text" style="width:40%;margin-top:6px"></div></div></div>`).join('');
    },

    skeletonDetail() {
        return `<div style="padding:8px 0"><div class="skeleton skeleton-text" style="width:40%;height:20px;margin-bottom:16px"></div><div class="skeleton skeleton-card" style="height:120px;margin-bottom:12px"></div><div class="skeleton skeleton-card" style="height:180px"></div></div>`;
    },

    // ===== THEME TOGGLE =====
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? '' : 'light';
        if (next) document.documentElement.setAttribute('data-theme', next);
        else document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('abmt-theme', next || 'dark');
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'light' ? '#fafafa' : '#0a0a0b');
    },
    initTheme() {
        const saved = localStorage.getItem('abmt-theme') || 'dark';
        if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
        else document.documentElement.removeAttribute('data-theme');
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', saved === 'light' ? '#fafafa' : '#0a0a0b');
    }
};

// ===== INIT RIPPLE + PULL-TO-REFRESH + REMEMBERED USER =====
document.addEventListener('DOMContentLoaded', () => {
    APP.initTheme();
    APP.initRipple();
    APP.init();
});
document.addEventListener('click', e => {
    if (!e.target.closest('.topbar-search')) { const sr = document.getElementById('search-results'); if (sr) sr.style.display = 'none'; }
    if (!e.target.closest('.topbar-actions')) { const dd = document.getElementById('notif-dropdown'); if (dd) { dd.style.display = 'none'; APP._notifDropdownOpen = false; } }
});
