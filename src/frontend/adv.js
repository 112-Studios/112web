document.addEventListener('DOMContentLoaded', () => {
    // Pop-up for Privacy Policy
    const privacyPopup = document.getElementById('privacy-popup');
    const acceptPolicyButton = document.getElementById('accept-policy');
    
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

    // Newsletter Functionality
    const newsletterForm = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('email');
    const newsletterMessage = document.getElementById('newsletter-message');
    
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value;

        // Email validation
        if (!validator.isEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        try {
            const response = await fetch('/subscribe', { // Endpoint for subscription
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                newsletterMessage.innerText = 'You are subscribed to the newsletter!';
            } else {
                newsletterMessage.innerText = 'Failed to subscribe. Try again later.';
            }
        } catch (error) {
            newsletterMessage.innerText = 'Error subscribing to the newsletter.';
        }
    });
});
