/**
 * FORO DE INFRAESTRUCTURA 2026 - MAIN JAVASCRIPT
 * Handles countdown, tabs, registration simulation, speaker/pillar modals,
 * calendar events, and FAQ accordions.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initNavigation();
  initParallax();
  initRegistrationTabs();
  initEventbriteWidget();
  initRegistrationForm();
  initAgendaTabs();
  initFaqAccordion();
  initModals();
  initCalendarGenerator();
});

/* ==========================================================================
   1. COUNTDOWN TIMER (Event: Nov 5, 2026 08:30:00 GMT-6)
   ========================================================================== */
function initCountdown() {
  const eventDate = new Date('2026-11-05T08:30:00-06:00').getTime();

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  if (!daysEl) return;

  function update() {
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   2. NAVIGATION & MOBILE MENU
   ========================================================================== */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const links = document.querySelectorAll('.nav-link');

  // Sticky navbar shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // Scroll spy for active link
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const activeLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        links.forEach(l => l.classList.remove('active'));
        activeLink?.classList.add('active');
      }
    });
  });

  // Mobile menu toggle
  toggleBtn?.addEventListener('click', () => {
    navLinks?.classList.toggle('open');
    const isOpen = navLinks?.classList.contains('open');
    toggleBtn.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  });

  // Close mobile menu on clicking any link
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks?.classList.remove('open');
      if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });
}

/* ==========================================================================
   3. REGISTRATION TABS (DIRECT FORM vs EVENTBRITE)
   ========================================================================== */
function initRegistrationTabs() {
  const tabBtns = document.querySelectorAll('.reg-tab-btn');
  const panels = document.querySelectorAll('.reg-tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.style.display = 'none');

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.style.display = 'block';
      }
    });
  });
}

/* ==========================================================================
   3B. EVENTBRITE OFFICIAL CHECKOUT WIDGET INITIALIZATION
   ========================================================================== */
function initEventbriteWidget() {
  const containerId = 'eventbrite-widget-container-2003552143395';
  const container = document.getElementById(containerId);
  if (!container) return;

  // Auto-resize iframe when Eventbrite communicates step height via postMessage
  window.addEventListener('message', (event) => {
    if (event.origin && (event.origin.includes('eventbrite.com') || event.origin.includes('eventbrite.com.mx'))) {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.height) {
          const iframe = container.querySelector('iframe');
          const calculatedHeight = Math.max(680, data.height + 25);
          if (iframe) {
            iframe.style.height = calculatedHeight + 'px';
          }
          container.style.height = calculatedHeight + 'px';
        }
      } catch (e) {
        // Ignore non-json messages
      }
    }
  });
}

/* ==========================================================================
   4. REGISTRATION FORM & DIGITAL PASS SIMULATOR
   ========================================================================== */
function initRegistrationForm() {
  const form = document.getElementById('forum-register-form');
  const modal = document.getElementById('ticket-modal');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = document.getElementById('reg-fullname').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const org = document.getElementById('reg-org').value.trim();
    const role = document.getElementById('reg-role').value.trim();
    const sector = document.getElementById('reg-sector').value;

    if (!fullName || !email || !org) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }

    // Generate unique badge reference
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const passCode = `FORO26-VDS-${randomDigits}`;

    // Fill Pass Modal
    document.getElementById('ticket-code-val').textContent = passCode;
    document.getElementById('ticket-name-val').textContent = fullName;
    document.getElementById('ticket-org-val').textContent = `${role || 'Asistente'} | ${org}`;
    document.getElementById('ticket-sector-val').textContent = sector;

    // Draw QR canvas pattern
    drawMockQR('ticket-qr-canvas', passCode);

    // Open Modal
    modal?.classList.add('active');
  });

  // Print pass button
  document.getElementById('btn-print-ticket')?.addEventListener('click', () => {
    window.print();
  });
}

/**
 * Draws a clean procedural QR-like matrix code on canvas
 */
