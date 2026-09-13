/**
 * RYNEX — Web & Software Solutions
 * Interactive Engine, Audio Synthesizer, 3D Tilt & Pipeline Telemetry
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. PROCEDURAL WEB AUDIO SYNTHESIZER (Sci-Fi Audio FX)
  // ==========================================================================
  class CyberAudio {
    constructor() {
      this.enabled = true;
      this.ctx = null;
      this.init();
    }

    init() {
      const saved = localStorage.getItem('rynex_sfx');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
      this.updateUI();
    }

    getContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    }

    playHover() {
      if (!this.enabled) return;
      try {
        const ctx = this.getContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } catch (e) {}
    }

    playClick() {
      if (!this.enabled) return;
      try {
        const ctx = this.getContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } catch (e) {}
    }

    playSuccess() {
      if (!this.enabled) return;
      try {
        const ctx = this.getContext();
        if (!ctx) return;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          
          const start = ctx.currentTime + (i * 0.06);
          gain.gain.setValueAtTime(0.03, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.2);
        });
      } catch (e) {}
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('rynex_sfx', this.enabled);
      this.updateUI();
      if (this.enabled) this.playSuccess();
    }

    updateUI() {
      const btn = document.getElementById('soundToggle');
      if (!btn) return;
      const onIcon = btn.querySelector('.sound-on-icon');
      const offIcon = btn.querySelector('.sound-off-icon');
      const statusText = btn.querySelector('.sound-status-text');

      if (this.enabled) {
        if (onIcon) onIcon.classList.remove('hidden');
        if (offIcon) offIcon.classList.add('hidden');
        if (statusText) statusText.textContent = 'SFX: ON';
        btn.classList.add('border-cyan-500/50', 'text-cyan-300');
        btn.classList.remove('text-slate-500');
      } else {
        if (onIcon) onIcon.classList.add('hidden');
        if (offIcon) offIcon.classList.remove('hidden');
        if (statusText) statusText.textContent = 'SFX: OFF';
        btn.classList.remove('border-cyan-500/50', 'text-cyan-300');
        btn.classList.add('text-slate-500');
      }
    }
  }

  const audio = new CyberAudio();
  const soundToggleBtn = document.getElementById('soundToggle');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => audio.toggle());
  }

  // Attach global audio listeners
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-sound="hover"], a, button, .service-card, .pipeline-tab, .tech-pill');
    if (target) audio.playHover();
  });

  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-sound="click"], button, a, input[type="checkbox"], input[type="range"]');
    if (target && !target.closest('#soundToggle')) audio.playClick();
  });


  // ==========================================================================
  // 2. CUSTOM CYBER CURSOR ENGINE
  // ==========================================================================
  const cursor = document.getElementById('customCursor');
  const dot = document.getElementById('cursorDot');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (dot) {
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    }
  });

  function renderCursor() {
    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;
    if (cursor) {
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
    }
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Hover expansion
  const interactables = document.querySelectorAll('a, button, input, textarea, select, .service-card, .pipeline-tab, .poster-hud-item');
  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => cursor?.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor?.classList.remove('hovering'));
  });


  // ==========================================================================
  // 3. BACKGROUND CONSTELLATION & PARTICLE SHADER CANVAS
  // ==========================================================================
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(Math.floor((width * height) / 14000), 90);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 1.8 + 0.5,
        color: Math.random() > 0.6 ? '#a855f7' : Math.random() > 0.3 ? '#38bdf8' : '#818cf8',
        alpha: Math.random() * 0.6 + 0.2
      });
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Subtle mouse repulsion
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.x -= (dx / dist) * 0.8;
          p.y -= (dy / dist) * 0.8;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist2 < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = '#6366f1';
            ctx.globalAlpha = (1 - dist2 / 110) * 0.15;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }


  // ==========================================================================
  // 4. 3D GYROSCOPIC & MOUSE TILT FOR HERO LOGO
  // ==========================================================================
  const logoContainer = document.getElementById('logo3dContainer');
  const logoCard = document.getElementById('logoCard');

  if (logoContainer && logoCard) {
    logoContainer.addEventListener('mousemove', (e) => {
      const rect = logoContainer.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotateY = (x / (rect.width / 2)) * 18;
      const rotateX = -(y / (rect.height / 2)) * 18;

      logoCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
    });

    logoContainer.addEventListener('mouseleave', () => {
      logoCard.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  }


  // ==========================================================================
  // 5. INTERACTIVE PIPELINE & CODE TERMINAL
  // ==========================================================================
  const pipelineStages = [
    {
      name: "IDEAS",
      title: "Blueprint Architecture & System Spec",
      snippet: "STAGE 01 // Blueprinting vision, user flow architecture, and rapid prototyping.",
      code: `<span class="text-purple-400">// 1. SYSTEM SPECIFICATION & FLOW BLUEPRINT</span>
<span class="text-cyan-400">export interface</span> <span class="text-amber-300">ProjectArchitecture</span> {
  clientVision: <span class="text-emerald-300">"Enterprise Grade Web & Software"</span>;
  deliveryRoadmap: <span class="text-sky-300">["Figma Wireframe", "API Contract", "Database Schema"]</span>;
  targetMetrics: {
    lighthouseScore: <span class="text-indigo-300">100</span>;
    concurrencyTarget: <span class="text-indigo-300">50000</span>; // req/sec
    uptimeGuarantee: <span class="text-indigo-300">99.99</span>;
  };
}

<span class="text-slate-500">/* Initializing architectural discovery node... */</span>
<span class="text-emerald-400">✓ Architecture Verified &amp; Signed</span>`
    },
    {
      name: "WEBSITES",
      title: "UI/UX & High-Performance Frontend Craft",
      snippet: "STAGE 02 // Engineering reactive interfaces, WebGL effects, and responsive design systems.",
      code: `<span class="text-purple-400">// 2. REACT 19 / NEXT.JS FRONTEND VIEWPORT</span>
