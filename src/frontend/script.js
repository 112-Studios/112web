document.addEventListener('DOMContentLoaded', () => {
    // Scroll-based Animations for Sections
    const sections = document.querySelectorAll('section');
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2 });

    sections.forEach(section => sectionObserver.observe(section));

    // Back-to-Top Button
    const backToTopButton = document.createElement('button');
    backToTopButton.id = 'back-to-top';
    backToTopButton.innerText = '↑';
    document.body.appendChild(backToTopButton);
    backToTopButton.style.display = 'none';

    window.addEventListener('scroll', () => {
        backToTopButton.style.display = window.scrollY > 500 ? 'block' : 'none';
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showTopbar();
    });

    let lastScrollTop = 0;
    const header = document.querySelector('.topbar');

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            hideTopbar();
        } else if (scrollTop < lastScrollTop) {
            showTopbar();
        }
        lastScrollTop = scrollTop;
        if (scrollTop === 0) showTopbar();
    });

    function hideTopbar() {
        header.classList.add('hide-header');
    }

    function showTopbar() {
        header.classList.remove('hide-header');
    }

    // Section Highlighting in the Navbar
    const navLinks = document.querySelectorAll('nav a');
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

    // Lazy Loading Images
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

    // **Careers Page Specific**
    const positions = [
        { title: "UI & UX Designer(1x)", description: "As a UI & UX Designer at 112-Studios, you will be responsible for crafting intuitive and visually appealing user interfaces while ensuring an optimal user experience. You will design and implement user interfaces that are both functional and aesthetically pleasing, and collaborate closely with other team members to ensure a seamless and engaging player experience. Your role will also involve conducting user research and usability testing to refine designs and enhance the overall user journey." },
        { title: "Quality Assurance Tester(1x)", description: "As a Quality Assurance Tester at 112-Studios, you will play a critical role in ensuring the quality and stability of our games. You will be responsible for conducting thorough testing of game features and functionalities to identify bugs, inconsistencies, and issues. Your work will involve documenting findings, collaborating with the development team to resolve issues, and ensuring that the final product meets our high standards of quality before release." },
        { title: "Texturer(1x)", description: "As a Texturer at 112-Studios, you will be responsible for creating and applying textures to 3D models and environments to enhance their visual realism and detail. You will work closely with modelers and artists to develop high-quality textures that bring our game assets to life. Your role will involve collaborating with the team to ensure that textures align with the artistic vision of our projects and contribute to an immersive gaming experience." }
    ];

    const careersContainer = document.getElementById("careers-positions");

    positions.forEach((position) => {
        const positionDiv = document.createElement("div");
        positionDiv.classList.add("position");
        positionDiv.innerHTML = `<h3>${position.title}</h3><p>${position.description}</p>`;
        careersContainer.appendChild(positionDiv);
    });
});