function drawMockQR(canvasId, text) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  ctx.clearRect(0, 0, size, size);

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // QR grid parameters
  const cells = 21;
  const cellSize = size / cells;

  // Pattern seeded by text length
  ctx.fillStyle = '#0b2545';

  // Corner markers (standard QR look)
  function drawCorner(x, y) {
    ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
    ctx.fillStyle = '#0b2545';
    ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
  }

  drawCorner(0, 0);
  drawCorner(14, 0);
  drawCorner(0, 14);

  // Mock pseudo-random bits for the rest
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
  }

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      // Skip corners
      if ((r < 8 && c < 8) || (r < 8 && c > 13) || (r > 13 && c < 8)) continue;
      const bit = Math.sin(r * 11 + c * 17 + hash) > 0.15;
      if (bit) {
        ctx.fillRect(c * cellSize, r * cellSize, cellSize - 0.5, cellSize - 0.5);
      }
    }
  }
}

/* ==========================================================================
   5. AGENDA TABS
   ========================================================================== */
function initAgendaTabs() {
  const agendaBtns = document.querySelectorAll('.agenda-tab-btn');
  const timelineItems = document.querySelectorAll('.timeline-item');

  agendaBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      agendaBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      timelineItems.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-block') === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   6. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    const answer = item.querySelector('.faq-answer');

    btn?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all others
      faqItems.forEach(other => {
        other.classList.remove('open');
        const otherAns = other.querySelector('.faq-answer');
        if (otherAns) otherAns.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('open');
        if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ==========================================================================
   7. MODALS (SPEAKERS, PILLARS, TICKET)
   ========================================================================== */
const speakerData = {
  speaker1: {
    name: 'Ing. Carlos Ramos',
    title: 'Presidente - Cámara Hondureña de la Industria de la Construcción (CHICO)',
    bio: 'Líder gremial y empresario con más de 25 años de trayectoria en el sector construcción en Honduras. Ha encabezado mesas técnicas público-privadas para la modernización de la infraestructura nacional, impulsando marcos normativos de contratación ágil y planes maestros de inversión en el Valle de Sula.',
    topic: 'Conferencia Inaugural: Hoja de Ruta de Inversión y Competitividad 2026-2035'
  },
  speaker2: {
    name: 'Dra. Sofía Mendoza',
    title: 'Especialista en Obras Hidráulicas y Gestión de Cuencas',
    bio: 'Doctora en Ingeniería Hidráulica con experiencia en diseño de presas de contención y sistemas de regulación en cuencas de alto riesgo hidrológico en Centroamérica. Asesora técnica en los estudios de factibilidad y mitigación de las represas El Tablón, Los Llanitos y Jicatuyo.',
    topic: 'Panel: Presas Estratégicas y Control de Inundaciones en los Ríos Chamelecón y Ulúa'
  },
  speaker3: {
    name: 'Ing. Roberto Valladares',
    title: 'Director de Infraestructura y Logística Portuaria (ENP)',
    bio: 'Experto en corredores logísticos multimodales y modernización portuaria. Ha liderado la planificación del libramiento de Puerto Cortés, el tercer carril del bulevar de acceso y la integración con el Corredor Turístico y el CA-13.',
    topic: 'Panel: Fortalecimiento de la Red Logística CA-13 y Acceso a Puerto Cortés'
  },
  speaker4: {
    name: 'Inga. Elena Flores',
    title: 'Directora de Gestión Ambiental y Saneamiento Hídrico',
    bio: 'Especialista en saneamiento ambiental y plantas de tratamiento de aguas residuales (PTAR). Consultora para organismos multilaterales en proyectos de descontaminación de cuencas fluviales urbanas e infraestructura verde para San Pedro Sula.',
    topic: 'Conferencia: Plantas PTAR y Recuperación de Afluentes del Valle de Sula'
  }
};

const pillarData = {
  p1: {
    title: 'Infraestructura Vial y Logística',
    desc: 'El fortalecimiento de la red vial constituye un elemento esencial para mejorar la movilidad de personas y mercancías, reducir costos logísticos y favorecer la competitividad de la zona norte del país.',
    projects: [
      'Construcción del tercer carril de la carretera CA-13 entre San Pedro Sula y Puerto Cortés.',
      'Corredor Turístico: La Barca – Santa Rita – El Progreso – Tela.',
      'Libramiento Omonita – Quebrada Seca y carretera Corinto – Azacualpa.',
      'Construcción de pasos a desnivel en sectores estratégicos de López Arellano y Choloma.',
      'Proyectos de la ENP: Libramiento Vial de Puerto Cortés, rehabilitación del Puente Curvo, tercer carril en el bulevar de acceso, paso diferenciado a la terminal a granel y Libramiento CA-13 Concordia–Travesía–Puerto Cortés.'
    ]
  },
  p2: {
    title: 'Protección y Control de Inundaciones',
    desc: 'Obras hidráulicas prioritarias para proteger la vida, los centros productivos que generan más del 60% del PIB y aumentar la resiliencia climática del Valle de Sula.',
    projects: [
      'Construcción de la Represa El Tablón para regulación del río Chamelecón.',
      'Proyectos de represas Los Llanitos, Jicatuyo y El Tornillito en la cuenca del río Ulúa.',
      'Dragado continuo y limpieza integral de los cauces de los ríos Chamelecón y Ulúa.',
      'Reforzamiento, mantenimiento técnico y construcción de bordos de protección.',
      'Aprovechamiento multipropósito: generación de energía limpia, almacenamiento y sistemas de riego agrícola.'
    ]
  },
  p3: {
    title: 'Tratamiento y Saneamiento Hídrico',
    desc: 'Infraestructura ambiental que garantiza la salud pública de los más de 2.5 millones de habitantes del Valle de Sula y protege los recursos naturales del país.',
    projects: [
      'Construcción e instalación de macroplantas de tratamiento de aguas residuales (PTAR) en San Pedro Sula.',
      'Saneamiento de la red de alcantarillado sanitario y colectores principales.',
      'Recuperación ecológica y limpieza de los ríos Chamelecón, Ulúa, Bermejo y Blanco.',
      'Mitigación del impacto industrial mediante normativas de vertidos y monitoreo hídrico continuo.'
    ]
  },
  p4: {
    title: 'Visión Regional, Alianzas y Competitividad',
    desc: 'Articulación integral entre el Gobierno Central, Alcaldías municipales del Valle de Sula, CHICO, empresa privada y banca multilateral.',
    projects: [
      'Constitución de una mesa técnica permanente de seguimiento y priorización de obras.',
      'Modelos de Alianzas Público-Privadas (APP) con esquemas financieros transparentes.',
      'Protección de la plataforma que concentra el 27% de la población y más del 60% del PIB hondureño.',
      'Generación proyectada de más de 85,000 empleos directos e indirectos en la cadena de construcción y logística.'
    ]
  }
};

function initModals() {
  const genericModal = document.getElementById('generic-modal');
  const ticketModal = document.getElementById('ticket-modal');
  const closeBtns = document.querySelectorAll('.modal-close-btn');

  // Close modals
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      genericModal?.classList.remove('active');
      ticketModal?.classList.remove('active');
    });
  });

  // Close on backdrop click
  window.addEventListener('click', (e) => {
    if (e.target === genericModal) genericModal.classList.remove('active');
    if (e.target === ticketModal) ticketModal.classList.remove('active');
  });

  // Speaker Modal triggers
  const speakerCards = document.querySelectorAll('.speaker-card');
  speakerCards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-speaker-id');
      const data = speakerData[id];
      if (!data) return;

      document.getElementById('generic-modal-title').textContent = data.name;
      document.getElementById('generic-modal-content').innerHTML = `
        <div style="margin-bottom: 12px; color: var(--color-accent-green); font-weight: 700; font-size: 0.95rem;">
          ${data.title}
        </div>
        <p style="margin-bottom: 18px; color: var(--color-text-main); font-size: 0.95rem; line-height: 1.6;">
          ${data.bio}
        </p>
        <div style="background: #f1f5f9; padding: 14px 18px; border-radius: 8px; border-left: 4px solid var(--color-primary);">
          <strong style="color: var(--color-primary-dark); display: block; font-size: 0.85rem; text-transform: uppercase;">Participación en el Foro:</strong>
          <span style="font-size: 0.92rem; color: #334155;">${data.topic}</span>
        </div>
      `;

      genericModal?.classList.add('active');
    });
  });

  // Pillar Modal triggers
  const pillarBtns = document.querySelectorAll('.btn-pillar-detail');
  pillarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-pillar-id');
      const data = pillarData[id];
      if (!data) return;

      document.getElementById('generic-modal-title').textContent = data.title;
      let projectsHtml = data.projects.map(p => `
        <li style="display:flex; align-items:flex-start; gap:10px; margin-bottom:10px; font-size:0.92rem;">
          <i class="fas fa-check-circle" style="color:var(--color-accent-green); margin-top:4px;"></i>
          <span>${p}</span>
        </li>
      `).join('');

      document.getElementById('generic-modal-content').innerHTML = `
        <p style="margin-bottom: 20px; color: var(--color-text-muted); font-size: 0.98rem; line-height: 1.6;">
          ${data.desc}
        </p>
        <h4 style="font-size: 1.05rem; margin-bottom: 14px; color: var(--color-primary-dark);">Proyectos Estratégicos Considerados:</h4>
        <ul style="list-style: none; margin-bottom: 20px;">
          ${projectsHtml}
        </ul>
        <div style="text-align: right; margin-top: 20px;">
          ${
            (() => {
              const regSec = document.getElementById('registro');
              const isRegVisible = regSec && regSec.style.display !== 'none' && !regSec.classList.contains('section-hidden');
              return isRegVisible
                ? `<a href="#registro" class="btn-submit-reg" onclick="document.getElementById('generic-modal').classList.remove('active')" style="display:inline-flex; padding: 10px 24px; font-size:0.9rem;">
                    Registrarme para asistir a esta mesa
                  </a>`
                : `<button type="button" class="btn-submit-reg" onclick="document.getElementById('generic-modal').classList.remove('active')" style="display:inline-flex; padding: 10px 24px; font-size:0.9rem; cursor:pointer;">
                    <i class="fas fa-check" style="margin-right:8px;"></i> Entendido
                  </button>`;
            })()
          }
        </div>
      `;

      genericModal?.classList.add('active');
    });
  });
}

