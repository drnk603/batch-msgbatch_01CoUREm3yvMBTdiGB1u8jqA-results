(function() {
  'use strict';

  const app = window.__app || {};
  window.__app = app;

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  const initBurgerMenu = () => {
    if (app.burgerInitialized) return;
    app.burgerInitialized = true;

    const toggle = document.querySelector('.c-nav__toggle, .navbar-toggler');
    const navCollapse = document.querySelector('.navbar-collapse');
    const body = document.body;

    if (!toggle || !navCollapse) return;

    const closeMenu = () => {
      navCollapse.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
    };

    const openMenu = () => {
      navCollapse.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
    };

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      if (navCollapse.classList.contains('show')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navCollapse.classList.contains('show')) {
        closeMenu();
        toggle.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (navCollapse.classList.contains('show') && 
          !navCollapse.contains(e.target) && 
          !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navCollapse.classList.contains('show')) {
          closeMenu();
        }
      });
    });

    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth >= 768 && navCollapse.classList.contains('show')) {
        closeMenu();
      }
    }, 150));
  };

  const initScrollSpy = () => {
    if (app.scrollSpyInitialized) return;
    app.scrollSpyInitialized = true;

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    const headerHeight = document.querySelector('.l-header')?.offsetHeight || 80;

    const observerCallback = throttle(() => {
      const scrollPosition = window.scrollY + headerHeight + 50;

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          navLinks.forEach(link => {
            link.classList.remove('is-active', 'active');
            link.removeAttribute('aria-current');

            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('is-active', 'active');
              link.setAttribute('aria-current', 'page');
            }
          });
        }
      });
    }, 100);

    window.addEventListener('scroll', observerCallback, { passive: true });
  };

  const initSmoothScroll = () => {
    if (app.smoothScrollInitialized) return;
    app.smoothScrollInitialized = true;

    const getHeaderHeight = () => document.querySelector('.l-header')?.offsetHeight || 80;

    const smoothScrollTo = (target) => {
      const headerHeight = getHeaderHeight();
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    };

    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        e.preventDefault();
        smoothScrollTo(targetElement);
        history.pushState(null, '', href);
      }
    });

    if (window.location.hash && window.location.hash !== '#') {
      const initialTarget = document.getElementById(window.location.hash.substring(1));
      if (initialTarget) {
        setTimeout(() => smoothScrollTo(initialTarget), 300);
      }
    }
  };

  const initActiveMenu = () => {
    if (app.activeMenuInitialized) return;
    app.activeMenuInitialized = true;

    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      const linkPath = link.getAttribute('href');
      if (!linkPath || linkPath.startsWith('#')) return;

      const isHomepage = currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/index.html');
      const linkIsHome = linkPath === '/' || linkPath === '/index.html' || linkPath === 'index.html';

      if ((isHomepage && linkIsHome) || linkPath === currentPath || currentPath.endsWith(linkPath)) {
        link.classList.add('is-active', 'active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('is-active', 'active');
        link.removeAttribute('aria-current');
      }
    });
  };

  const initImages = () => {
    if (app.imagesInitialized) return;
    app.imagesInitialized = true;

    const images = document.querySelectorAll('img');

    images.forEach(img => {
      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      const isCritical = img.classList.contains('c-logo__img') || img.hasAttribute('data-critical');
      if (!img.hasAttribute('loading') && !isCritical) {
        img.setAttribute('loading', 'lazy');
      }

      img.addEventListener('error', function() {
        const placeholderSVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e9ecef" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236c757d" font-family="sans-serif" font-size="18"%3EAfbeelding niet beschikbaar%3C/text%3E%3C/svg%3E';
        this.src = placeholderSVG;
      });
    });
  };

  const createNotification = (message, type = 'info') => {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      Object.assign(container.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '9999',
        maxWidth: '350px'
      });
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Sluiten"></button>`;
    container.appendChild(toast);

    const closeBtn = toast.querySelector('.btn-close');
    closeBtn?.addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 150);
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 150);
    }, 5000);
  };

  const validateField = (field) => {
    const type = field.type;
    const value = field.value.trim();
    const name = field.name;

    if (field.hasAttribute('required') && !value) {
      return { valid: false, message: 'Dit veld is verplicht.' };
    }

    if (type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, message: 'Voer een geldig e-mailadres in.' };
      }
    }

    if (type === 'tel' && value) {
      const phoneRegex = /^[\d\s\+\(\)\-]{10,20}$/;
      if (!phoneRegex.test(value)) {
        return { valid: false, message: 'Voer een geldig telefoonnummer in.' };
      }
    }

    if (name === 'firstName' || name === 'lastName') {
      const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
      if (value && !nameRegex.test(value)) {
        return { valid: false, message: 'Voer een geldige naam in (2-50 tekens).' };
      }
    }

    if (name === 'message' && value && value.length < 10) {
      return { valid: false, message: 'Bericht moet minimaal 10 tekens bevatten.' };
    }

    if (type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
      return { valid: false, message: 'U moet akkoord gaan met de voorwaarden.' };
    }

    return { valid: true, message: '' };
  };

  const showFieldError = (field, message) => {
    const formGroup = field.closest('.c-form__group') || field.closest('.form-check') || field.parentElement;
    if (!formGroup) return;

    formGroup.classList.add('has-error');
    field.classList.add('is-invalid');

    let errorElement = formGroup.querySelector('.c-form__error, .invalid-feedback');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'c-form__error invalid-feedback';
      formGroup.appendChild(errorElement);
    }
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  };

  const clearFieldError = (field) => {
    const formGroup = field.closest('.c-form__group') || field.closest('.form-check') || field.parentElement;
    if (!formGroup) return;

    formGroup.classList.remove('has-error');
    field.classList.remove('is-invalid');

    const errorElement = formGroup.querySelector('.c-form__error, .invalid-feedback');
    if (errorElement) {
      errorElement.style.display = 'none';
      errorElement.textContent = '';
    }
  };

  const initForms = () => {
    if (app.formsInitialized) return;
    app.formsInitialized = true;

    const forms = document.querySelectorAll('.c-form, form');

    forms.forEach(form => {
      const fields = form.querySelectorAll('input, textarea, select');

      fields.forEach(field => {
        field.addEventListener('blur', () => {
          const validation = validateField(field);
          if (!validation.valid) {
            showFieldError(field, validation.message);
          } else {
            clearFieldError(field);
          }
        });

        field.addEventListener('input', () => {
          if (field.classList.contains('is-invalid')) {
            const validation = validateField(field);
            if (validation.valid) {
              clearFieldError(field);
            }
          }
        });
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        let isValid = true;
        const formData = new FormData(form);

        fields.forEach(field => {
          const validation = validateField(field);
          if (!validation.valid) {
            showFieldError(field, validation.message);
            isValid = false;
          } else {
            clearFieldError(field);
          }
        });

        if (!isValid) {
          createNotification('Controleer de formuliervelden en probeer het opnieuw.', 'danger');
          return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : '';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Verzenden...';
        }

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }
          createNotification('Uw bericht is succesvol verzonden!', 'success');
          form.reset();
          setTimeout(() => {
            window.location.href = 'thank_you.html';
          }, 1000);
        }, 1500);
      });
    });
  };

  const initFAQSearch = () => {
    if (app.faqSearchInitialized) return;
    app.faqSearchInitialized = true;

    const searchInput = document.getElementById('faqSearch');
    if (!searchInput) return;

    const accordionItems = document.querySelectorAll('.accordion-item');

    searchInput.addEventListener('input', debounce((e) => {
      const query = e.target.value.toLowerCase().trim();

      accordionItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (!query || text.includes(query)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    }, 300));
  };

  const initMicroInteractions = () => {
    if (app.microInitialized) return;
    app.microInitialized = true;

    const interactiveElements = document.querySelectorAll('.c-button, .btn, .nav-link, .card');

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        el.classList.add('u-hover');
      });

      el.addEventListener('mouseleave', () => {
        el.classList.remove('u-hover');
      });
    });
  };

  app.init = () => {
    initBurgerMenu();
    initScrollSpy();
    initSmoothScroll();
    initActiveMenu();
    initImages();
    initForms();
    initFAQSearch();
    initMicroInteractions();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }

})();
