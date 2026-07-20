/* ============================================================
   NOVACART - Premium JavaScript
   Features: Three.js 3D Background, Particle System,
   Count-Up Animation, Navbar Scroll Effects, AOS Init,
   Smooth Interactions
   ============================================================ */

// ==================== THREE.JS 3D BACKGROUND ====================
(function initThreeBackground() {
    const canvas = document.getElementById('three-bg');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ---- Create a nebula-like particle cloud ----
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;

    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    const colorPalette = [
        new THREE.Color('#6c5ce7'), // purple
        new THREE.Color('#a855f7'), // violet
        new THREE.Color('#ec4899'), // pink
        new THREE.Color('#8b5cf6'), // lighter purple
        new THREE.Color('#6366f1'), // indigo
    ];

    for (let i = 0; i < particlesCount; i++) {
        // Spherical distribution for cloud effect
        const radius = 15 + Math.random() * 30;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Circle texture
    const canvas2 = document.createElement('canvas');
    canvas2.width = 32;
    canvas2.height = 32;
    const ctx = canvas2.getContext('2d');
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 14);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    const particleTexture = new THREE.CanvasTexture(canvas2);

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.3,
        map: particleTexture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // ---- Geometric rings ----
    function createRing(radius, tubeRadius, color, opacity) {
        const geometry = new THREE.TorusGeometry(radius, tubeRadius, 16, 100);
        const material = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity,
            wireframe: true,
        });
        return new THREE.Mesh(geometry, material);
    }

    const ring1 = createRing(8, 0.05, '#6c5ce7', 0.2);
    const ring2 = createRing(12, 0.03, '#a855f7', 0.15);
    const ring3 = createRing(16, 0.04, '#ec4899', 0.1);

    ring1.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 4;
    ring3.rotation.x = -Math.PI / 4;
    ring3.rotation.z = Math.PI / 6;

    scene.add(ring1);
    scene.add(ring2);
    scene.add(ring3);

    // ---- Floating geometric shapes ----
    function createFloatingGeometry(type, size, color, position) {
        let geometry;
        switch (type) {
            case 'dodecahedron':
                geometry = new THREE.DodecahedronGeometry(size, 0);
                break;
            case 'icosahedron':
                geometry = new THREE.IcosahedronGeometry(size, 0);
                break;
            case 'octahedron':
                geometry = new THREE.OctahedronGeometry(size, 0);
                break;
            default:
                geometry = new THREE.IcosahedronGeometry(size, 0);
        }

        const material = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.15,
            wireframe: true,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position.x, position.y, position.z);
        return mesh;
    }

    const floatingGeos = [
        createFloatingGeometry('dodecahedron', 1.2, '#6c5ce7', { x: 5, y: 3, z: -5 }),
        createFloatingGeometry('icosahedron', 0.8, '#a855f7', { x: -7, y: -2, z: -3 }),
        createFloatingGeometry('octahedron', 1.0, '#ec4899', { x: -3, y: 5, z: -8 }),
        createFloatingGeometry('dodecahedron', 0.6, '#6366f1', { x: 8, y: -4, z: -6 }),
        createFloatingGeometry('icosahedron', 1.1, '#8b5cf6', { x: -6, y: 1, z: -10 }),
    ];

    floatingGeos.forEach(geo => scene.add(geo));

    // ---- Mouse interaction ----
    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    document.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // ---- Animation loop ----
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsed = clock.getElapsedTime();

        // Smooth mouse follow
        target.x += (mouse.x - target.x) * 0.02;
        target.y += (mouse.y - target.y) * 0.02;

        // Rotate particle cloud slowly
        particlesMesh.rotation.x += 0.0003;
        particlesMesh.rotation.y += 0.0005;

        // Rotate rings
        ring1.rotation.z += 0.001;
        ring1.rotation.y += 0.0005;
        ring2.rotation.x += 0.0008;
        ring2.rotation.z += 0.0006;
        ring3.rotation.y += 0.0007;
        ring3.rotation.x += 0.0004;

        // Animate floating geometries
        floatingGeos.forEach((geo, i) => {
            geo.rotation.x += 0.003 + i * 0.001;
            geo.rotation.y += 0.005 + i * 0.001;
            geo.position.y += Math.sin(elapsed * (0.5 + i * 0.2)) * 0.005;
        });

        // Move camera slightly with mouse
        camera.position.x += (target.x * 3 - camera.position.x) * 0.02;
        camera.position.y += (target.y * 3 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    animate();

    // ---- Resize handler ----
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();

// ==================== FLOATING PARTICLES DOM ====================
(function createFloatingParticles() {
    const container = document.getElementById('floatingParticles');
    if (!container) return;

    const particleCount = 50;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        const size = Math.random() * 4 + 2;
        const left = Math.random() * 100;
        const delay = Math.random() * 15;
        const duration = Math.random() * 10 + 8;
        const colors = ['#6c5ce7', '#a855f7', '#ec4899', '#6366f1'];

        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = left + '%';
        particle.style.bottom = '-10px';
        particle.style.animationDuration = duration + 's';
        particle.style.animationDelay = delay + 's';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.boxShadow = `0 0 ${size * 3}px ${colors[Math.floor(Math.random() * colors.length)]}`;

        fragment.appendChild(particle);
    }

    container.appendChild(fragment);
})();

// ==================== NAVBAR SCROLL EFFECT ====================
(function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
})();

// ==================== ACTIVE NAV LINK ON SCROLL ====================
(function initActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
})();