<span class="text-cyan-400">import</span> { motion } <span class="text-cyan-400">from</span> <span class="text-emerald-300">'framer-motion'</span>;
<span class="text-cyan-400">import</span> { CanvasShader } <span class="text-cyan-400">from</span> <span class="text-emerald-300">'@rynex/webgl'</span>;

<span class="text-cyan-400">export default function</span> <span class="text-amber-300">RynexInterface</span>() {
  <span class="text-cyan-400">return</span> (
    &lt;<span class="text-sky-300">div</span> <span class="text-purple-300">className</span>=<span class="text-emerald-300">"cyber-portal backdrop-blur-2xl"</span>&gt;
      &lt;<span class="text-sky-300">CanvasShader</span> <span class="text-purple-300">fps</span>={<span class="text-indigo-300">60</span>} <span class="text-purple-300">particles</span>={<span class="text-indigo-300">true</span>} /&gt;
      &lt;<span class="text-sky-300">h1</span> <span class="text-purple-300">className</span>=<span class="text-emerald-300">"text-glow animate-pulse"</span>&gt;RYNEX DIGITAL&lt;/<span class="text-sky-300">h1</span>&gt;
    &lt;/<span class="text-sky-300">div</span>&gt;
  );
}
<span class="text-emerald-400">✓ Bundle Compiled: 42kb gzip (0.42s cold start)</span>`
    },
    {
      name: "SOFTWARE",
      title: "Backend Engines & Scalable Microservices",
      snippet: "STAGE 03 // Crafting secure APIs, database models, background queues, and auth.",
      code: `<span class="text-purple-400">// 3. HIGH-THROUGHPUT BACKEND & DATA ENGINE</span>
