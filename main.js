/* Purple Apps — Enhanced interactivity */
document.addEventListener('DOMContentLoaded', () => {
    // Scroll reveal
    const reveals = document.querySelectorAll('.app-card, .story-content');
    if (reveals.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.style.opacity = '1';
                    e.target.style.transform = 'translateY(0)';
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.15 });
        reveals.forEach(el => {
            el.style.transition = 'all 0.6s cubic-bezier(0.23,1,0.32,1)';
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            io.observe(el);
        });
    }

    // Mobile nav
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.navbar-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            links.classList.toggle('open');
            toggle.textContent = links.classList.contains('open') ? '✕' : '☰';
        });
        links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
            links.classList.remove('open');
            toggle.textContent = '☰';
        }));
    }
});
