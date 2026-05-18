/* Purpose: Site-wide JavaScript for navigation, accordions, animations, and project gallery rendering. */

(function () {
  const body = document.body;
  body.classList.add("js-enabled");
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

  function setupProjectGallery() {
    const galleryEl = document.querySelector("[data-project-gallery]");
    const filtersEl = document.querySelector("[data-gallery-filters]");
    const statsEl = document.querySelector("[data-gallery-stats]");
    const allImages = window.PROJECT_GALLERY_IMAGES;

    if (!galleryEl || !filtersEl || !statsEl || !Array.isArray(allImages))
      return;

    const projects = [
      {
        id: "cabinets",
        label: "Cabinets",
        keys: ["/LTP-Cabinets-3-001/"],
        meta: "Cabinet Project",
        title: "Cabinet Refinish Sequence",
        description:
          "Cabinet doors and frames prepped, coated, and staged for a consistent finish.",
      },
      {
        id: "corner",
        label: "Corner Accent",
        keys: ["/LTP-corner-3-001/"],
        meta: "Wall Detail",
        title: "Two-Tone Corner Detail",
        description:
          "Accent corner photos highlighting straight cut lines and clean color transitions.",
      },
      {
        id: "doors",
        label: "Door Refinish",
        keys: [
          "/LTP-exterior%20interior%20door-3-001/",
          "/LTP-exterior interior door-3-001/",
        ],
        meta: "Door Refinish",
        title: "Entry Door Restoration",
        description:
          "Exterior and interior door restoration with refreshed stain/finish tone.",
      },
      {
        id: "bobs",
        label: "Exterior Remodel",
        keys: ["/pictures-Bobs/"],
        meta: "Exterior Painting",
        title: "Exterior Remodel Progress",
        description:
          "Exterior siding and trim repaint progression from prep through finished elevations.",
      },
      {
        id: "shelves",
        label: "Floating Shelves",
        keys: ["/pictures-free_floating_shelves/"],
        meta: "Finish Carpentry",
        title: "Floating Shelf Finish",
        description:
          "Custom floating shelves painted for a seamless built-in look.",
      },
      {
        id: "jojo",
        label: "Interior Remodel",
        keys: ["/pictures-jojo_remodel/"],
        meta: "Interior Remodel",
        title: "Interior Remodel Sequence",
        description:
          "Remodel photos showing cabinetry, surfaces, and finish coordination across rooms.",
      },
    ];

    function findProject(src) {
      return projects.find(function (project) {
        return project.keys.some(function (key) {
          return src.indexOf(key) !== -1;
        });
      });
    }

    const items = allImages
      .map(function (imageData) {
        // Handle both old string format and new object format
        const src = typeof imageData === 'string' ? imageData : imageData.src;
        const project = findProject(src);
        if (!project) return null;
        return { 
          src: src, 
          project: project,
          alt: imageData.alt || (project.label + ' project photo'),
          description: imageData.description || project.description
        };
      })
      .filter(Boolean)
      .sort(function (a, b) {
        return a.src.localeCompare(b.src);
      });

    const counts = items.reduce(function (acc, item) {
      acc[item.project.id] = (acc[item.project.id] || 0) + 1;
      return acc;
    }, {});

    const activeProjects = projects.filter(function (project) {
      return counts[project.id];
    });

    let activeFilter = "all";

    // Lightbox
    let lightboxItems = [];
    let lightboxIndex = 0;

    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Image viewer");
    lightbox.hidden = true;
    const svgPrev =
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>';
    const svgNext =
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>';
    const svgX =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    lightbox.innerHTML =
      '<div class="lightbox-backdrop"></div>' +
      '<div class="lightbox-panel">' +
      '  <figure class="lightbox-figure">' +
      '    <div class="lightbox-img-wrap">' +
      '      <img class="lightbox-img" src="" alt="" />' +
      '      <button class="lightbox-prev" aria-label="Previous image">' +
      svgPrev +
      "</button>" +
      '      <button class="lightbox-next" aria-label="Next image">' +
      svgNext +
      "</button>" +
      '      <button class="lightbox-close" aria-label="Close image viewer">' +
      svgX +
      " Close</button>" +
      "    </div>" +
      '    <figcaption class="lightbox-caption">' +
      '      <span class="lightbox-meta"></span>' +
      '      <h3 class="lightbox-title"></h3>' +
      '      <p class="lightbox-desc"></p>' +
      '      <div class="lightbox-footer">' +
      '        <span class="lightbox-counter"></span>' +
      '        <div class="lightbox-filter-row">' +
      '          <span class="lightbox-filter-label">Browse:</span>' +
      '          <div class="lightbox-filters" data-lightbox-filters></div>' +
      "        </div>" +
      "      </div>" +
      "    </figcaption>" +
      "  </figure>" +
      "</div>";
    document.body.appendChild(lightbox);

    const lbImg = lightbox.querySelector(".lightbox-img");
    const lbMeta = lightbox.querySelector(".lightbox-meta");
    const lbTitle = lightbox.querySelector(".lightbox-title");
    const lbDesc = lightbox.querySelector(".lightbox-desc");
    const lbCounter = lightbox.querySelector(".lightbox-counter");
    const lbFiltersEl = lightbox.querySelector("[data-lightbox-filters]");

    function showLightbox(index) {
      lightboxIndex =
        ((index % lightboxItems.length) + lightboxItems.length) %
        lightboxItems.length;
      const item = lightboxItems[lightboxIndex];
      lbImg.src = item.src.replace(/%20/g, " ");
      lbImg.alt = item.alt;
      lbMeta.textContent = item.project.meta;
      lbTitle.textContent = item.project.title;
      lbCounter.textContent = lightboxIndex + 1 + " of " + lightboxItems.length;
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      lightbox.querySelector(".lightbox-close").focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.style.overflow = "";
    }

    lightbox
      .querySelector(".lightbox-backdrop")
      .addEventListener("click", closeLightbox);
    lightbox
      .querySelector(".lightbox-close")
      .addEventListener("click", closeLightbox);
    lightbox
      .querySelector(".lightbox-prev")
      .addEventListener("click", function () {
        showLightbox(lightboxIndex - 1);
      });
    lightbox
      .querySelector(".lightbox-next")
      .addEventListener("click", function () {
        showLightbox(lightboxIndex + 1);
      });

    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showLightbox(lightboxIndex - 1);
      if (e.key === "ArrowRight") showLightbox(lightboxIndex + 1);
    });

    function createFilterButton(id, label, count) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-chip";
      button.setAttribute("data-filter", id);
      button.setAttribute("aria-pressed", "false");
      button.textContent = label + " (" + count + ")";
      return button;
    }

    function renderFilters() {
      filtersEl.innerHTML = "";
      const allButton = createFilterButton("all", "All Projects", items.length);
      filtersEl.appendChild(allButton);

      activeProjects.forEach(function (project) {
        const button = createFilterButton(
          project.id,
          project.label,
          counts[project.id],
        );
        filtersEl.appendChild(button);
      });
    }

    function renderGallery() {
      const visibleItems =
        activeFilter === "all"
          ? items
          : items.filter(function (item) {
              return item.project.id === activeFilter;
            });

      const seenByProject = {};

      const currentProject = projects.find(function (project) {
        return project.id === activeFilter;
      });

      statsEl.textContent =
        visibleItems.length +
        " photos showing" +
        (currentProject ? " " + currentProject.label : " all projects") +
        ". " +
        items.length +
        " total uploaded photos across " +
        activeProjects.length +
        " project folders.";

      lightboxItems = visibleItems;

      galleryEl.innerHTML = "";
      visibleItems.forEach(function (item, index) {
        seenByProject[item.project.id] =
          (seenByProject[item.project.id] || 0) + 1;
        const photoNumber = seenByProject[item.project.id];
        const projectTotal = counts[item.project.id];

        const figure = document.createElement("figure");
        figure.className = "gallery-item";

        const imageWrap = document.createElement("button");
        imageWrap.type = "button";
        imageWrap.className = "image-card";

        const img = document.createElement("img");
        // Paths in the dataset may already include %20; normalize to avoid double encoding.
        img.src = item.src.replace(/%20/g, " ");
        img.loading = photoNumber <= 12 ? "eager" : "lazy";
        if (photoNumber <= 6) {
          img.fetchPriority = "high";
        }
        img.decoding = "async";
        img.alt = item.alt;
        imageWrap.setAttribute("aria-label", "View full image: " + img.alt);
        imageWrap.addEventListener("click", function () {
          showLightbox(index);
        });
        imageWrap.appendChild(img);

        const figcaption = document.createElement("figcaption");
        figcaption.className = "gallery-caption";

        const meta = document.createElement("span");
        meta.className = "gallery-meta";
        meta.textContent = item.project.meta;

        const title = document.createElement("h3");
        title.textContent =
          item.project.title +
          " - Photo " +
          photoNumber +
          " of " +
          projectTotal;

        const description = document.createElement("p");
        figcaption.appendChild(meta);
        figcaption.appendChild(title);

        figure.appendChild(imageWrap);
        figure.appendChild(figcaption);
        galleryEl.appendChild(figure);
      });

      [filtersEl, lbFiltersEl].forEach(function (container) {
        container.querySelectorAll(".filter-chip").forEach(function (chip) {
          const isActive = chip.getAttribute("data-filter") === activeFilter;
          chip.classList.toggle("active", isActive);
          chip.setAttribute("aria-pressed", String(isActive));
        });
      });
    }

    function renderLightboxFilters() {
      lbFiltersEl.innerHTML = "";
      const allBtn = createFilterButton("all", "All", items.length);
      lbFiltersEl.appendChild(allBtn);
      activeProjects.forEach(function (project) {
        lbFiltersEl.appendChild(
          createFilterButton(project.id, project.label, counts[project.id]),
        );
      });
    }

    renderFilters();
    renderLightboxFilters();

    filtersEl.addEventListener("click", function (event) {
      const chip = event.target.closest(".filter-chip");
      if (!chip) return;
      activeFilter = chip.getAttribute("data-filter") || "all";
      renderGallery();
    });

    lbFiltersEl.addEventListener("click", function (event) {
      const chip = event.target.closest(".filter-chip");
      if (!chip) return;
      activeFilter = chip.getAttribute("data-filter") || "all";
      renderGallery();
      showLightbox(0);
    });

    renderGallery();
  }

  handleHeaderScroll();
  setupMobileMenu();
  setupAccordions();
  setupRevealAnimations();
  setupProjectGallery();
  setActiveNav();

  window.addEventListener("scroll", handleHeaderScroll, { passive: true });
})();
