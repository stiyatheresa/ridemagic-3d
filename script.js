
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

(() => {
  "use strict";

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Automatically update the footer year
  const year = $("#year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // MOBILE MENU
  const menuButton = $("#menu-toggle");
  const navigation = $("#navigation");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("nav-open");

      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Close menu" : "Open menu"
      );

      menuButton.textContent = isOpen ? "✕" : "☰";
    });

    navigation.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navigation.classList.remove("nav-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open menu");
        menuButton.textContent = "☰";
      });
    });
  }

  // SCROLL REVEAL
  const revealElements = document.querySelectorAll(
    ".section-label, .story h2, .story-copy, .gear-heading, .gear-card, .final-content"
  );

  revealElements.forEach(element => {
    element.classList.add("reveal");
  });

  if ("IntersectionObserver" in window && !reducedMotion) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12
      }
    );

    revealElements.forEach(element => observer.observe(element));
  } else {
    revealElements.forEach(element => {
      element.classList.add("is-visible");
    });
  }

  
  // HELMET — TILT WITH MOUSE MOVEMENT
  const helmet = document.querySelector(".real-helmet");

  if (helmet && !reducedMotion) {
    helmet.style.transformStyle = "preserve-3d";
    helmet.style.transition = "transform 0.15s ease-out";

    helmet.addEventListener("pointermove", (event) => {
      const bounds = helmet.getBoundingClientRect();

      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;

      const rotateY = (x - 0.5) * 35;
      const rotateX = (0.5 - y) * 25;

      helmet.style.transform =
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    helmet.addEventListener("pointerleave", () => {
      helmet.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    });
  }

  // GSAP SCROLL ANIMATIONS
  // The website still works if the animation libraries do not load.

  if (
    window.gsap &&
    window.ScrollTrigger &&
    !reducedMotion
  ) {
    gsap.registerPlugin(ScrollTrigger);
    
    // CINEMATIC PRODUCT SHOWCASE
    const showcase = document.querySelector("#featured-gear");
    const showcaseCopy = document.querySelector(".showcase-copy");
    const showcaseGlow = document.querySelector(".showcase-glow");

    if (showcase && showcaseCopy) {
      gsap.fromTo(
        showcaseCopy,
        { y: 55, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: showcase,
            start: "top 70%",
            once: true
          }
        }
      );
    }

    if (showcaseGlow) {
      gsap.to(showcaseGlow, {
        scale: 1.3,
        opacity: 0.3,
        ease: "none",
        scrollTrigger: {
          trigger: "#featured-gear",
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      });
    }

    // BRAND CARDS: staggered reveal and interactive 3D tilt
    const brandCards = gsap.utils.toArray(".brand-card");

    if (brandCards.length) {
      gsap.from(brandCards, {
        y: 40,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".brands-grid",
          start: "top 82%",
          once: true
        }
      });

      brandCards.forEach(card => {
        card.addEventListener("pointermove", event => {
          if (event.pointerType !== "mouse") return;

          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;

          gsap.to(card, {
            rotationY: x * 5,
            rotationX: -y * 5,
            transformPerspective: 800,
            duration: 0.25,
            overwrite: true
          });
        });

        card.addEventListener("pointerleave", () => {
          gsap.to(card, {
            rotationX: 0,
            rotationY: 0,
            duration: 0.4,
            ease: "power2.out",
            overwrite: true
          });
        });
      });
    }


    // Hero text enters with a staggered animation
    gsap.from(".hero-content > *", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: "power3.out",
      delay: 0.15
    });


const helmetContainer = document.querySelector("#helmet-3d-container");

if (helmetContainer) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    35,
    helmetContainer.clientWidth / helmetContainer.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(
    helmetContainer.clientWidth,
    helmetContainer.clientHeight
  );
  helmetContainer.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x333344, 3));

  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(3, 5, 5);
  scene.add(light);

  const loader = new GLTFLoader();

  loader.load("assets/axor-helmet.glb", (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    model.position.sub(center);

    const maxDimension = Math.max(size.x, size.y, size.z);
    model.scale.setScalar(2 / maxDimension);

    let dragging = false;
    let previousX = 0;
    let previousY = 0;

    renderer.domElement.style.cursor = "grab";
    renderer.domElement.style.touchAction = "none";

    renderer.domElement.addEventListener("pointerdown", (event) => {
      dragging = true;
      previousX = event.clientX;
      previousY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
      renderer.domElement.style.cursor = "grabbing";
    });

    renderer.domElement.addEventListener("pointermove", (event) => {
      if (!dragging) return;

      model.rotation.y += (event.clientX - previousX) * 0.01;
      model.rotation.x += (event.clientY - previousY) * 0.01;

      previousX = event.clientX;
      previousY = event.clientY;
    });

    renderer.domElement.addEventListener("pointerup", () => {
      dragging = false;
      renderer.domElement.style.cursor = "grab";
    });

    renderer.domElement.addEventListener("pointercancel", () => {
      dragging = false;
      renderer.domElement.style.cursor = "grab";
    });

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    animate();
  }, undefined, (error) => {
    console.error("Could not load helmet model:", error);
  });

  window.addEventListener("resize", () => {
    const width = helmetContainer.clientWidth;
    const height = helmetContainer.clientHeight;
    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}
  }
})();

/* RideMagic: Interactive helmet movement */

(() => {
  const helmet = document.querySelector("#helmet-showcase");
  const wrapper = document.querySelector("#helmet-wrap") ||
                  document.querySelector(".helmet-wrap");

  if (!helmet || !wrapper) return;

  const canHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  if (!canHover) return;

  let frame = null;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  wrapper.addEventListener("pointermove", (event) => {
    const rect = wrapper.getBoundingClientRect();

    targetY = ((event.clientX - rect.left) / rect.width - 0.5) * 30;
    targetX = -((event.clientY - rect.top) / rect.height - 0.5) * 25;

    if (!frame) animateTilt();
  });

  wrapper.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
    if (!frame) animateTilt();
  });

  function animateTilt() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    const activeHelmet = wrapper.querySelector(".helmet-image.active");

if (activeHelmet) {
  activeHelmet.style.setProperty("--mouse-tilt-x", `${currentX}deg`);
  activeHelmet.style.setProperty("--mouse-tilt-y", `${currentY}deg`);
}

    if (
      Math.abs(targetX - currentX) > 0.05 ||
      Math.abs(targetY - currentY) > 0.05
    ) {
      frame = requestAnimationFrame(animateTilt);
    } else {
      frame = null;
    }
  }
})();

/* RideMagic: Automatic helmet showcase */

(() => {
  const showcase = document.querySelector("#helmet-showcase");

  if (!showcase) return;

  const helmets = showcase.querySelectorAll(".helmet-image");

  if (helmets.length < 2) return;

  let currentIndex = 0;

  setInterval(() => {
    helmets[currentIndex].classList.remove("active");

    currentIndex = (currentIndex + 1) % helmets.length;

    helmets[currentIndex].classList.add("active");
  }, 3500);
})();

