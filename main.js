// --- SMOOTH SCROLL (LENIS) ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// --- CUSTOM CURSOR LOGIC ---
const cursor = document.querySelector('.custom-cursor');
if (cursor) {
    window.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX - 10,
            y: e.clientY - 10,
            duration: 0.1,
            ease: "power2.out"
        });
    });
}

// --- SCROLL EFFECTS (PROGRESS & NAV) ---
const progressBar = document.querySelector('.scroll-progress-bar');
const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
    // Scroll Progress
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    if (progressBar) progressBar.style.width = scrolled + "%";

    // Sticky Nav Class
    if (nav) {
        if (window.scrollY > 50) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }
    }
});

// --- THREE.JS UTILS ---
const createDiamond = (size) => {
    const geometry = new THREE.IcosahedronGeometry(size, 0);
    const material = new THREE.MeshStandardMaterial({
        color: 0xD4AF37,
        metalness: 1,
        roughness: 0.1,
        flatShading: true
    });
    const mesh = new THREE.Mesh(geometry, material);
    
    // Subtle wireframe overlay
    const wireframe = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.1 })
    );
    mesh.add(wireframe);
    
    return mesh;
};

// --- CINEMATIC INTRO (PRELOADER) ---
const initIntro = () => {
    const canvas = document.querySelector('#intro-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 2.5;

    const diamond = createDiamond(1.2);
    scene.add(diamond);

    const light = new THREE.PointLight(0xffffff, 2);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const animate = () => {
        if (renderer) {
            requestAnimationFrame(animate);
            diamond.rotation.y += 0.01;
            renderer.render(scene, camera);
        }
    };
    animate();

    // GSAP Intro Timeline
    const tl = gsap.timeline({
        onComplete: () => {
            document.querySelector('#preloader').style.display = 'none';
            renderer.dispose();
        }
    });

    tl.to('.intro-welcome', { opacity: 1, y: 0, duration: 1, ease: "power4.out", delay: 0.5 })
      .to('.intro-sub', { opacity: 1, duration: 1 }, "-=0.5")
      .to(camera.position, { z: 10, duration: 2.5, ease: "power2.inOut" }, "+=0.5")
      .to('#preloader', { opacity: 0, duration: 1.5, ease: "power2.inOut" }, "-=1")
      .from('.hero-content h1', { y: 100, opacity: 0, duration: 1.5, ease: "power4.out" }, "-=0.5")
      .from('.hero-content p', { opacity: 0, duration: 1 }, "-=1");
};

initIntro();

// --- GOLDEN STARDUST PARTICLES ---
const initParticles = () => {
    const canvas = document.querySelector('#hero-particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: 0, y: 0 };

    const resize = () => {
        const hero = document.querySelector('.hero');
        canvas.width = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random() * 0.5 + 0.2;
        }

        update() {
            this.x += this.speedX + (mouse.x - canvas.width / 2) * 0.005;
            this.y += this.speedY + (mouse.y - canvas.height / 2) * 0.005;

            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }

        draw() {
            ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const init = () => {
        particles = [];
        for (let i = 0; i < 150; i++) {
            particles.push(new Particle());
        }
    };

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    init();
    animate();
};

initParticles();

// --- GSAP ANIMATIONS ---
gsap.registerPlugin(ScrollTrigger);

// Hero Text Reveal
if (document.querySelector('.reveal-text')) {
    gsap.from('.reveal-text', {
        y: 80,
        opacity: 0,
        duration: 1.5,
        stagger: 0.3,
        ease: "power4.out"
    });
}

// Reveal Items on Scroll
const revealItems = document.querySelectorAll('.reveal-item');
revealItems.forEach(item => {
    gsap.from(item, {
        scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none none"
        },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });
});

// --- WHATSAPP LOGIC ---
const buyNow = (productName) => {
    const phoneNumber = "919876543210"; // Updated to Indian Format
    const message = encodeURIComponent(`Hi, I am interested in purchasing "${productName}" from LuxJewel. Please provide more details.`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
};

// --- LOGO PARALLAX ---
if (document.querySelector('.hero-content')) {
    gsap.to('.hero-content', {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        },
        y: 100,
        opacity: 0
    });
}
