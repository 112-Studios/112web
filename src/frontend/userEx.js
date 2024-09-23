console.log("JavaScript UX is running");

document.addEventListener('DOMContentLoaded', () => {
    // Scroll-based Animations for Sections
    initScrollAnimations();

    // Back-to-Top Button
    const backToTopButton = createBackToTopButton();

    // Topbar Show/Hide Logic
    manageTopbarVisibility();

    // Section Highlighting in the Navbar
    initNavbarHighlighting();

    // Lazy Loading Images
    initLazyLoadingImages();
});

function initScrollAnimations() {
    const sections = document.querySelectorAll('section');
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2 });

    sections.forEach(section => sectionObserver.observe(section));
}

function createBackToTopButton() {
    const backToTopButton = document.createElement('button');
    backToTopButton.id = 'back-to-top';
    backToTopButton.innerText = '↑';
    document.body.appendChild(backToTopButton);
    backToTopButton.style.display = 'none';

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showTopbar();
        console.log("Click To The Top (Log, Non-Data-Collect)");
    });

    window.addEventListener('scroll', () => {
        backToTopButton.style.display = window.scrollY > 500 ? 'block' : 'none';
    });

    return backToTopButton;
}

function manageTopbarVisibility() {
    let lastScrollTop = 0;
    const header = document.querySelector('.topbar');

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            hideTopbar(header);
        } else if (scrollTop < lastScrollTop) {
            showTopbar(header);
        }
        lastScrollTop = scrollTop;
        if (scrollTop === 0) showTopbar(header);
    });
}

function hideTopbar(header) {
    header.classList.add('hide-header');
}

function showTopbar(header) {
    header.classList.remove('hide-header');
}

function initNavbarHighlighting() {
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('section');
    const sectionPositions = [...sections].map(section => ({
        id: section.id,
        offset: section.offsetTop
    }));

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        sectionPositions.forEach(({ id, offset }, index) => {
            if (currentScroll >= offset - 100 && (index === sectionPositions.length - 1 || currentScroll < sectionPositions[index + 1].offset - 100)) {
                navLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`nav a[href="#${id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    });
}

function initLazyLoadingImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imgObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                imgObserver.unobserve(img);
            }
        });
    }, { rootMargin: '0px 0px 50px 0px', threshold: 0.01 });

    lazyImages.forEach(img => imgObserver.observe(img));
}
