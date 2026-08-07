
let menuIcon=document.querySelector('#menu-icon');
let navbar=document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
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
    document.getElementById("about-more").style.display = "none";
}

const form = document.querySelector("#contact-form");
if (form) {
    form.addEventListener("submit", event => {
        event.preventDefault();
        openMailClient();
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

function scrollProjectCarousel(direction) {
    if (!projectCarousel) return;
    const card = projectCarousel.querySelector('.project-card');
    if (!card) return;

    const grid = projectCarousel.querySelector('.projects-grid');
    const gap = parseFloat(getComputedStyle(grid).gap) || 24;
    const scrollAmount = card.clientWidth + gap;
    const maxScroll = projectCarousel.scrollWidth - projectCarousel.clientWidth;
    const nextPosition = Math.max(0, Math.min(maxScroll, projectCarousel.scrollLeft + direction * scrollAmount));

    projectCarousel.scrollTo({ left: nextPosition, behavior: 'smooth' });
}

if (prevProjectBtn) {
    prevProjectBtn.addEventListener('click', event => {
        event.preventDefault();
        scrollProjectCarousel(-1);
    });
}
if (nextProjectBtn) {
    nextProjectBtn.addEventListener('click', event => {
        event.preventDefault();
        scrollProjectCarousel(1);
    });
}
