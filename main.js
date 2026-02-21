/* Purple Apps — Scroll Reveal & Mobile Nav */

document.addEventListener('DOMContentLoaded', () => {
    // Scroll-reveal
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.12 });
        reveals.forEach(el => io.observe(el));
    }

    // Mobile nav toggle
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
