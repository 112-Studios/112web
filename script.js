document.addEventListener('DOMContentLoaded', () => {
    // **Scroll-based Animations for Sections**
    const sections = document.querySelectorAll('section');
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.2
    });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // **Back-to-Top Button**
    const backToTopButton = document.createElement('button');
    backToTopButton.id = 'back-to-top';
    backToTopButton.innerText = '↑';
    document.body.appendChild(backToTopButton);

    backToTopButton.style.display = 'none';

    window.addEventListener('scroll', () => {
        backToTopButton.style.display = window.scrollY > 500 ? 'block' : 'none';
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        showTopbar();
    });

    let lastScrollTop = 0;
    const header = document.querySelector('.topbar');

    const handleScroll = () => {
        const scrollTop = window.scrollY;
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            hideTopbar();
        } else if (scrollTop < lastScrollTop) {
            showTopbar();
        }
        lastScrollTop = scrollTop;

        if (scrollTop === 0) {
            showTopbar();
        }
    };

    window.addEventListener('scroll', handleScroll);

    function hideTopbar() {
        header.classList.add('hide-header');
    }

    function showTopbar() {
        header.classList.remove('hide-header');
    }

    // **Section Highlighting in the Navbar**
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

    // **Lazy Loading Images**
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imgObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                imgObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '0px 0px 50px 0px',
        threshold: 0.01
    });

    lazyImages.forEach(img => {
        imgObserver.observe(img);
    });

    // **Careers Page Specific**
    const positions = [
        // Edit this array to add/change/remove job positions&/details
        { title: "Game Designer(1x)", description: "As a Game Designer at 112-Studios, you will play a crucial role in shaping the gameplay experience of our projects. Your primary responsibilities will include balancing gameplay mechanics, developing prototypes, conducting rigorous testing, and collaborating closely with our team. Additionally, you will be involved in designing and implementing gamepasses to enhance player engagement and monetization." },
        { title: "UI & UX Designer(2x)", description: "As a UI & UX Designer at 112-Studios, you will be responsible for crafting intuitive and visually appealing user interfaces while ensuring an optimal user experience. You will design and implement user interfaces that are both functional and aesthetically pleasing, and collaborate closely with other team members to ensure a seamless and engaging player experience. Your role will also involve conducting user research and usability testing to refine designs and enhance the overall user journey." },
        { title: "Quality Assurance Tester(1x)", description: "As a Quality Assurance Tester at 112-Studios, you will play a critical role in ensuring the quality and stability of our games. You will be responsible for conducting thorough testing of game features and functionalities to identify bugs, inconsistencies, and issues. Your work will involve documenting findings, collaborating with the development team to resolve issues, and ensuring that the final product meets our high standards of quality before release." },
        { title: "Texturer(1x)", description: "As a Texturer at 112-Studios, you will be responsible for creating and applying textures to 3D models and environments to enhance their visual realism and detail. You will work closely with modelers and artists to develop high-quality textures that bring our game assets to life. Your role will involve creating texture maps, ensuring consistency across assets, and optimizing textures for performance."},
        { title: "Digital Artist(1x)", description: "As a Digital Artist at 112-Studios, you will be responsible for creating high-quality digital artwork that contributes to the visual style and aesthetic of our games. Your role will involve designing characters, environments, and other visual elements, as well as collaborating with other team members to ensure a cohesive and visually engaging game experience. You will utilize your artistic skills to bring creativity and visual appeal to our projects."},
        { title: "Organic Modeler(1x)", description: "As an Organic Modeler at 112-Studios, you will specialize in creating detailed and realistic organic 3D models, such as characters, creatures, and natural elements. Your role will involve sculpting, texturing, and refining models to achieve high levels of detail and realism. You will work closely with other artists and designers to ensure that your models fit seamlessly into the game world and contribute to an immersive player experience."},
    ];

    const positionsList = document.getElementById('positions-list');
    const noPositions = document.getElementById('no-positions');

    // Function to add positions to the list with fade-in animation
    function addPositions(startIndex, count) {
        const positionsSubset = positions.slice(startIndex, startIndex + count);
        if (positionsSubset.length > 0) {
            noPositions.style.display = 'none';
            positionsSubset.forEach((position, index) => {
                const positionItem = document.createElement('div');
                positionItem.classList.add('open-position-styles');
                positionItem.innerHTML = `
                    <h2>${position.title}</h2>
                    <p>${position.description}</p>
                `;
                positionsList.appendChild(positionItem);

                // Delay the fade-in effect for smooth animation
                setTimeout(() => {
                    positionItem.classList.add('visible');
                }, index * 500); // Delay each position fade by 200ms
            });
        } else {
            noPositions.style.display = 'block';
        }
    }

    let positionsLoaded = 0;
    const positionsPerLoad = 2; // Number of positions to load each time

    // Initial load
    addPositions(positionsLoaded, positionsPerLoad);
    positionsLoaded += positionsPerLoad;

    // **Infinite Scrolling**
    window.addEventListener('scroll', () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
            if (positionsLoaded < positions.length) {
                addPositions(positionsLoaded, positionsPerLoad);
                positionsLoaded += positionsPerLoad;
            }
        }
    });
});
