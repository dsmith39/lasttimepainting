/* Purpose: Site-wide JavaScript for navigation, FAQ accordion, reveal animations, and active page state. */

(function () {
  const body = document.body;
  const header = document.querySelector("[data-site-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  function handleHeaderScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 10);
  }

  function setupMobileMenu() {
    if (!menuToggle || !mobileNav) return;

    menuToggle.addEventListener("click", function () {
      const isOpen = mobileNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      body.classList.toggle("menu-open", isOpen);
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        body.classList.remove("menu-open");
      });
    });
  }

  function setupAccordions() {
    const items = document.querySelectorAll(".accordion-item");
    if (!items.length) return;

    items.forEach(function (item) {
      const trigger = item.querySelector(".accordion-trigger");
      if (!trigger) return;

      trigger.addEventListener("click", function () {
        const isOpen = item.classList.toggle("open");
        trigger.setAttribute("aria-expanded", String(isOpen));
      });
    });
  }

  function setupRevealAnimations() {
    const revealElements = document.querySelectorAll(".reveal");
    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.18 },
    );

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  function setActiveNav() {
    const currentPage = body.getAttribute("data-page");
    if (!currentPage) return;

    document.querySelectorAll(".nav-link").forEach(function (link) {
      if (link.getAttribute("data-page") === currentPage) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  handleHeaderScroll();
  setupMobileMenu();
  setupAccordions();
  setupRevealAnimations();
  setActiveNav();

  window.addEventListener("scroll", handleHeaderScroll, { passive: true });
})();