// ==================== MOBILE MENU TOGGLE ====================
(function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    if (!btn || !navLinks) return;

    btn.addEventListener('click', () => {
        navLinks.classList.toggle('active-mobile');
        btn.classList.toggle('open');
    });
})();

// ==================== COUNT-UP ANIMATION ====================
(function initCountUp() {
    const countElements = document.querySelectorAll('.count-up');

    function animateCount(el) {
        const target = parseInt(el.getAttribute('data-target'));
        const duration = 2000; // ms
        const step = target / (duration / 16);
        let current = 0;

        const update = () => {
            current += step;
            if (current < target) {
                el.textContent = Math.floor(current);
                requestAnimationFrame(update);
            } else {
                el.textContent = target;
            }
        };

        requestAnimationFrame(update);
    }

    // Use IntersectionObserver to trigger count-up when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    countElements.forEach(el => observer.observe(el));
})();

// ==================== HERO STAT NUMBER ANIMATION ====================
(function initHeroStats() {
    const statNumbers = document.querySelectorAll('.hero-stat .stat-number');

    function animateStat(el) {
        const target = parseInt(el.getAttribute('data-count'));
        const duration = 1800;
        const step = target / (duration / 16);
        let current = 0;

        const update = () => {
            current += step;
            if (current < target) {
                el.textContent = Math.floor(current);
                requestAnimationFrame(update);
            } else {
                el.textContent = target;
            }
        };

        requestAnimationFrame(update);
    }

    // Animate on load with a slight delay
    setTimeout(() => {
        statNumbers.forEach(el => animateStat(el));
    }, 500);
})();

// ==================== PARALLAX EFFECT ON SCROLL ====================
(function initParallax() {
    const floatingCards = document.querySelectorAll('.floating-card');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        floatingCards.forEach((card, index) => {
            const speed = 0.05 + index * 0.02;
            const yOffset = scrollY * speed;
            // Only apply if in view
            card.style.transform = `translateY(${yOffset}px)`;
        });
    });
})();

// ==================== SMOOTH ANCHOR SCROLLING ====================
(function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        });
    });
})();

// ==================== WISHLIST TOGGLE ANIMATION ====================
(function initWishlist() {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const icon = this.querySelector('i');

            // Toggle animation
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.style.color = '#ec4899';

                // Heart burst animation
                this.style.transform = 'scale(1.3)';
                setTimeout(() => { this.style.transform = 'scale(1)'; }, 200);
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                icon.style.color = '';
            }
        });
    });
})();

// ==================== PRODUCT CARD TILT ON HOVER ====================
(function initProductTilt() {
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
})();

// ==================== BUTTON RIPPLE EFFECT ====================
(function initRippleEffect() {
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255,255,255,0.3)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'rippleOut 0.6s ease-out forwards';
            ripple.style.pointerEvents = 'none';
            ripple.style.zIndex = '10';

            this.appendChild(ripple);

            ripple.addEventListener('animationend', () => {
                ripple.remove();
            });
        });
    });
})();

// Add ripple keyframes
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes rippleOut {
        to { transform: scale(4); opacity: 0; }
    }
    .nav-links.active-mobile {
        display: flex !important;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(10, 10, 15, 0.95);
        backdrop-filter: blur(20px);
        padding: 2rem;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        gap: 1rem;
        z-index: 999;
    }
    .mobile-menu-btn.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
    .mobile-menu-btn.open span:nth-child(2) { opacity: 0; }
    .mobile-menu-btn.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }
`;
document.head.appendChild(rippleStyle);

// ==================== INITIALIZE AOS ====================
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 50,
        delay: 100,
        disable: 'mobile', // Disable on mobile for performance
    });
});

// ==================== CURSOR GLOW TRAIL ====================
(function initCursorGlow() {
    const cursorGlow = document.createElement('div');
    cursorGlow.style.cssText = `
        position: fixed;
        width: 300px;
        height: 300px;
        border-radius: 50%;
        pointer-events: none;
        z-index: 0;
        background: radial-gradient(circle, rgba(108, 92, 231, 0.08) 0%, transparent 70%);
        transform: translate(-50%, -50%);
        transition: all 0.3s ease-out;
    `;
    document.body.appendChild(cursorGlow);

    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursorGlow() {
        currentX += (mouseX - currentX) * 0.05;
        currentY += (mouseY - currentY) * 0.05;
        cursorGlow.style.left = currentX + 'px';
        cursorGlow.style.top = currentY + 'px';
        requestAnimationFrame(animateCursorGlow);
    }

    animateCursorGlow();
})();

// ==================== FEATURE CARD GLOW ON MOUSE PROXIMITY ====================
(function initFeatureCardGlow() {
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const glowEl = card.querySelector('.feature-icon-glow');
            if (glowEl) {
                glowEl.style.left = x + 'px';
                glowEl.style.top = y + 'px';
            }
        });
    });
})();

console.log('%c🚀 NovaCart %cInitialized %c✨',
    'font-size: 1.5rem; font-weight: bold; color: #a855f7;',
    'font-size: 1rem; color: #b0b0c0;',
    'font-size: 1.2rem;');
console.log('%c3D Background %c✓ | %cParticles %c✓ | %cAOS %c✓ | %cCounters %c✓ | %cParallax %c✓',
    'color: #6c5ce7;', 'color: #10b981;',
    'color: #6c5ce7;', 'color: #10b981;',
    'color: #6c5ce7;', 'color: #10b981;',
    'color: #6c5ce7;', 'color: #10b981;',
    'color: #6c5ce7;', 'color: #10b981;');