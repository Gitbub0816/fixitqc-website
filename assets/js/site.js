// FixIt QC Marketing Site v7.0 - Site JS

document.addEventListener('DOMContentLoaded', function() {
  // Hamburger menu toggle
  const hamburger = document.getElementById('hamburger');
  const cascade = document.getElementById('cascade');
  
  if (hamburger && cascade) {
    hamburger.addEventListener('click', function() {
      const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !isExpanded);
      cascade.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!hamburger.contains(e.target) && !cascade.contains(e.target)) {
        hamburger.setAttribute('aria-expanded', 'false');
        cascade.classList.remove('active');
      }
    });
    
    // Close menu when clicking a link
    const menuLinks = cascade.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', function() {
        hamburger.setAttribute('aria-expanded', 'false');
        cascade.classList.remove('active');
      });
    });
  }
  
  // Contact form handling
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const status = document.getElementById('formStatus');
      status.textContent = 'Message sent! (Demo mode)';
      status.style.color = 'var(--copper)';
      setTimeout(() => {
        contactForm.reset();
        status.textContent = '';
      }, 3000);
    });
  }
});