/* ==========================================================================
   8. ADD TO CALENDAR GENERATOR
   ========================================================================== */
function initCalendarGenerator() {
  const btnGoogle = document.getElementById('btn-add-google-cal');
  const btnIcs = document.getElementById('btn-add-ics-cal');

  const title = encodeURIComponent('Foro de Infraestructura 2026: Proyectos que Transformarán a Honduras');
  const details = encodeURIComponent('Foro de Infraestructura - Prioridades para el Desarrollo del Valle de Sula. Organizado por CHICO y Cementos del Norte S.A.');
  const location = encodeURIComponent('Centro de Convenciones del Hotel Copantl, San Pedro Sula, Honduras');
  const dates = '20261105T143000Z/20261105T233000Z'; // 08:30 to 17:30 UTC-6 is 14:30 to 23:30 UTC

  if (btnGoogle) {
    btnGoogle.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
    btnGoogle.target = '_blank';
  }

  btnIcs?.addEventListener('click', (e) => {
    e.preventDefault();
    const icsContent = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CHICO//Foro de Infraestructura 2026//ES
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:Foro de Infraestructura 2026: Proyectos que Transformarán a Honduras
DESCRIPTION:Prioridades para el desarrollo del Valle de Sula. Infraestructura vial, obras hidráulicas de control de inundaciones y plantas PTAR.
LOCATION:Centro de Convenciones Hotel Copantl, San Pedro Sula, Honduras
DTSTART:20261105T143000Z
DTEND:20261105T233000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'Foro_Infraestructura_2026.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

/* ==========================================================================
   9. PARALLAX FLOATING EFFECT
   ========================================================================== */
function initParallax() {
  const heroBg = document.querySelector('.hero-bg-container');
  const heroContent = document.querySelector('.hero-content');
  const heroSection = document.querySelector('.hero-section');
  if (!heroBg || !heroContent || !heroSection) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        const heroHeight = heroSection.offsetHeight;

        if (scrolled <= heroHeight) {
          // La imagen de fondo se desplaza más lentamente creando profundidad
          heroBg.style.transform = `translate3d(0, ${scrolled * 0.38}px, 0)`;

          // Los elementos del Hero suben con sensación de flotación y desvanecimiento progresivo
          const opacity = Math.max(0, 1 - (scrolled / (heroHeight * 0.88)));
          const translateY = scrolled * -0.16;
          heroContent.style.transform = `translate3d(0, ${translateY}px, 0)`;
          heroContent.style.opacity = opacity;
        } else {
          heroContent.style.opacity = 0;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}
