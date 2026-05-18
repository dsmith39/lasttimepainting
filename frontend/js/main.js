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
      .map(function (src) {
        const project = findProject(src);
        if (!project) return null;
        return { src: src, project: project };
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

      galleryEl.innerHTML = "";
      visibleItems.forEach(function (item) {
        seenByProject[item.project.id] =
          (seenByProject[item.project.id] || 0) + 1;
        const photoNumber = seenByProject[item.project.id];
        const projectTotal = counts[item.project.id];

        const figure = document.createElement("figure");
        figure.className = "gallery-item";

        const imageWrap = document.createElement("div");
        imageWrap.className = "image-card";

        const img = document.createElement("img");
        // Paths in the dataset may already include %20; normalize to avoid double encoding.
        img.src = item.src.replace(/%20/g, " ");
        img.loading = photoNumber <= 12 ? "eager" : "lazy";
        if (photoNumber <= 6) {
          img.fetchPriority = "high";
        }
        img.decoding = "async";
        img.alt =
          item.project.label +
          " project photo " +
          photoNumber +
          " of " +
          projectTotal;
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
        description.textContent = item.project.description;

        figcaption.appendChild(meta);
        figcaption.appendChild(title);
        figcaption.appendChild(description);

        figure.appendChild(imageWrap);
        figure.appendChild(figcaption);
        galleryEl.appendChild(figure);
      });

      filtersEl.querySelectorAll(".filter-chip").forEach(function (chip) {
        const isActive = chip.getAttribute("data-filter") === activeFilter;
        chip.classList.toggle("active", isActive);
        chip.setAttribute("aria-pressed", String(isActive));
      });
    }

    renderFilters();

    filtersEl.addEventListener("click", function (event) {
      const chip = event.target.closest(".filter-chip");
      if (!chip) return;
      activeFilter = chip.getAttribute("data-filter") || "all";
      renderGallery();
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
