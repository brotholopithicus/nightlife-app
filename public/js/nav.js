const navLinks = document.querySelectorAll('.nav-list a');
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
const navList = document.querySelector('.nav-list');
let topOfNavList = navList.offsetTop;

navToggle.addEventListener('click', toggleActive);

function toggleActive(e) {
    navList.classList.toggle('active');
    if (navList.classList.contains('active')) {
        navList.style.display = '';
    } else {
        navList.style.display = 'none';
    }
}

navLinks.forEach(link => {
    if (link.classList.contains('active')) link.classList.remove('active');
    let pathname = link.href.substr(link.href.lastIndexOf('/'), link.href.length);
    let relPath = '/' + window.location.pathname.split('/')[1];
    if (relPath === pathname) {
        link.classList.add('active');
    }
});

function onScroll() {
    if (window.scrollY > topOfNavList) {
        document.body.style.paddingTop = navList.offsetHeight + 'px';
        document.body.classList.add('fixed-nav');
        mainNav.style.display = 'none';
    } else {
        document.body.classList.remove('fixed-nav');
        mainNav.style.display = '';
        document.body.style.paddingTop = 0;
    }
}

function checkDimensions() {
    if (window.innerWidth >= 769) {
        navList.style.display = '';
    } else {
        navList.style.display = 'none';
    }
}
window.addEventListener('scroll', onScroll);
window.addEventListener('resize', checkDimensions);

checkDimensions();