<span class="text-cyan-400">async function</span> <span class="text-amber-300">handleTransmission</span>(req: <span class="text-sky-300">SecureRequest</span>) {
  <span class="text-cyan-400">const</span> session = <span class="text-cyan-400">await</span> authGuard.<span class="text-amber-300">verifyJWT</span>(req.headers);
  <span class="text-cyan-400">const</span> cluster = <span class="text-cyan-400">await</span> databasePool.<span class="text-amber-300">connect</span>({ readReplicas: <span class="text-indigo-300">3</span> });

  <span class="text-cyan-400">const</span> response = <span class="text-cyan-400">await</span> cluster.<span class="text-amber-300">executeTransaction</span>({
    userId: session.id,
    payload: req.sanitizedPayload,
    encryption: <span class="text-emerald-300">'AES-256-GCM'</span>
  });

  <span class="text-cyan-400">return</span> Response.<span class="text-amber-300">json</span>({ status: <span class="text-indigo-300">200</span>, latency: <span class="text-emerald-300">'4.2ms'</span> });
}
<span class="text-emerald-400">✓ Microservices Synchronized &amp; Load-Balanced</span>`
    },
    {
      name: "REALITY",
      title: "Edge Deployment & Global Production",
      snippet: "STAGE 04 // Zero-downtime CI/CD deployment, global CDN, and live monitoring.",
      code: `<span class="text-purple-400">// 4. PRODUCTION DEPLOYMENT & EDGE TELEMETRY</span>
<span class="text-slate-400">[16:54:12]</span> <span class="text-cyan-400">INFO</span>: Deploying build to 285 Edge Data Centers...
<span class="text-slate-400">[16:54:13]</span> <span class="text-cyan-400">INFO</span>: SSL Handshake valid (Wildcard TLS 1.3)
<span class="text-slate-400">[16:54:14]</span> <span class="text-emerald-400">SUCCESS</span>: Production Cluster is LIVE!
<span class="text-slate-400">[16:54:14]</span> <span class="text-amber-300">METRICS</span>: Chennai Gateway Ping: <span class="text-cyan-400">12ms</span> | Error Rate: <span class="text-cyan-400">0.00%</span>

