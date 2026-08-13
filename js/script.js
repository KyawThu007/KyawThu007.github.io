
let menuIcon=document.querySelector('#menu-icon');
let navbar=document.querySelector('.navbar');
const homeSection = document.querySelector('.home');
const homeImageHover = document.querySelector('.home-imgHover');

if (menuIcon) {
    menuIcon.onclick = () => {
        menuIcon.classList.toggle('bx-x');
        if (navbar) navbar.classList.toggle('active');
    }
}

if (homeSection && homeImageHover) {
    homeSection.addEventListener('mouseenter', () => {
        homeImageHover.classList.add('visible');
    });

    homeSection.addEventListener('mouseleave', () => {
        if (!homeImageHover.classList.contains('active')) {
            homeImageHover.classList.remove('visible');
        }
    });

    homeImageHover.addEventListener('click', () => {
        homeImageHover.classList.toggle('active');
        homeImageHover.classList.toggle('visible', homeImageHover.classList.contains('active'));
    });
}

let sections=document.querySelectorAll('section');
let navLinks=document.querySelectorAll('header nav a');
let skillsAutoRunning = false;

window.onscroll = () => {
    sections.forEach(sec => {
        let top=window.scrollY;
        let offset=sec.offsetTop-200;
        let height=sec.offsetHeight;
        let id=sec.getAttribute('id');
        if(top>=offset && top<offset+height){
            navLinks.forEach(links => {
                links.classList.remove('active');
            });
            const activeLink = document.querySelector('header nav a[href*="'+id+'"]');
            if (activeLink) activeLink.classList.add('active');

            const wasShown = sec.classList.contains('show-animate');
            sec.classList.add('show-animate');
            if (!wasShown && id === 'skills') {
                // trigger auto hover on skills
                triggerSkillsAutoHover();
            }
        }else{
            sec.classList.remove('show-animate');
            if (id === 'skills') {
                // clear any running auto-hover state
                skillsAutoRunning = false;
                document.querySelectorAll('.skills-content .progress.auto-hover').forEach(el => el.classList.remove('auto-hover'));
            }
        }
    });
    let header=document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY>200);

    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');

    let footer=document.querySelector('footer');
    footer.classList.toggle('show-animate',this.innerHeight + this.scrollY >= document.scrollingElement.scrollHeight);

    const aboutMore = document.getElementById("about-more");
    if (aboutMore) {
        aboutMore.style.display = "none";
    }
}

const form = document.querySelector("#contact-form");
if (form) {
    form.addEventListener("submit", event => {
        event.preventDefault();
        openMailClient();
    });
}

function copyFallback(text) {
    const tempField = document.createElement('textarea');
    tempField.value = text;
    tempField.setAttribute('readonly', '');
    tempField.style.position = 'fixed';
    tempField.style.opacity = '0';
    document.body.appendChild(tempField);
    tempField.focus();
    tempField.select();
    tempField.setSelectionRange(0, tempField.value.length);

    const successful = document.execCommand && document.execCommand('copy');
    document.body.removeChild(tempField);

    if (!successful) {
        throw new Error('Copy command failed');
    }
}

function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).catch(() => copyFallback(text));
    }
    return Promise.resolve(copyFallback(text));
}

const copyButtons = document.querySelectorAll('.contact-copy');

if (copyButtons.length) {
    copyButtons.forEach((button) => {
        const value = button.dataset.copy || '';
        const label = button.querySelector('span');
        const originalText = label ? label.textContent : value;

        button.addEventListener('click', async () => {
            try {
                await copyText(value);

                if (label) {
                    label.textContent = 'Copied!';
                }
                button.classList.add('copied');

                setTimeout(() => {
                    if (label) {
                        label.textContent = originalText;
                    }
                    button.classList.remove('copied');
                }, 1200);
            } catch (error) {
                if (label) {
                    label.textContent = 'Copy failed';
                }
                setTimeout(() => {
                    if (label) {
                        label.textContent = originalText;
                    }
                }, 1200);
            }
        });
    });
}

function openMailClient() {
    const email = 'kyawthu677288@gmail.com'; // recipient's email
    const subject = form ? encodeURIComponent(form.subject.value) : '';
    const body = form ? encodeURIComponent(form.message.value) : '';
    
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
    
    window.location.href = mailtoLink;
}

const projectCarousel = document.querySelector('.project-carousel');
const prevProjectBtn = document.querySelector('.project-prev');
const nextProjectBtn = document.querySelector('.project-next');
const projectDots = document.querySelectorAll('.project-dot');

function getProjectCardWidth() {
    if (!projectCarousel) return 0;
    const card = projectCarousel.querySelector('.project-card');
    if (!card) return 0;
    const grid = projectCarousel.querySelector('.projects-grid');
    const gap = parseFloat(getComputedStyle(grid).gap) || 24;
    return card.getBoundingClientRect().width + gap;
}

