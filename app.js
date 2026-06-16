// --- UI Animations & Custom Interactions — Abu Aiuohall Md Ratul Portfolio ---

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- 1. Custom 3D Card Tilt Dynamics (Performance Optimized) ---
  const cards = document.querySelectorAll('.project-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // Mouse x relative to card
      const y = e.clientY - rect.top;  // Mouse y relative to card

      // Store mouse coordinates in CSS variables for dynamic specular reflection
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // Normalization calculations (Range: -0.5 to 0.5)
      const normX = (x / rect.width) - 0.5;
      const normY = (y / rect.height) - 0.5;

      // Max degrees to tilt
      const maxTilt = 12;

      // 3D rotations based on coordinates
      const rotateX = -normY * maxTilt;
      const rotateY = normX * maxTilt;

      // Render the tilt transform smoothly
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    // Reset card translation state on mouse leave
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.setProperty('--mouse-x', '50%');
      card.style.setProperty('--mouse-y', '50%');
    });
  });

  // --- 2. Interactive Scroll Reveal & Active Links (Intersection Observer) ---
  const revealElements = document.querySelectorAll('.reveal-up');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-menu a');

  // Reveal transition observer
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Unobserve to keep element active after scrolling past it
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  function setActiveNav(activeSectionId) {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${activeSectionId}`);
    });
  }

  function updateActiveNav() {
    const navHeight = document.querySelector('nav')?.offsetHeight || 0;
    const activationLine = navHeight + 90;
    let activeSectionId = sections[0]?.getAttribute('id');

    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= activationLine) {
        activeSectionId = section.getAttribute('id');
      }
    });

    const nearPageBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (nearPageBottom && sections.length) {
      activeSectionId = sections[sections.length - 1].getAttribute('id');
    }

    if (activeSectionId) {
      setActiveNav(activeSectionId);
    }
  }

  let navTicking = false;
  window.addEventListener('scroll', () => {
    if (!navTicking) {
      window.requestAnimationFrame(() => {
        updateActiveNav();
        navTicking = false;
      });
      navTicking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateActiveNav);
  updateActiveNav();

  // --- 3. Dynamic Theme Synchronizer (Obsidian vs. Solar) ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;

  function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    const newTheme = isLight ? 'light' : 'dark';

    // Toggle icons
    if (themeIcon) {
      themeIcon.className = isLight ? 'ti ti-sun' : 'ti ti-moon';
    }

    // Save user choice in localstorage
    localStorage.setItem('portfolio-theme', newTheme);

    // Call 3D Canvas Theme Sync
    if (window.set3DTheme) {
      window.set3DTheme(newTheme);
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Restore saved theme on initial page render
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    if (themeIcon) themeIcon.className = 'ti ti-sun';
    // 3D theme synchronization will happen automatically on canvas load
  }

  // --- 4. Mobile Menu Toggler ---
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.className = navMenu.classList.contains('open') ? 'ti ti-x' : 'ti ti-menu-2';
      }
    });

    // Close menu when a navigation item is clicked
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        const activeSectionId = link.getAttribute('href')?.replace('#', '');
        if (activeSectionId) setActiveNav(activeSectionId);
        const icon = mobileToggle.querySelector('i');
        if (icon) icon.className = 'ti ti-menu-2';
      });
    });
  }

  // --- 5. Interactive Contact Portal & Mail Dispatcher ---
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (contactForm) {
    const submitBtn = document.getElementById('cf-submit');
    const RECIPIENT = 'aiuohallratul2000@gmail.com';

    function showSuccess(message) {
      if (formSuccess) {
        if (message) formSuccess.textContent = message;
        formSuccess.style.display = 'block';
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      contactForm.reset();
    }

    // Fallback for when no Web3Forms key is configured: open the visitor's mail client.
    function mailtoFallback(name, email, purpose, msg) {
      const subject = encodeURIComponent(`Portfolio Contact: ${purpose}`);
      const body = encodeURIComponent(
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Purpose: ${purpose}\n\n` +
        `Message:\n${msg}`
      );
      window.open(`mailto:${RECIPIENT}?subject=${subject}&body=${body}`);
      showSuccess('Opening your mail client to dispatch the message to Ratul.');
    }

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('cf-name').value.trim();
      const email = document.getElementById('cf-email').value.trim();
      const purpose = document.getElementById('cf-purpose').value.trim() || 'General Inquiry';
      const msg = document.getElementById('cf-message').value.trim();

      if (!name || !email || !msg) {
        alert('Please complete the mandatory fields (Name, Email, and Message).');
        return;
      }

      const accessKey = document.getElementById('cf-access-key')?.value;
      const keyConfigured = accessKey && accessKey !== 'YOUR_WEB3FORMS_ACCESS_KEY';

      // No backend key yet → gracefully fall back to mailto so the form still works.
      if (!keyConfigured) {
        mailtoFallback(name, email, purpose, msg);
        return;
      }

      // Submit through Web3Forms (real email delivery, no mail client needed).
      const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ti ti-loader-2"></i> Sending...';
      }

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(contactForm)))
        });
        const data = await response.json();

        if (data.success) {
          showSuccess('Message sent successfully! Ratul will get back to you soon.');
        } else {
          throw new Error(data.message || 'Submission failed');
        }
      } catch (err) {
        // Network/API failure → don't lose the visitor's message, fall back to mailto.
        mailtoFallback(name, email, purpose, msg);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
      }
    });
  }
});

// --- Clone Command Copy Button (global scope for inline onclick) ---
function copyClone(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = '<i class="ti ti-check"></i>';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = '<i class="ti ti-copy"></i>';
    }, 2000);
  });
}

// --- Scroll Progress Bar + Back-to-Top Button ---
(function () {
  const progressBar = document.getElementById('scroll-progress');
  const backToTop = document.getElementById('back-to-top');

  function onScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) progressBar.style.width = percent + '%';
    if (backToTop) backToTop.classList.toggle('visible', scrollTop > 600);
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
