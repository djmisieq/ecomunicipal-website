/* ===================================================
   MAIN.JS – EcoMunicipal Website Logic
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ─── Scroll Progress Bar ───
  const scrollProgress = document.querySelector('.scroll-progress');
  
  // ─── Sticky Header ───
  const header = document.querySelector('.header');
  
  // ─── Scroll handler ───
  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // Progress bar
    if (scrollProgress && docHeight > 0) {
      scrollProgress.style.transform = `scaleX(${scrollTop / docHeight})`;
    }
    
    // Header scroll state
    if (header) {
      header.classList.toggle('scrolled', scrollTop > 50);
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ─── Mobile Menu ───
  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('.header__nav-link');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('open');
      nav.classList.toggle('open');
      document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('open');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ─── Active Section in Nav ───
  const sections = document.querySelectorAll('section[id]');
  
  const updateActiveNav = () => {
    const scrollPos = window.scrollY + 150;
    
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.header__nav-link[href="#${id}"]`);
      
      if (link) {
        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  };
  
  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // ─── Intersection Observer for Scroll Animations ───
  const animateElements = document.querySelectorAll('.animate, .animate--left, .animate--right, .animate--scale, .animate--stagger');
  
  if (animateElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });
    
    animateElements.forEach(el => observer.observe(el));
  }

  // ─── Counter Animation ───
  const counters = document.querySelectorAll('[data-counter]');
  
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.counter, 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 2000;
    const startTime = performance.now();
    
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      
      el.textContent = prefix + current.toLocaleString('pl-PL') + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + target.toLocaleString('pl-PL') + suffix;
      }
    };
    
    requestAnimationFrame(update);
  };

  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    counters.forEach(el => counterObserver.observe(el));
  }

  // ─── Product Filter Tabs ───
  const tabBtns = document.querySelectorAll('.tab-btn');
  const productCards = document.querySelectorAll('.product-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      productCards.forEach(card => {
        const category = card.dataset.category;
        if (filter === 'all' || category === filter) {
          card.style.display = '';
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 400);
        }
      });
    });
  });

  // ─── Contact Form Validation ───
  const form = document.getElementById('contact-form');
  
  if (form) {
    const validateField = (input) => {
      const group = input.closest('.form-group');
      if (!group) return true;
      
      let isValid = true;
      
      if (input.required && !input.value.trim()) {
        isValid = false;
      }
      
      if (input.type === 'email' && input.value.trim()) {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRe.test(input.value);
      }
      
      if (input.type === 'tel' && input.value.trim()) {
        const phoneRe = /^[\d\s\-+()]{7,}$/;
        isValid = phoneRe.test(input.value);
      }
      
      group.classList.toggle('error', !isValid);
      group.classList.toggle('success', isValid && input.value.trim());
      
      return isValid;
    };
    
    form.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        const group = input.closest('.form-group');
        if (group && group.classList.contains('error')) {
          validateField(input);
        }
      });
    });
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const inputs = form.querySelectorAll('.form-input[required], .form-textarea[required], .form-select[required]');
      let allValid = true;
      
      inputs.forEach(input => {
        if (!validateField(input)) allValid = false;
      });
      
      if (allValid) {
        form.style.display = 'none';
        const success = document.querySelector('.form-success');
        if (success) success.classList.add('show');
      }
    });
  }

  // ─── Smooth Scroll for anchor links ───
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ─── Particle Canvas (Hero) ───
  const canvas = document.getElementById('hero-particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;
    
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.4 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 197, 94, ${this.opacity})`;
        ctx.fill();
      }
    }
    
    // Create particles
    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
    
    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(34, 197, 94, ${0.06 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      connectParticles();
      animId = requestAnimationFrame(animate);
    };
    
    // Only run particles if not reduced motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animate();
    } else {
      // Draw static particles
      particles.forEach(p => p.draw());
      connectParticles();
    }
  }
});