function triggerSkillsAutoHover() {
    if (skillsAutoRunning) return;
    const items = Array.from(document.querySelectorAll('.skills-content .progress'));
    if (!items.length) return;
    skillsAutoRunning = true;
    const baseDelay = 150;
    const stay = 1800; // how long each item stays hovered
    items.forEach((el, i) => {
        const delay = i * baseDelay;
        setTimeout(() => {
            el.classList.add('auto-hover');
            // remove after stay time
            setTimeout(() => el.classList.remove('auto-hover'), stay);
        }, delay);
    });
    // reset flag after full sequence
    setTimeout(() => { skillsAutoRunning = false; }, items.length * baseDelay + stay + 200);
}

function updateProjectDots(index) {
    projectDots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === index);
    });
}

function scrollProjectCarousel(direction, shouldSetDot = true) {
    if (!projectCarousel) return;
    const grid = projectCarousel.querySelector('.projects-grid');
    if (!grid) return;

    const cardWidth = getProjectCardWidth();
    const maxScroll = projectCarousel.scrollWidth - projectCarousel.clientWidth;
    const nextPosition = Math.max(0, Math.min(maxScroll, projectCarousel.scrollLeft + direction * cardWidth));
    projectCarousel.scrollTo({ left: nextPosition, behavior: 'smooth' });

    if (shouldSetDot) {
        const activeIndex = Math.round(nextPosition / cardWidth);
        updateProjectDots(Math.min(activeIndex, projectDots.length - 1));
    }
}

if (prevProjectBtn) {
    prevProjectBtn.addEventListener('click', event => {
        event.preventDefault();
        scrollProjectCarousel(-1, true);
    });
}
if (nextProjectBtn) {
    nextProjectBtn.addEventListener('click', event => {
        event.preventDefault();
        scrollProjectCarousel(1, true);
    });
}

projectDots.forEach((dot) => {
    dot.addEventListener('click', () => {
        const index = Number(dot.dataset.slide || 0);
        const targetLeft = index * getProjectCardWidth();
        projectCarousel.scrollTo({ left: targetLeft, behavior: 'smooth' });
        updateProjectDots(index);
    });
});

let projectAutoScroll = null;

function startProjectAutoScroll() {
    if (!projectCarousel || projectDots.length === 0) return;
    projectAutoScroll = setInterval(() => {
        const maxScroll = projectCarousel.scrollWidth - projectCarousel.clientWidth;
        if (projectCarousel.scrollLeft >= maxScroll - 2) {
            projectCarousel.scrollTo({ left: 0, behavior: 'smooth' });
            updateProjectDots(0);
            return;
        }
        scrollProjectCarousel(1, false);
        const activeIndex = Math.min(Math.round(projectCarousel.scrollLeft / getProjectCardWidth()), projectDots.length - 1);
        updateProjectDots(activeIndex);
    }, 2500);
}

if (projectCarousel) {
    projectCarousel.addEventListener('mouseenter', () => clearInterval(projectAutoScroll));
    projectCarousel.addEventListener('mouseleave', startProjectAutoScroll);
    startProjectAutoScroll();
}

/* Paper unroll interaction */
document.addEventListener('DOMContentLoaded', () => {
    console.log('paper unroll: init');
    const paper = document.getElementById('paper');
    const paperInner = document.querySelector('.paper-inner');
    const paperWrap = document.getElementById('paperWrap');
    const roller = document.querySelector('.paper-roller');
    if (!paper || !paperWrap) {
        console.log('paper unroll: missing elements', { paperExists: !!paper, paperWrapExists: !!paperWrap });
        return;
    }

    let unrolling = false;

    const easeOutQuint = t => 1 - Math.pow(1 - t, 5);

    function animateUnroll(to = 1, duration = 2200) {
        console.log('paper unroll: animate start', { to, duration });
        if (unrolling) return;
        unrolling = true;
        const start = performance.now();
        const from = parseFloat(getComputedStyle(paper).getPropertyValue('--unroll')) || 0;

        function frame(now) {
            const t = Math.min(1, (now - start) / duration);
            const v = from + (to - from) * easeOutQuint(t);
            paper.style.setProperty('--unroll', v);
            paper.style.transform = `translateZ(0) rotateY(${(1 - v) * 8}deg)`;
            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                paper.style.setProperty('--unroll', to);
                paper.style.transform = '';
                unrolling = false;
                console.log('paper unroll: animate complete', { to });
                if (to === 1) {
                    paper.classList.add('unrolled');
                    if (paperInner) paperInner.classList.add('visible');
                    if (roller) roller.style.opacity = '0';
                    const prompt = document.querySelector('.paper-prompt');
                    if (prompt) prompt.style.opacity = '0';
                }
            }
        }
        requestAnimationFrame(frame);
    }

    // trigger on click or significant scroll
    paperWrap.addEventListener('click', () => animateUnroll(1, 2200));
    let wheelDebounce = 0;
    window.addEventListener('wheel', (e) => {
        if (e.deltaY > 8 && Date.now() - wheelDebounce > 300) {
            wheelDebounce = Date.now();
            animateUnroll(1, 1800);
        }
    }, { passive: true });
    // allow keyboard activation
    paperWrap.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            animateUnroll(1, 2000);
        }
    });

    // ensure starting state
    paper.style.setProperty('--unroll', 0);
    // Initialize scroll-based animations which may add/remove overlays
    if (typeof window.onscroll === 'function') {
        try { window.onscroll(); } catch (e) { console.warn('initial scroll handler failed', e); }
    }
});