<span class="text-emerald-400">🚀 RYNEX APPLICATION IS DEPLOYED AND SERVING USERS</span>`
    }
  ];

  let currentStage = 0;
  const flowNodes = document.querySelectorAll('.flow-node');
  const pipelineTabs = document.querySelectorAll('.pipeline-tab');
  const terminalContent = document.getElementById('terminalContent');
  const pipelineSnippetText = document.getElementById('pipelineSnippetText');

  function setPipelineStage(index) {
    currentStage = index;
    const stageData = pipelineStages[index];

    // Update Hero Flow Bar Nodes
    flowNodes.forEach((node, idx) => {
      if (idx === index) {
        node.classList.add('active', 'text-cyan-300', 'bg-cyan-950/60', 'border-cyan-500/40', 'shadow-[0_0_12px_rgba(6,182,212,0.3)]');
        node.classList.remove('text-slate-400');
      } else {
        node.classList.remove('active', 'text-cyan-300', 'bg-cyan-950/60', 'border-cyan-500/40', 'shadow-[0_0_12px_rgba(6,182,212,0.3)]');
        node.classList.add('text-slate-400');
      }
    });

    // Update Pipeline Section Tabs
    pipelineTabs.forEach((tab, idx) => {
      if (idx === index) {
        tab.classList.add('active', 'border-cyan-500/40', 'bg-cyan-950/30');
        tab.classList.remove('border-white/10', 'bg-white/[0.02]');
      } else {
        tab.classList.remove('active', 'border-cyan-500/40', 'bg-cyan-950/30');
        tab.classList.add('border-white/10', 'bg-white/[0.02]');
      }
    });

    // Update Terminal Code
    if (terminalContent) {
      terminalContent.innerHTML = stageData.code;
    }

    // Update Snippet Text
    if (pipelineSnippetText) {
      pipelineSnippetText.textContent = stageData.snippet;
    }
  }

  // Initial render
  setPipelineStage(0);

  // Attach click listeners to flow nodes & pipeline tabs
  flowNodes.forEach(node => {
    node.addEventListener('click', () => {
      const step = parseInt(node.getAttribute('data-step') || '0', 10);
      setPipelineStage(step);
    });
  });

  pipelineTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const stage = parseInt(tab.getAttribute('data-stage') || '0', 10);
      setPipelineStage(stage);
    });
  });


  // ==========================================================================
  // 6. INSTANT PROJECT SCOPE & COST ESTIMATOR
  // ==========================================================================
  let selectedDomain = "Starter Modern Website";
  let basePrice = 3000;
  let timelineMultiplier = 1.0;
  let timelineText = "2-4 WEEKS (Standard Agile)";

  const typeButtons = document.querySelectorAll('.estimator-type-btn');
  const checkboxes = document.querySelectorAll('.estimator-checkbox');
  const timelineRange = document.getElementById('timelineRange');
  const timelineLabel = document.getElementById('timelineLabel');
  const estimatePrice = document.getElementById('estimatePrice');
  const estimateSummaryText = document.getElementById('estimateSummaryText');

  function calculateEstimate() {
    let addOnCost = 0;
    let selectedAddOns = [];

    checkboxes.forEach(cb => {
      const parentLabel = cb.closest('label');
      const visualBox = parentLabel?.querySelector('.check-box-visual');
      const icon = visualBox?.querySelector('i');

      if (cb.checked) {
        addOnCost += parseInt(cb.getAttribute('data-cost') || '0', 10);
        selectedAddOns.push(cb.value);
        if (visualBox) {
          visualBox.classList.add('border-cyan-500/50', 'text-cyan-400', 'bg-cyan-950/40');
          visualBox.classList.remove('border-white/20', 'text-transparent');
        }
      } else {
        if (visualBox) {
          visualBox.classList.remove('border-cyan-500/50', 'text-cyan-400', 'bg-cyan-950/40');
          visualBox.classList.add('border-white/20', 'text-transparent');
        }
      }
    });

    const totalBase = (basePrice + addOnCost) * timelineMultiplier;
    // Always round to clean 500 intervals
    let lower = Math.round(totalBase / 500) * 500;
    lower = Math.max(3000, Math.min(lower, 19999));
    
    let upper = Math.round((totalBase * 1.2) / 500) * 500;
    upper = Math.min(upper, 19999);

    if (upper <= lower && lower < 19999) {
      upper = Math.min(lower + 1000, 19999);
    }

    const priceDisplay = lower >= 19999 
      ? '₹19,999 (Max Cap)' 
      : (lower === upper ? `₹${lower.toLocaleString('en-IN')}` : `₹${lower.toLocaleString('en-IN')} - ₹${upper.toLocaleString('en-IN')}`);

    if (estimatePrice) {
      estimatePrice.textContent = priceDisplay;
    }

    if (estimateSummaryText) {
      estimateSummaryText.textContent = `${selectedDomain} + ${selectedAddOns.length} Add-on${selectedAddOns.length === 1 ? '' : 's'} (Clean Rounded: ₹3,000 - ₹19,999 Max)`;
    }

    return {
      domain: selectedDomain,
      addOns: selectedAddOns,
      timeline: timelineText,
      priceRange: priceDisplay
    };
  }

  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      typeButtons.forEach(b => {
        b.classList.remove('active', 'border-cyan-500/50', 'bg-cyan-950/40');
        b.classList.add('border-white/10', 'bg-white/[0.02]');
      });
      btn.classList.add('active', 'border-cyan-500/50', 'bg-cyan-950/40');
      btn.classList.remove('border-white/10', 'bg-white/[0.02]');

      selectedDomain = btn.getAttribute('data-type') || "Starter Modern Website";
      basePrice = parseInt(btn.getAttribute('data-base') || '3000', 10);
      calculateEstimate();
    });
  });

  checkboxes.forEach(cb => {
    cb.addEventListener('change', calculateEstimate);
  });

  if (timelineRange) {
    timelineRange.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (val === 1) {
        timelineMultiplier = 1.25;
        timelineText = "1-2 WEEKS (Hyper Sprint)";
      } else if (val === 2) {
        timelineMultiplier = 1.0;
        timelineText = "2-4 WEEKS (Standard Agile)";
      } else {
        timelineMultiplier = 0.95;
        timelineText = "4-8 WEEKS (Enterprise Roadmap)";
      }
      if (timelineLabel) {
        timelineLabel.textContent = timelineText.toUpperCase();
      }
      calculateEstimate();
    });
  }

  calculateEstimate();

  // WhatsApp Estimate Dispatcher
  const dispatchWhatsappBtn = document.getElementById('dispatchWhatsappEstimate');
  if (dispatchWhatsappBtn) {
    dispatchWhatsappBtn.addEventListener('click', () => {
      const est = calculateEstimate();
      const text = `*⚡ RYNEX PROJECT INQUIRY*%0A%0A*Project Domain:* ${est.domain}%0A*Add-ons:* ${est.addOns.join(', ') || 'Core Features'}%0A*Timeline:* ${est.timeline}%0A*Estimated Scope:* ${est.priceRange}%0A%0A_Hello Rynex Team, I would like to build this project!_`;
      window.open(`https://wa.me/919489447111?text=${text}`, '_blank');
      showToast('Redirecting to WhatsApp with your project brief!');
    });
  }

  // Email Estimate Dispatcher
  const dispatchEmailBtn = document.getElementById('dispatchEmailEstimate');
  if (dispatchEmailBtn) {
    dispatchEmailBtn.addEventListener('click', () => {
      const est = calculateEstimate();
      const subject = encodeURIComponent(`Project Inquiry: ${est.domain} (Rynex Estimate)`);
      const body = encodeURIComponent(`Hello Rynex Team,\n\nI configured the following project estimate on your website:\n\n- Project Domain: ${est.domain}\n- Add-ons: ${est.addOns.join(', ') || 'Core'}\n- Timeline: ${est.timeline}\n- Estimated Scope: ${est.priceRange}\n\nPlease get in touch with me regarding next steps.\n\nThank you!`);
      window.location.href = `mailto:rynexfreelancing@gmail.com?subject=${subject}&body=${body}`;
      showToast('Opening email composer with pre-filled scope!');
    });
  }


  // ==========================================================================
  // 7. CHENNAI BASE LIVE TELEMETRY & CLOCK
  // ==========================================================================
  function updateChennaiClock() {
    const now = new Date();
    // Chennai is UTC+5:30
    const istOptions = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const istTime = new Intl.DateTimeFormat('en-GB', istOptions).format(now);

    const baseClock = document.getElementById('baseLiveClock');
    const posterTime = document.getElementById('chennaiTime');

    if (baseClock) baseClock.textContent = `${istTime} IST`;
    if (posterTime) posterTime.textContent = `IST ${istTime.substring(0, 5)}`;
  }
  updateChennaiClock();
  setInterval(updateChennaiClock, 1000);


  // ==========================================================================
  // 8. CLIPBOARD COPY HUD & TOAST SYSTEM
  // ==========================================================================
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimer;

  function showToast(msg) {
    if (!toast) return;
    if (toastMessage) toastMessage.textContent = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    audio.playSuccess();

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add('translate-y-20', 'opacity-0');
      toast.classList.remove('translate-y-0', 'opacity-100');
    }, 3200);
  }

  const phoneHud = document.getElementById('phoneHud');
  if (phoneHud) {
    phoneHud.addEventListener('click', () => {
      navigator.clipboard.writeText('9489447111');
      showToast('Phone Number 9489447111 copied to clipboard!');
    });
  }

  const emailHud = document.getElementById('emailHud');
  if (emailHud) {
    emailHud.addEventListener('click', () => {
      navigator.clipboard.writeText('rynexfreelancing@gmail.com');
      showToast('Email rynexfreelancing@gmail.com copied to clipboard!');
    });
  }


  // ==========================================================================
  // 9. CONTACT FORM SUBMISSION HANDLER
  // ==========================================================================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('formName')?.value || 'Client';
      const contact = document.getElementById('formContact')?.value || '';
      const service = document.getElementById('formService')?.value || '';
      const msg = document.getElementById('formMessage')?.value || '';

      const text = `*New Transmission from Rynex Portal*%0A%0A*Name:* ${encodeURIComponent(name)}%0A*Contact:* ${encodeURIComponent(contact)}%0A*Service:* ${encodeURIComponent(service)}%0A*Message:* ${encodeURIComponent(msg)}`;
      
      showToast('Transmission encrypted! Opening direct link to Rynex.');
      setTimeout(() => {
        window.open(`https://wa.me/919489447111?text=${text}`, '_blank');
      }, 700);

      contactForm.reset();
    });
  }


  // ==========================================================================
  // 10. MOBILE MENU & BACK TO TOP
  // ==========================================================================
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
    const links = mobileMenu.querySelectorAll('a');
    links.forEach(l => l.addEventListener('click', () => mobileMenu.classList.add('hidden')));
  }

  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});
