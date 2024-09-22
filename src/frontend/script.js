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

    document.addEventListener('DOMContentLoaded', () => {
        const privacyPopup = document.getElementById('privacy-popup');
        const acceptPolicyButton = document.getElementById('accept-policy');
    
        // Show the pop-up if the policy hasn't been accepted
        const policyAccepted = localStorage.getItem('policyAccepted');
        if (!policyAccepted) {
            privacyPopup.classList.add('visible');
            document.body.classList.add('locked-content'); // Lock the body content
        }
    
        acceptPolicyButton.addEventListener('click', () => {
            localStorage.setItem('policyAccepted', true);
            privacyPopup.classList.remove('visible');
            document.body.classList.remove('locked-content'); // Unlock the body content
        });
    });
    

    // Newsletter Functionality
    const newsletterForm = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('email');
    const verificationSection = document.getElementById('verification-section');
    const verificationCodeInput = document.getElementById('verification-code');
    const verifyCodeButton = document.getElementById('verify-code');
    const newsletterMessage = document.getElementById('newsletter-message');
    
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
    
        // Email validation for well-known domains
        const validEmailDomains = ["gmail.com", "yahoo.com", "outlook.com", "icloud.com", "hotmail.com"];
        const emailDomain = email.split('@')[1];
        if (!validEmailDomains.includes(emailDomain)) {
            alert('Valid Email Domains: gmail.com | yahoo.com | outlook.com | icloud.com | hotmail.com | < --- Use one of those.');
            return;
        }
    
        try {
            const response = await fetch('/send-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
    
            if (response.ok) {
                newsletterMessage.innerText = 'Verification code sent. Please check your email.';
                verificationSection.style.display = 'block';
            } else {
                newsletterMessage.innerText = 'Failed to send verification code. Try again later.';
            }
        } catch (error) {
            newsletterMessage.innerText = 'Error sending verification code.';
        }
    });
    
    verifyCodeButton.addEventListener('click', async () => {
        const verificationCode = verificationCodeInput.value;
        const email = emailInput.value;
    
        try {
            const response = await fetch('/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, verificationCode })
            });
    
            if (response.ok) {
                newsletterMessage.innerText = 'You are subscribed to the newsletter!';
            } else {
                newsletterMessage.innerText = 'Invalid verification code.';
            }
        } catch (error) {
            newsletterMessage.innerText = 'Error verifying the code.';
        }
    });

    // Game Statistics
    const gameStats = {
        favorites: document.getElementById('favorites'),
        likes: document.getElementById('likes'),
        visits: document.getElementById('visits'),
        activePlayers: document.getElementById('active-players'),
        serverStatus: document.getElementById('serverStatus')
    };

    const updateGameStats = (stats) => {
        gameStats.favorites.innerText = stats.favorites || '0';
        gameStats.likes.innerText = stats.likes || '0';
        gameStats.visits.innerText = stats.visits || '0';
        gameStats.activePlayers.innerText = stats.activePlayers || '0';
    };

    const fetchInitialStats = async () => {
        const token = localStorage.getItem('JWT_SECRET'); // Retrieve token
        try {
            const response = await fetch('https://15fe-89-153-106-173.ngrok-free.app/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Failed to fetch stats from the server: ${text}`);
            }

            const data = await response.json();
            updateGameStats(data.stats);
        } catch (error) {
            console.error(error);
            gameStats.serverStatus.innerText = 'Stats are outdated or the server is down.';
        }
    };

    const setupWebSocket = () => {
        const ws = new WebSocket('wss://15fe-89-153-106-173.ngrok-free.app');

        ws.onopen = () => {
            console.log('WebSocket connection opened');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            updateGameStats(data.stats);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            gameStats.serverStatus.innerText = 'Server is down. Stats are outdated.';
            setTimeout(setupWebSocket, 5000); // Reconnect after 5 seconds
        };
    };

    fetchInitialStats();
    setupWebSocket();

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
