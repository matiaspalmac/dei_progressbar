/* ===== Dei Progress Bar - App.js ===== */

(() => {
  'use strict';

  /* ===== Safe resource name (avoids crash in browser) ===== */
  function safeResourceName() {
    return (typeof GetParentResourceName !== 'undefined') ? GetParentResourceName() : 'dei_progressbar';
  }

  // Config
  let cfg = {
    successFlash: true,
    shimmerEffect: true,
  };

  // State
  let activeStyle = null;
  let animFrame = null;
  let startTime = 0;
  let duration = 0;
  let completed = false;

  // Elements cache
  const els = {
    linear: document.getElementById('progress-linear'),
    circular: document.getElementById('progress-circular'),
    mini: document.getElementById('progress-mini'),
    semicircle: document.getElementById('progress-semicircle'),
  };

  // Circumference constants
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 52;   // r=52 -> ~326.73
  const SEMI_ARC_LENGTH = Math.PI * 90;              // r=90, half -> ~282.74

  /* ===== Theme ===== */
  function setTheme(theme, lightMode) {
    document.body.setAttribute('data-theme', theme || 'dark');
    document.body.classList.toggle('light-mode', !!lightMode);
  }

  /* ===== Hide all containers ===== */
  function hideAll() {
    Object.values(els).forEach(el => {
      el.classList.remove('show', 'success-flash');
      el.classList.add('hidden');
    });
    if (animFrame) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }
    activeStyle = null;
  }

  /* ===== Set progress color ===== */
  function setColor(container, color) {
    container.style.setProperty('--progress-color', color);
    // For linear/mini fill gradient
    const fill = container.querySelector('.progress-fill');
    if (fill) {
      fill.style.background = `linear-gradient(90deg, ${color}, ${lightenColor(color, 20)})`;
    }
    // For circular ring
    const ring = container.querySelector('.circular-fill-ring');
    if (ring) ring.style.stroke = color;
    // For semicircle arc
    const arc = container.querySelector('.semicircle-fill-arc');
    if (arc) arc.style.stroke = color;
  }

  function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + Math.round(255 * percent / 100));
    const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * percent / 100));
    const b = Math.min(255, (num & 0x0000FF) + Math.round(255 * percent / 100));
    return `rgb(${r}, ${g}, ${b})`;
  }

  /* ===== Update progress elements ===== */
  function updateLinear(pct) {
    const container = els.linear;
    const fill = container.querySelector('.progress-fill');
    const percent = container.querySelector('.progress-percent');
    fill.style.width = pct + '%';
    percent.textContent = Math.round(pct) + '%';

    // Pulse effect at >90%
    if (pct > 90) {
      fill.classList.add('pulsing');
    } else {
      fill.classList.remove('pulsing');
    }
  }

  function updateCircular(pct) {
    const container = els.circular;
    const ring = container.querySelector('.circular-fill-ring');
    const percent = container.querySelector('.circular-percent');
    const offset = CIRCLE_CIRCUMFERENCE - (pct / 100) * CIRCLE_CIRCUMFERENCE;
    ring.style.strokeDashoffset = offset;
    percent.textContent = Math.round(pct) + '%';

    if (pct > 90) {
      ring.classList.add('pulsing');
    } else {
      ring.classList.remove('pulsing');
    }
  }

  function updateMini(pct) {
    const container = els.mini;
    const fill = container.querySelector('.progress-fill');
    const percent = container.querySelector('.progress-percent');
    fill.style.width = pct + '%';
    percent.textContent = Math.round(pct) + '%';

    if (pct > 90) {
      fill.classList.add('pulsing');
    } else {
      fill.classList.remove('pulsing');
    }
  }

  function updateSemicircle(pct) {
    const container = els.semicircle;
    const arc = container.querySelector('.semicircle-fill-arc');
    const percent = container.querySelector('.semicircle-percent');
    const offset = SEMI_ARC_LENGTH - (pct / 100) * SEMI_ARC_LENGTH;
    arc.style.strokeDashoffset = offset;
    percent.textContent = Math.round(pct) + '%';

    if (pct > 90) {
      arc.classList.add('pulsing');
    } else {
      arc.classList.remove('pulsing');
    }
  }

  const updaters = {
    linear: updateLinear,
    circular: updateCircular,
    mini: updateMini,
    semicircle: updateSemicircle,
  };

  /* ===== Animation loop ===== */
  function tick() {
    if (!activeStyle) return;
    const elapsed = Date.now() - startTime;
    const pct = Math.min(100, (elapsed / duration) * 100);

    updaters[activeStyle](pct);

    if (pct >= 100) {
      completed = true;
      onComplete();
      return;
    }
    animFrame = requestAnimationFrame(tick);
  }

  function onComplete() {
    const container = els[activeStyle];
    if (cfg.successFlash && container) {
      container.classList.add('success-flash');
    }

    // Small delay to show completion then hide
    setTimeout(() => {
      hideAll();
      fetch(`https://${safeResourceName()}/progressComplete`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
    }, cfg.successFlash ? 450 : 50);
  }

  /* ===== Start progress ===== */
  function startProgress(data) {
    hideAll();
    completed = false;

    const style = data.style || 'linear';
    const container = els[style];
    if (!container) return;

    activeStyle = style;
    duration = data.duration || 3000;
    startTime = Date.now();

    // Set color
    setColor(container, data.color || '#3b82f6');

    // Set label
    const labelEls = container.querySelectorAll('.progress-label, .circular-label, .semicircle-label');
    labelEls.forEach(el => el.textContent = data.label || '');

    // Reset fill
    const fill = container.querySelector('.progress-fill');
    if (fill) {
      fill.style.width = '0%';
      fill.classList.remove('pulsing');
    }
    const ring = container.querySelector('.circular-fill-ring');
    if (ring) {
      ring.style.strokeDashoffset = CIRCLE_CIRCUMFERENCE;
      ring.classList.remove('pulsing');
    }
    const arc = container.querySelector('.semicircle-fill-arc');
    if (arc) {
      arc.style.strokeDashoffset = SEMI_ARC_LENGTH;
      arc.classList.remove('pulsing');
    }

    // Reset percent
    const pcts = container.querySelectorAll('.progress-percent, .circular-percent, .semicircle-percent');
    pcts.forEach(el => el.textContent = '0%');

    // Shimmer
    if (!cfg.shimmerEffect) {
      container.classList.add('no-shimmer');
    } else {
      container.classList.remove('no-shimmer');
    }

    // Cancel text
    const cancelEl = container.querySelector('.progress-cancel');
    if (cancelEl) {
      if (data.canCancel && data.cancelText) {
        cancelEl.textContent = data.cancelText.replace('~INPUT_VEH_DUCK~', '[X]');
        cancelEl.classList.remove('hidden');
      } else {
        cancelEl.classList.add('hidden');
      }
    }

    // Icon (circular only)
    if (style === 'circular') {
      const iconEl = container.querySelector('.circular-icon');
      if (data.icon) {
        iconEl.textContent = getIconChar(data.icon);
        iconEl.classList.remove('hidden');
      } else {
        iconEl.classList.add('hidden');
      }
    }

    // Show
    container.classList.remove('hidden');
    // Force reflow for animation
    void container.offsetWidth;
    container.classList.add('show');

    // Start animation
    animFrame = requestAnimationFrame(tick);
  }

  /* ===== Simple icon mapping (Unicode) ===== */
  function getIconChar(name) {
    const icons = {
      wrench: '\u{1F527}',
      lock: '\u{1F512}',
      unlock: '\u{1F513}',
      gear: '\u2699',
      heart: '\u2764',
      star: '\u2B50',
      fire: '\u{1F525}',
      bolt: '\u26A1',
      shield: '\u{1F6E1}',
      car: '\u{1F697}',
      fish: '\u{1F3A3}',
      box: '\u{1F4E6}',
      pill: '\u{1F48A}',
      food: '\u{1F354}',
      drink: '\u{1F964}',
      money: '\u{1F4B0}',
      key: '\u{1F511}',
      search: '\u{1F50D}',
      tool: '\u{1F6E0}',
      hands: '\u{1F91D}',
    };
    return icons[name] || icons['gear'];
  }

  /* ===== NUI Message Listener ===== */
  window.addEventListener('message', (e) => {
    const data = e.data;
    switch (data.action) {
      case 'start':
        startProgress(data);
        break;

      case 'hide':
        hideAll();
        break;

      case 'setTheme':
        setTheme(data.theme, data.lightMode);
        break;

      case 'setConfig':
        if (data.successFlash !== undefined) cfg.successFlash = data.successFlash;
        if (data.shimmerEffect !== undefined) cfg.shimmerEffect = data.shimmerEffect;
        break;
    }
  });

  // ===== PREVIEW / DEMO MODE =====
  const IS_BROWSER = !window.invokeNative;
  if (IS_BROWSER) {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.style.visibility = 'visible';
      document.body.setAttribute('data-theme', 'dark');

      setTimeout(() => {
        // Linear progress bar
        window.postMessage({ action: 'start', style: 'linear', duration: 15000, label: 'Reparando vehiculo...', color: '#3b82f6' });

        // Also show circular one simultaneously (after a brief delay so both are visible)
        setTimeout(() => {
          // Create a second demo by directly showing circular
          const circContainer = els.circular;
          if (circContainer) {
            const circLabel = circContainer.querySelector('.circular-label');
            const circRing = circContainer.querySelector('.circular-fill-ring');
            const circPct = circContainer.querySelector('.circular-percent');
            if (circLabel) circLabel.textContent = 'Abriendo cerradura...';
            if (circRing) {
              circRing.style.stroke = '#a855f7';
              circRing.style.strokeDashoffset = CIRCLE_CIRCUMFERENCE * 0.55;
            }
            if (circPct) circPct.textContent = '45%';
            circContainer.classList.remove('hidden');
            circContainer.classList.add('show');
            circContainer.style.position = 'fixed';
            circContainer.style.top = '60%';
            circContainer.style.left = '50%';
            circContainer.style.transform = 'translateX(-50%)';
          }
        }, 500);
      }, 500);
    });
  }
})();
