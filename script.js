document.addEventListener('DOMContentLoaded', () => {

    // ──────────────────────────────────────────
    // 1. DARK / LIGHT THEME TOGGLE
    // ──────────────────────────────────────────
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = themeToggleBtn.querySelector('i');

    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        body.setAttribute('data-theme', 'dark');
        icon.classList.replace('fa-moon', 'fa-sun');
    }

    themeToggleBtn.addEventListener('click', () => {
        const isDark = body.getAttribute('data-theme') === 'dark';
        if (isDark) {
            body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            icon.classList.replace('fa-sun', 'fa-moon');
        } else {
            body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            icon.classList.replace('fa-moon', 'fa-sun');
        }
    });

    // ──────────────────────────────────────────
    // 2. SCROLL NAV — hide on scroll, show menu btn
    // ──────────────────────────────────────────
    const navContainer = document.getElementById('nav-container');
    const menuBtn = document.getElementById('menu-btn');
    const navBackdrop = document.getElementById('nav-backdrop');
    let menuOpen = false;

    // Ensure mobile menu button is visible on small viewports without scrolling
    function updateMenuBtnVisibilityOnViewport() {
        if (window.innerWidth <= 768) {
            if (!menuOpen) {
                menuBtn.classList.add('visible');
                navContainer.classList.add('hidden');
            }
        } else {
            // On larger screens follow scroll behavior
            if (window.scrollY <= 60) {
                menuBtn.classList.remove('visible');
                navContainer.classList.remove('hidden');
            }
        }
    }
    // Run on load
    updateMenuBtnVisibilityOnViewport();
    // Also adjust when the window is resized
    window.addEventListener('resize', updateMenuBtnVisibilityOnViewport);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            if (!menuOpen) {
                navContainer.classList.add('hidden');
                menuBtn.classList.add('visible');
                navBackdrop.classList.remove('active');
            }
        } else {
            if (window.innerWidth > 768) {
                navContainer.classList.remove('hidden');
                menuBtn.classList.remove('visible');
                menuOpen = false;
                menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
            if (!menuOpen) {
                navBackdrop.classList.remove('active');
            }
        }
    });

    menuBtn.addEventListener('click', () => {
        menuOpen = !menuOpen;
        if (menuOpen) {
            navContainer.classList.remove('hidden');
            navBackdrop.classList.add('active');
            menuBtn.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            navContainer.classList.add('hidden');
            navBackdrop.classList.remove('active');
            menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });

    // ──────────────────────────────────────────
    // 3. SCROLL REVEAL
    // ──────────────────────────────────────────
    const revealEls = document.querySelectorAll('.reveal, .reveal-delay-1, .reveal-delay-2, .reveal-delay-3');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    revealEls.forEach(el => revealObserver.observe(el));

    // ──────────────────────────────────────────
    // 4. TYPING ANIMATION (profile page only)
    // ──────────────────────────────────────────
    const typedEl = document.getElementById('typed-text');
    if (typedEl) {
        const phrases = [
            'IT Student @ MIT',
            'Cybersecurity Enthusiast',
            'Python Programmer',
            'Network Explorer',
            'Photography Creator',
            'Lifelong Learner',
        ];
        let phraseIdx = 0, charIdx = 0, deleting = false;

        function type() {
            const phrase = phrases[phraseIdx];
            if (!deleting) {
                typedEl.textContent = phrase.slice(0, ++charIdx);
                if (charIdx === phrase.length) {
                    deleting = true;
                    setTimeout(type, 2000);
                    return;
                }
            } else {
                typedEl.textContent = phrase.slice(0, --charIdx);
                if (charIdx === 0) {
                    deleting = false;
                    phraseIdx = (phraseIdx + 1) % phrases.length;
                }
            }
            setTimeout(type, deleting ? 50 : 90);
        }
        type();
    }

    // ──────────────────────────────────────────
    // 5. ANIMATED STAT COUNTERS (profile page only)
    // ──────────────────────────────────────────
    const statNums = document.querySelectorAll('.stat-number');
    if (statNums.length) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute('data-target'));
                    let count = 0;
                    const step = Math.max(1, Math.floor(target / 40));
                    const interval = setInterval(() => {
                        count += step;
                        if (count >= target) { count = target; clearInterval(interval); }
                        el.textContent = count;
                    }, 40);
                    counterObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        statNums.forEach(el => counterObserver.observe(el));
    }

    // ──────────────────────────────────────────
    // 6. SKILL BAR ANIMATION (education page only)
    // ──────────────────────────────────────────
    const skillBars = document.querySelectorAll('.skill-bar');
    if (skillBars.length) {
        const barObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    barObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });
        skillBars.forEach(bar => barObserver.observe(bar));
    }

    // ──────────────────────────────────────────
    // 7. LIGHTBOX (hobbies page only)
    // ──────────────────────────────────────────
    const sliderImages = document.querySelectorAll('.photo-slider img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');

    if (lightbox && lightboxImg) {
        sliderImages.forEach(img => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightbox.classList.add('active');
            });
        });

        // Close on backdrop click
        lightbox.addEventListener('click', (e) => {
            if (e.target !== lightboxImg) {
                lightbox.classList.remove('active');
            }
        });

        // Close button
        if (closeBtn) {
            closeBtn.addEventListener('click', () => lightbox.classList.remove('active'));
        }
    }

});
