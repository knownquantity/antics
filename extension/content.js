// [ANTICS] Content script - Where the mischief happens!

(function() {
  'use strict';

  // Prevent double-injection
  if (window.__ANTICS_LOADED__) return;
  window.__ANTICS_LOADED__ = true;

  console.log('[ANTICS] The jester has entered the page...');

  // State
  let settings = null;
  let isEnabled = false;
  let activeAntics = new Set();

  // Intensity multipliers
  const INTENSITY = {
    mild: 0.3,
    medium: 0.6,
    turmoil: 1.0
  };

  // ===========================================
  // ANTIC: Confetti Hover
  // Summon sparkles that follow the cursor!
  // ===========================================
  const confettiHover = {
    particles: [],
    canvas: null,
    ctx: null,
    animationId: null,

    init() {
      if (this.canvas) return;

      this.canvas = document.createElement('canvas');
      this.canvas.id = 'antics-confetti-canvas';
      this.canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 999999;
      `;
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
      document.addEventListener('mousemove', (e) => this.onMouseMove(e));
      this.animate();
    },

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    onMouseMove(e) {
      if (!isEnabled || !settings?.antics?.confettiHover) return;

      const intensity = INTENSITY[settings.intensity] || 0.6;
      const count = Math.floor(Math.random() * 3 * intensity) + 1;

      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 4 * intensity,
          vy: (Math.random() - 0.5) * 4 * intensity - 2,
          size: Math.random() * 6 + 2,
          color: this.randomColor(),
          life: 1,
          decay: 0.02 + Math.random() * 0.02
        });
      }

      // Limit particles
      if (this.particles.length > 100) {
        this.particles = this.particles.slice(-100);
      }
    },

    randomColor() {
      const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
      return colors[Math.floor(Math.random() * colors.length)];
    },

    animate() {
      if (!this.ctx) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.particles = this.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // Gravity
        p.life -= p.decay;

        if (p.life <= 0) return false;

        this.ctx.globalAlpha = p.life;
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();

        return true;
      });

      this.ctx.globalAlpha = 1;
      this.animationId = requestAnimationFrame(() => this.animate());
    },

    destroy() {
      if (this.animationId) cancelAnimationFrame(this.animationId);
      if (this.canvas) this.canvas.remove();
      this.canvas = null;
      this.ctx = null;
      this.particles = [];
    }
  };

  // ===========================================
  // ANTIC: Text Wobble
  // Words dance when hovered!
  // ===========================================
  const textWobble = {
    style: null,

    init() {
      if (this.style) return;

      this.style = document.createElement('style');
      this.style.id = 'antics-text-wobble';
      this.style.textContent = `
        .antics-wobble {
          display: inline-block;
          transition: transform 0.1s ease;
        }
        .antics-wobble:hover {
          animation: antics-wobble-dance 0.3s ease infinite;
        }
        @keyframes antics-wobble-dance {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-3deg) scale(1.05); }
          75% { transform: rotate(3deg) scale(1.05); }
        }
      `;
      document.head.appendChild(this.style);
    },

    apply() {
      if (!isEnabled || !settings?.antics?.textWobble) return;

      const intensity = INTENSITY[settings.intensity] || 0.6;
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, a, button');

      headings.forEach(el => {
        if (el.classList.contains('antics-wobble')) return;
        if (Math.random() > intensity) return;
        el.classList.add('antics-wobble');
      });
    },

    destroy() {
      document.querySelectorAll('.antics-wobble').forEach(el => {
        el.classList.remove('antics-wobble');
      });
      if (this.style) this.style.remove();
      this.style = null;
    }
  };

  // ===========================================
  // ANTIC: Button Bounce
  // Buttons get playful on click!
  // ===========================================
  const buttonBounce = {
    style: null,

    init() {
      if (this.style) return;

      this.style = document.createElement('style');
      this.style.id = 'antics-button-bounce';
      this.style.textContent = `
        .antics-bounce {
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .antics-bounce:active {
          transform: scale(0.9);
        }
        .antics-bounce.antics-bouncing {
          animation: antics-bounce-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes antics-bounce-pop {
          0% { transform: scale(1); }
          30% { transform: scale(0.85); }
          50% { transform: scale(1.1); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
      `;
      document.head.appendChild(this.style);
      document.addEventListener('click', this.onClick.bind(this));
    },

    onClick(e) {
      if (!isEnabled || !settings?.antics?.buttonBounce) return;

      const btn = e.target.closest('button, [role="button"], input[type="submit"], input[type="button"], .btn, a.button');
      if (!btn) return;

      btn.classList.add('antics-bounce', 'antics-bouncing');
      setTimeout(() => btn.classList.remove('antics-bouncing'), 400);
    },

    destroy() {
      document.querySelectorAll('.antics-bounce').forEach(el => {
        el.classList.remove('antics-bounce', 'antics-bouncing');
      });
      if (this.style) this.style.remove();
      this.style = null;
    }
  };

  // ===========================================
  // ANTIC: Image Tilt
  // Images lean toward cursor!
  // ===========================================
  const imageTilt = {
    style: null,
    boundMouseMove: null,

    init() {
      if (this.style) return;

      this.style = document.createElement('style');
      this.style.id = 'antics-image-tilt';
      this.style.textContent = `
        .antics-tilt {
          transition: transform 0.15s ease-out;
          transform-style: preserve-3d;
        }
      `;
      document.head.appendChild(this.style);
      this.boundMouseMove = this.onMouseMove.bind(this);
      document.addEventListener('mousemove', this.boundMouseMove);
    },

    onMouseMove(e) {
      if (!isEnabled || !settings?.antics?.imageTilt) return;

      const intensity = INTENSITY[settings.intensity] || 0.6;
      const images = document.querySelectorAll('img.antics-tilt');

      images.forEach(img => {
        const rect = img.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) / rect.width;
        const deltaY = (e.clientY - centerY) / rect.height;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance < 1.5) {
          const rotateY = deltaX * 15 * intensity;
          const rotateX = -deltaY * 15 * intensity;
          img.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        } else {
          img.style.transform = '';
        }
      });
    },

    apply() {
      if (!isEnabled || !settings?.antics?.imageTilt) return;

      const intensity = INTENSITY[settings.intensity] || 0.6;
      const images = document.querySelectorAll('img:not(.antics-tilt)');

      images.forEach(img => {
        if (img.width < 50 || img.height < 50) return;
        if (Math.random() > intensity) return;
        img.classList.add('antics-tilt');
      });
    },

    destroy() {
      document.querySelectorAll('.antics-tilt').forEach(el => {
        el.classList.remove('antics-tilt');
        el.style.transform = '';
      });
      if (this.boundMouseMove) {
        document.removeEventListener('mousemove', this.boundMouseMove);
      }
      if (this.style) this.style.remove();
      this.style = null;
    }
  };

  // ===========================================
  // ANTIC: Feed Shuffle
  // Randomize content order (for feeds/lists)
  // ===========================================
  const feedShuffle = {
    shuffledContainers: new WeakSet(),

    apply() {
      if (!isEnabled || !settings?.antics?.feedShuffle) return;

      // Common feed selectors
      const selectors = [
        '[role="feed"]',
        '.feed',
        '.timeline',
        'article',
        '.post',
        '.card'
      ].join(',');

      const containers = document.querySelectorAll('main, [role="main"], .content, #content');

      containers.forEach(container => {
        if (this.shuffledContainers.has(container)) return;

        const items = container.querySelectorAll(selectors);
        if (items.length < 3) return;

        const parent = items[0].parentElement;
        const itemsArray = Array.from(items);

        // Fisher-Yates shuffle
        for (let i = itemsArray.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [itemsArray[i], itemsArray[j]] = [itemsArray[j], itemsArray[i]];
        }

        // Re-append in shuffled order
        itemsArray.forEach(item => parent.appendChild(item));
        this.shuffledContainers.add(container);

        console.log('[ANTICS] Feed shuffled! The algorithm has been subverted!');
      });
    },

    destroy() {
      // Can't easily unshuffle, but new page loads will be normal
      this.shuffledContainers = new WeakSet();
    }
  };

  // ===========================================
  // Main controller
  // ===========================================
  const antics = {
    confettiHover,
    textWobble,
    buttonBounce,
    imageTilt,
    feedShuffle
  };

  function applyAntics() {
    if (!isEnabled || !settings) return;

    Object.entries(settings.antics).forEach(([name, enabled]) => {
      if (enabled && antics[name]) {
        if (antics[name].init) antics[name].init();
        if (antics[name].apply) antics[name].apply();
      }
    });
  }

  function destroyAllAntics() {
    Object.values(antics).forEach(antic => {
      if (antic.destroy) antic.destroy();
    });
  }

  // Load settings and initialize
  async function init() {
    try {
      // Check if domain is excluded
      const domainCheck = await chrome.runtime.sendMessage({
        type: 'ANTICS_CHECK_DOMAIN',
        domain: window.location.hostname
      });

      if (!domainCheck.allowed) {
        console.log('[ANTICS] This domain is in the safe zone. No mischief here!');
        return;
      }

      // Get settings
      settings = await chrome.runtime.sendMessage({ type: 'ANTICS_GET_SETTINGS' });
      isEnabled = settings?.enabled ?? true;

      if (isEnabled) {
        applyAntics();
      }

      // Watch for DOM changes
      const observer = new MutationObserver(() => {
        if (isEnabled) applyAntics();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      console.log('[ANTICS] Mischief managed! Ready for chaos.');
    } catch (err) {
      console.log('[ANTICS] Could not initialize:', err);
    }
  }

  // Listen for settings updates
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ANTICS_SETTINGS_UPDATED') {
      settings = message.settings;
      isEnabled = settings?.enabled ?? true;

      if (isEnabled) {
        applyAntics();
      } else {
        destroyAllAntics();
      }
      sendResponse({ ok: true });
    }

    if (message.type === 'ANTICS_SUMMON') {
      // Force trigger a specific antic
      const antic = antics[message.antic];
      if (antic) {
        if (antic.init) antic.init();
        if (antic.apply) antic.apply();
        console.log(`[ANTICS] ${message.antic} has been summoned!`);
      }
      sendResponse({ ok: true });
    }

    return false;
  });

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
