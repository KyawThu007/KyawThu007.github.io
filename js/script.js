
let menuIcon=document.querySelector('#menu-icon');
let navbar=document.querySelector('.navbar');
const homeSection = document.querySelector('.home');
const homeImageHover = document.querySelector('.home-imgHover');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
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

window.onscroll = () => {
    sections.forEach(sec => {
        let top=window.scrollY;
        let offset=sec.offsetTop-200;
        let height=sec.offsetHeight;
        let id=sec.getAttribute('id');
        if(top>=offset && top<offset+height){
            navLinks.forEach(links => {
                links.classList.remove('active');
                document.querySelector('header nav a[href*='+id+']').classList.add('active');
            });

            sec.classList.add('show-animate');
        }else{
            sec.classList.remove('show-animate');
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
