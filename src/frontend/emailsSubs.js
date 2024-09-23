document.addEventListener('DOMContentLoaded', () => {
  const privacyPopup = document.getElementById('privacy-popup');
  const acceptBtn = document.getElementById('accept-policy-btn');
  const newsletterForm = document.getElementById('newsletter-form');
  const emailInput = document.getElementById('email');
  const subscribeBtn = newsletterForm.querySelector('button');

  console.log('Elements Loaded:', { privacyPopup, acceptBtn, newsletterForm, emailInput });

  // Initially hide the email form and keep the popup visible
  newsletterForm.style.display = 'none';

  // Accept button click event
  acceptBtn.addEventListener('click', () => {
      console.log('Accept button clicked'); // Log when button is clicked
      // Hide the privacy popup
      privacyPopup.style.display = 'none';

      // Show and center the email form
      newsletterForm.style.display = 'flex';
      newsletterForm.style.justifyContent = 'center';
      newsletterForm.style.alignItems = 'center';
      newsletterForm.style.flexDirection = 'column';
  });
});
