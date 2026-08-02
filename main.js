/* Purple Apps - Scroll Reveal & Mobile Nav (Gilded Ember) */

document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ----------------------------------------------------------------
       Auto scroll-reveal: tag key elements, stagger siblings, observe.
       No per-page HTML changes required.
       ---------------------------------------------------------------- */
    if (!reduceMotion) {
        const REVEAL_SELECTORS = [
            '.studio-hero > div',
            '.hero-showcase',
            '.product-hero > div',
            '.product-media',
            '.section-heading',
            '.app-card',
            '.section-block',
            '.callout',
            '.feature-list',
            '.pricing-card',
            '.site-footer'
        ];

        const targets = document.querySelectorAll(REVEAL_SELECTORS.join(','));
        targets.forEach(el => el.classList.add('reveal'));

        // Stagger items that share a parent so grids cascade in.
        const groups = new Map();
        targets.forEach(el => {
            const parent = el.parentElement;
            const arr = groups.get(parent) || [];
            arr.push(el);
            groups.set(parent, arr);
        });
        groups.forEach(arr => {
            arr.forEach((el, i) => {
                el.style.setProperty('--reveal-delay', Math.min(i, 6) * 80 + 'ms');
            });
        });

        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        targets.forEach(el => io.observe(el));

        // Safety net: reveal anything still hidden that is already in view
        // (e.g. a short footer pinned to the bottom that never crosses the
        // observer threshold). Runs once shortly after load.
        window.addEventListener('load', () => {
            setTimeout(() => {
                targets.forEach(el => {
                    if (el.classList.contains('visible')) return;
                    const r = el.getBoundingClientRect();
                    if (r.top < window.innerHeight && r.bottom > 0) {
                        el.classList.add('visible');
                        io.unobserve(el);
                    }
                });
            }, 400);
        });
    }

    /* ----------------------------------------------------------------
       Floating island nav - subtle lift once the page is scrolled.
       ---------------------------------------------------------------- */
    const navInner = document.querySelector('.navbar-inner');
    if (navInner) {
        const onScroll = () => {
            if (window.scrollY > 8) {
                navInner.style.background = 'rgba(31, 21, 11, 0.88)';
            } else {
                navInner.style.background = '';
            }
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ----------------------------------------------------------------
       Mobile nav toggle (hamburger <-> X)
       ---------------------------------------------------------------- */
    const toggle = document.querySelector('.nav-toggle');
    const links  = document.querySelector('.navbar-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            links.classList.toggle('open');
            toggle.textContent = links.classList.contains('open') ? '\u2715' : '\u2630';
        });
        links.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                links.classList.remove('open');
                toggle.textContent = '\u2630';
            });
        });
    }
});
