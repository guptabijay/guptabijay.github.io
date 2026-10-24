document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Theme switch (sun/moon toggle) — remembers choice, falls back to system setting
    const root = document.documentElement;
    const themeBtns = [document.getElementById('theme-toggle'), document.getElementById('theme-toggle-menu')].filter(Boolean);
    const setTheme = (dark) => {
        if (dark) root.setAttribute('data-theme', 'dark');
        else root.removeAttribute('data-theme');
        themeBtns.forEach(btn => {
            if (btn.getAttribute('role') === 'switch') btn.setAttribute('aria-checked', String(dark));
            const i = btn.classList.contains('theme-mini') ? btn.querySelector('i') : null;
            if (i) i.className = dark ? 'fas fa-sun' : 'fas fa-moon';
        });
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', dark ? '#0e141b' : '#f5f7fa');
    };
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch (e) {}
    setTheme(saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
    themeBtns.forEach(btn => btn.addEventListener('click', () => {
        const dark = root.getAttribute('data-theme') !== 'dark';
        setTheme(dark);
        try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
    }));

    // ── Mobile menu: floating panel on the right
    const header = document.querySelector('.site-header');
    const menuBtn = document.getElementById('menu-btn');
    if (header && menuBtn) {
        const scrim = document.createElement('div');
        scrim.className = 'nav-scrim';
        document.body.appendChild(scrim);
        const panel = document.getElementById('nav-links');
        const setMenu = (open) => {
            header.classList.toggle('open', open);
            scrim.classList.toggle('show', open);
            document.body.classList.toggle('menu-open', open);
            menuBtn.setAttribute('aria-expanded', String(open));
            menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            if (open && panel) {
                const first = panel.querySelector('a');
                if (first) setTimeout(() => first.focus({ preventScroll: true }), 150);
            }
        };
        menuBtn.addEventListener('click', () => setMenu(!header.classList.contains('open')));
        scrim.addEventListener('click', () => setMenu(false));
        if (panel) panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && header.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
        });
        window.addEventListener('resize', () => { if (window.innerWidth > 720) setMenu(false); });
    }

    // ── macOS terminal: live "Last login" line (traffic lights are decorative)
    const term = document.getElementById('terminal');
    if (term) {
        const ll = document.getElementById('last-login');
        if (ll) {
            const d = new Date();
            const day = d.toLocaleDateString('en-AU', { weekday: 'short' });
            const mon = d.toLocaleDateString('en-AU', { month: 'short' });
            const time = d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false });
            ll.textContent = `Last login: ${day} ${mon} ${d.getDate()} ${time} on ttys001`;
        }

    }

    // ── Pill highlight that slides between nav links
    const navList = document.querySelector('.nav-links ul');
    if (navList) {
        const pill = document.createElement('span');
        pill.className = 'nav-pill no-anim';
        pill.setAttribute('aria-hidden', 'true');
        navList.prepend(pill);
        const links = [...navList.querySelectorAll('a')];
        const activeLink = navList.querySelector('a.active') || links[0];
        const moveTo = (a) => {
            if (!a || !a.offsetWidth) return;
            const li = a.parentElement;
            pill.style.width = `${a.offsetWidth}px`;
            pill.style.transform = `translateX(${li.offsetLeft + a.offsetLeft}px)`;
            pill.classList.add('ready');
        };
        const reset = (instant) => {
            if (instant) pill.classList.add('no-anim');
            moveTo(activeLink);
            if (instant) requestAnimationFrame(() => requestAnimationFrame(() => pill.classList.remove('no-anim')));
        };
        links.forEach(a => {
            a.addEventListener('mouseenter', () => moveTo(a));
            a.addEventListener('focus', () => moveTo(a));
        });
        navList.addEventListener('mouseleave', () => reset(false));
        navList.addEventListener('focusout', e => { if (!navList.contains(e.relatedTarget)) reset(false); });
        if ('ResizeObserver' in window) new ResizeObserver(() => reset(true)).observe(navList);
        window.addEventListener('load', () => reset(true));
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => reset(true));
        reset(true);
    }

    // ── Grid lines glow around the pointer
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
        const glow = document.createElement('div');
        glow.className = 'grid-glow';
        const bloom = document.createElement('div');
        bloom.className = 'grid-bloom';
        document.body.prepend(bloom, glow);
        let gx = 0, gy = 0, queued = false;
        window.addEventListener('pointermove', e => {
            gx = e.clientX; gy = e.clientY;
            glow.classList.add('on'); bloom.classList.add('on');
            if (queued) return;
            queued = true;
            requestAnimationFrame(() => {
                document.documentElement.style.setProperty('--gx', `${gx}px`);
                document.documentElement.style.setProperty('--gy', `${gy}px`);
                queued = false;
            });
        }, { passive: true });
        document.documentElement.addEventListener('pointerleave', () => { glow.classList.remove('on'); bloom.classList.remove('on'); });
    }

    // ── Hero terminal: print lines one by one, then cycle the last line
    const lines = document.querySelectorAll('.term-line');
    const typedEl = document.getElementById('typed-text');
    const roles = ['networking student', 'cybersecurity learner', 'python tinkerer', 'photographer at 1BG Photography'];

    const typeRoles = () => {
        if (!typedEl) return;
        if (reduceMotion) { typedEl.textContent = roles[0]; return; }
        let r = 0, c = 0, deleting = false;
        const tick = () => {
            const word = roles[r];
            typedEl.textContent = word.slice(0, deleting ? --c : ++c);
            if (!deleting && c === word.length) { deleting = true; return setTimeout(tick, 2200); }
            if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; }
            setTimeout(tick, deleting ? 35 : 70);
        };
        tick();
    };

    if (lines.length) {
        if (reduceMotion) {
            lines.forEach(l => l.classList.add('shown'));
            typeRoles();
        } else {
            lines.forEach((l, i) => setTimeout(() => {
                l.classList.add('shown');
                if (i === lines.length - 1) typeRoles();
            }, 250 + i * 180));
        }
    } else {
        typeRoles();
    }

    // ── Skill bars fill when they scroll into view
    const bars = document.querySelectorAll('.skill-bar');
    if (bars.length && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { entry.target.classList.add('animated'); io.unobserve(entry.target); }
            });
        }, { threshold: 0.4 });
        bars.forEach(b => io.observe(b));
    } else {
        bars.forEach(b => b.classList.add('animated'));
    }

    // ── Header: solid once you scroll; on phones the bar folds into the menu button
    if (header) {
        const mobile = window.matchMedia('(max-width: 720px)');
        const onScroll = () => {
            const y = window.scrollY;
            header.classList.toggle('scrolled', y > 8);
            const compact = mobile.matches && y > 80;
            if (!compact && header.classList.contains('compact') && header.classList.contains('open')) {
                menuBtn && menuBtn.click();
            }
            header.classList.toggle('compact', compact);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        onScroll();
    }

    // ── Tap the profile photo: it grows (not full screen) with a little spin, page blurs
    const profileBtn = document.getElementById('profile-open');
    if (profileBtn) {
        const src = profileBtn.querySelector('img');
        const overlay = document.createElement('div');
        overlay.className = 'photo-zoom';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-label', 'Profile photo');
        overlay.innerHTML = '<img alt="Portrait of Bijay Gupta">';
        document.body.appendChild(overlay);
        const big = overlay.querySelector('img');
        big.src = src.src;
        let isOpen = false;

        const targetRect = () => {
            const w = Math.min(window.innerWidth * 0.78, 380);
            const h = w * 1.25;
            return { w, h, x: (window.innerWidth - w) / 2, y: Math.max(16, (window.innerHeight - h) / 2) };
        };
        const openZoom = () => {
            if (isOpen) return;
            isOpen = true;
            const r = src.getBoundingClientRect();
            const t = targetRect();
            Object.assign(big.style, { left: t.x + 'px', top: t.y + 'px', width: t.w + 'px', height: t.h + 'px' });
            overlay.classList.add('show');
            document.body.classList.add('menu-open');
            profileBtn.classList.add('lifted');
            if (reduceMotion) return;
            const dx = r.left - t.x, dy = r.top - t.y, s = r.width / t.w;
            big.animate([
                { transform: `translate(${dx}px, ${dy}px) scale(${s}) rotate(0deg)`, borderRadius: '12px' },
                { transform: 'translate(0,0) scale(1.04) rotate(-8deg)', offset: 0.6 },
                { transform: 'translate(0,0) scale(1) rotate(0deg)', borderRadius: '20px' }
            ], { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)' });
        };
        const closeZoom = () => {
            if (!isOpen) return;
            isOpen = false;
            const finish = () => {
                overlay.classList.remove('show');
                document.body.classList.remove('menu-open');
                profileBtn.classList.remove('lifted');
            };
            if (reduceMotion) return finish();
            const r = src.getBoundingClientRect();
            const t = targetRect();
            const dx = r.left - t.x, dy = r.top - t.y, s = r.width / t.w;
            overlay.classList.add('closing');
            big.animate([
                { transform: 'translate(0,0) scale(1) rotate(0deg)', borderRadius: '20px' },
                { transform: `translate(${dx}px, ${dy}px) scale(${s}) rotate(6deg)`, borderRadius: '12px' }
            ], { duration: 420, easing: 'cubic-bezier(.4,0,.2,1)' }).onfinish = () => { overlay.classList.remove('closing'); finish(); };
        };
        profileBtn.addEventListener('click', openZoom);
        overlay.addEventListener('click', closeZoom);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeZoom(); });
    }

    // ── Scroll reveal with staggered children
    const groups = document.querySelectorAll(
        '.cards-row, .about-right, .stack-grid, .learning-items, .cert-cards-row, ' +
        '.skills-grid, .hobby-cards, .contact-cards-grid, .photo-slider, .brand-socials, ' +
        '.photo-social-row, .timeline-tags, .brand-shoots'
    );
    groups.forEach(g => {
        [...g.children].forEach((c, i) => {
            c.classList.add('stagger-item');
            c.style.setProperty('--delay', `${Math.min(i, 10) * 0.07}s`);
        });
    });
    const targets = [...document.querySelectorAll('.reveal'), ...groups];
    if ('IntersectionObserver' in window && !reduceMotion) {
        const ro = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                ro.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        targets.forEach(t => ro.observe(t));
    } else {
        targets.forEach(t => t.classList.add('is-in'));
    }

    // ── Gallery slider: arrows, dots, drag, keyboard, gentle autoplay
    const cards = [...document.querySelectorAll('.photo-slider .photo-card')];
    const track = document.getElementById('photo-slider');
    const prevBtn = document.getElementById('slide-prev');
    const nextBtn = document.getElementById('slide-next');
    const dotsWrap = document.getElementById('slider-dots');
    let dragMoved = false;
    if (track) {
        const slides = () => [...track.querySelectorAll('.photo-card')];
        const atStart = () => track.scrollLeft <= 4;
        const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
        const go = (dir) => {
            if (dir > 0 && atEnd()) return track.scrollTo({ left: 0, behavior: 'smooth' });
            if (dir < 0 && atStart()) return track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
            track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: 'smooth' });
        };
        const goTo = (i) => {
            const s = slides()[i];
            if (s) track.scrollTo({ left: s.offsetLeft - track.offsetLeft, behavior: 'smooth' });
        };

        // dots
        // photo details shown under the slider (never on the photo)
        const titleEl = document.getElementById('slide-title');
        const descEl = document.getElementById('slide-desc');
        const countEl2 = document.getElementById('slide-count');
        const infoText = document.querySelector('.slide-text');
        let shown = -1;
        const showInfo = (slide, i, n) => {
            if (!slide || i === shown) return;
            shown = i;
            if (countEl2) countEl2.textContent = `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
            if (infoText) { infoText.classList.remove('swap'); void infoText.offsetWidth; infoText.classList.add('swap'); }
            if (titleEl) titleEl.textContent = slide.dataset.title || '';
            if (descEl) descEl.textContent = slide.dataset.desc || '';
        };
        // clicking a peeking photo brings it into focus first
        track.addEventListener('click', e => {
            const card = e.target.closest('.photo-card');
            if (!card || card.classList.contains('is-active') || dragMoved || atEnd()) return;
            e.stopImmediatePropagation();
            goTo(slides().indexOf(card)); pause();
        }, true);

        const buildDots = () => {
            if (!dotsWrap) return;
            dotsWrap.innerHTML = '';
            slides().forEach((_, i) => {
                const d = document.createElement('button');
                d.type = 'button';
                d.className = 'slider-dot';
                d.tabIndex = -1;
                d.addEventListener('click', () => { goTo(i); pause(); });
                dotsWrap.appendChild(d);
            });
        };
        const update = () => {
            const list = slides();
            const left = track.scrollLeft;
            let active = 0, best = Infinity;
            list.forEach((s, i) => {
                const d = Math.abs((s.offsetLeft - track.offsetLeft) - left);
                if (d < best) { best = d; active = i; }
            });
            if (atEnd()) active = list.length - 1;
            if (dotsWrap) [...dotsWrap.children].forEach((d, i) => d.classList.toggle('active', i === active));
            list.forEach((s, i) => s.classList.toggle('is-active', i === active));
            showInfo(list[active], active, list.length);
            track.classList.toggle('at-start', atStart());
            track.classList.toggle('at-end', atEnd());
        };
        buildDots();
        update();
        track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
        window.addEventListener('resize', update);
        window.addEventListener('load', () => { buildDots(); update(); });

        if (prevBtn) prevBtn.addEventListener('click', () => { go(-1); pause(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { go(1); pause(); });
        track.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight') { e.preventDefault(); go(1); pause(); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); pause(); }
        });

        // mouse drag (touch already scrolls natively)
        let down = false, startX = 0, startScroll = 0;
        track.addEventListener('pointerdown', e => {
            if (e.pointerType !== 'mouse' || e.button !== 0) return;
            down = true; dragMoved = false;
            startX = e.clientX; startScroll = track.scrollLeft;
        });
        window.addEventListener('pointermove', e => {
            if (!down) return;
            const dx = e.clientX - startX;
            if (!dragMoved && Math.abs(dx) > 5) { dragMoved = true; track.classList.add('dragging'); }
            if (dragMoved) track.scrollLeft = startScroll - dx;
        });
        window.addEventListener('pointerup', () => {
            if (!down) return;
            down = false;
            track.classList.remove('dragging');
            if (dragMoved) pause();
            setTimeout(() => { dragMoved = false; }, 0);
        });

        // autoplay — stops when you interact, hover, or the tab is hidden
        let timer = null, paused = reduceMotion;
        const tick = () => { if (!paused && !document.hidden) go(1); };
        const start = () => { if (!reduceMotion && !timer) timer = setInterval(tick, 4500); };
        function pause() { paused = true; clearInterval(timer); timer = null; setTimeout(() => { paused = false; start(); }, 9000); }
        track.addEventListener('mouseenter', () => { paused = true; });
        track.addEventListener('mouseleave', () => { paused = false; });
        track.addEventListener('touchstart', () => pause(), { passive: true });
        start();
    }

    // ── Lightbox: caption, counter, arrows, swipe, keyboard
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');
    const capEl = document.getElementById('lightbox-caption');
    const countEl = document.getElementById('lightbox-count');
    if (lightbox && lightboxImg && cards.length) {
        let idx = 0, lastFocus = null;
        const visible = () => cards.filter(c => c.isConnected && !c.classList.contains('is-hidden'));
        const render = () => {
            const list = visible();
            const card = list[idx];
            const img = card.querySelector('img');
            lightboxImg.classList.add('switching');
            setTimeout(() => {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                if (capEl) capEl.textContent = card.dataset.title || '';
                if (countEl) countEl.textContent = `${idx + 1} / ${list.length}`;
                lightboxImg.onload = () => lightboxImg.classList.remove('switching');
                if (lightboxImg.complete) lightboxImg.classList.remove('switching');
            }, lightbox.classList.contains('active') ? 150 : 0);
        };
        const open = (card) => {
            idx = Math.max(0, visible().indexOf(card));
            lastFocus = document.activeElement;
            render();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (closeBtn) closeBtn.focus();
        };
        const step = (d) => { const n = visible().length; idx = (idx + d + n) % n; render(); };
        const close = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            if (lastFocus) lastFocus.focus();
        };

        cards.forEach(card => {
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `Open photo: ${card.querySelector('img').alt}`);
            card.addEventListener('click', () => { if (!dragMoved) open(card); });
            card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card); } });
        });

        const prev = document.createElement('button');
        const next = document.createElement('button');
        prev.type = next.type = 'button';
        prev.className = 'lightbox-nav lightbox-prev';
        next.className = 'lightbox-nav lightbox-next';
        prev.setAttribute('aria-label', 'Previous photo');
        next.setAttribute('aria-label', 'Next photo');
        prev.innerHTML = '<i class="fas fa-chevron-left"></i>';
        next.innerHTML = '<i class="fas fa-chevron-right"></i>';
        lightbox.append(prev, next);
        prev.addEventListener('click', e => { e.stopPropagation(); step(-1); });
        next.addEventListener('click', e => { e.stopPropagation(); step(1); });

        lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
        if (closeBtn) closeBtn.addEventListener('click', close);
        document.addEventListener('keydown', e => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowLeft') step(-1);
            if (e.key === 'ArrowRight') step(1);
        });

        let startX = null;
        lightbox.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
        lightbox.addEventListener('touchend', e => {
            if (startX === null) return;
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            startX = null;
        });
    }
});
