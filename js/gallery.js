const hero = document.getElementById("hero");
const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxStage = lightbox.querySelector(".lightbox-stage");
const lightboxImage = lightbox.querySelector(".lightbox-image");
const lightboxCaption = lightbox.querySelector(".lightbox-caption");
const lightboxCounter = lightbox.querySelector(".lightbox-counter");
const lightboxClose = lightbox.querySelector(".lightbox-close");
const lightboxPrev = lightbox.querySelector(".lightbox-prev");
const lightboxNext = lightbox.querySelector(".lightbox-next");

const SWIPE_THRESHOLD = 50;
const FADE_MS = 300;
const COMPACT_WIDTH = 500;

let images = [];
let currentIndex = 0;
let touchStartX = 0;
let touchStartY = 0;
let isFading = false;

function altText(image) {
  return image.caption || image.file.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
}

function imageSrc(image) {
  return `images/${image.file}`;
}

function isCompactDisplay(image, naturalWidth) {
  if (image.display === "full") {
    return false;
  }
  if (image.display === "compact") {
    return true;
  }
  return naturalWidth < COMPACT_WIDTH;
}

function isLargeDisplay(image, index, naturalWidth) {
  if (image.display === "large" || image.display === "wide") {
    return naturalWidth >= 400;
  }
  if (
    image.display === "compact" ||
    image.display === "full" ||
    naturalWidth < 480
  ) {
    return false;
  }
  return index % 5 === 2 || index % 5 === 4 || index % 7 === 0;
}

function applyFigureSizing(img, figure, image, index) {
  const apply = () => {
    if (!img.naturalWidth) {
      return;
    }

    const naturalWidth = img.naturalWidth;
    const compact = isCompactDisplay(image, naturalWidth);

    figure.dataset.naturalWidth = String(naturalWidth);
    figure.dataset.naturalHeight = String(img.naturalHeight);
    figure.classList.toggle("artwork--compact", compact);
    figure.classList.toggle(
      "artwork--large",
      !compact && isLargeDisplay(image, index, naturalWidth)
    );

    figure.style.setProperty("--img-native-max", `${naturalWidth}px`);
  };

  if (img.complete) {
    apply();
  } else {
    img.addEventListener("load", apply, { once: true });
  }
}

function applyLightboxSizing(image) {
  const apply = () => {
    if (!lightboxImage.naturalWidth) {
      return;
    }

    const compact = isCompactDisplay(image, lightboxImage.naturalWidth);
    lightboxImage.classList.toggle("lightbox-image--compact", compact);

    if (compact) {
      const maxW = Math.min(lightboxImage.naturalWidth, window.innerWidth * 0.9);
      const maxH = Math.min(lightboxImage.naturalHeight, window.innerHeight * 0.85);
      lightboxImage.style.maxWidth = `${maxW}px`;
      lightboxImage.style.maxHeight = `${maxH}px`;
    } else {
      lightboxImage.style.maxWidth = "";
      lightboxImage.style.maxHeight = "";
    }
  };

  if (lightboxImage.complete && lightboxImage.naturalWidth) {
    apply();
  } else {
    lightboxImage.addEventListener("load", apply, { once: true });
  }
}

function clearLightboxSizing() {
  lightboxImage.classList.remove("lightbox-image--compact");
  lightboxImage.style.maxWidth = "";
  lightboxImage.style.maxHeight = "";
}

function observeArtwork(figure) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
  );
  observer.observe(figure);
}

function createFigure(image, index, { featured = false } = {}) {
  const figure = document.createElement("figure");
  figure.className = "artwork";
  figure.dataset.parallaxDepth = String((index % 3) + 1);
  figure.dataset.parallaxSide = index % 2 === 0 ? "left" : "right";
  figure.tabIndex = 0;

  const frame = document.createElement("div");
  frame.className = "artwork-frame";

  const img = document.createElement("img");
  img.src = imageSrc(image);
  img.alt = altText(image);
  img.loading = featured ? "eager" : "lazy";
  applyFigureSizing(img, figure, image, index);

  frame.appendChild(img);
  figure.appendChild(frame);

  if (image.caption) {
    const caption = document.createElement("figcaption");
    caption.textContent = image.caption;
    figure.appendChild(caption);
  }

  figure.addEventListener("click", () => openLightbox(index));
  figure.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox(index);
    }
  });

  observeArtwork(figure);
  return figure;
}

function showEmptyMessage() {
  gallery.innerHTML =
    '<p class="gallery-empty">Illustrations coming soon.</p>';
}

function preloadAdjacent() {
  const prev = images[(currentIndex - 1 + images.length) % images.length];
  const next = images[(currentIndex + 1) % images.length];
  [prev, next].forEach((image) => {
    const img = new Image();
    img.src = imageSrc(image);
  });
}

function updateCounter() {
  lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`;
  lightboxCounter.hidden = images.length <= 1;
}

function finishLightboxImageLoad(image) {
  lightboxImage.classList.remove("is-fading");
  isFading = false;
  applyLightboxSizing(image);
}

function setLightboxImage(image, animate) {
  const src = imageSrc(image);

  if (!animate) {
    lightboxImage.src = src;
    lightboxImage.alt = altText(image);
    lightboxImage.classList.remove("is-fading");
    applyLightboxSizing(image);
    return;
  }

  if (isFading) {
    return;
  }

  isFading = true;
  lightboxImage.classList.add("is-fading");

  window.setTimeout(() => {
    const onLoad = () => {
      finishLightboxImageLoad(image);
      lightboxImage.removeEventListener("load", onLoad);
    };

    lightboxImage.addEventListener("load", onLoad);
    lightboxImage.src = src;
    lightboxImage.alt = altText(image);

    if (lightboxImage.complete) {
      onLoad();
    }
  }, FADE_MS);
}

function updateLightbox({ animate = false } = {}) {
  const image = images[currentIndex];
  setLightboxImage(image, animate);
  lightboxCaption.textContent = image.caption || "";
  lightboxCaption.hidden = !image.caption;
  updateCounter();

  lightboxPrev.hidden = images.length <= 1;
  lightboxNext.hidden = images.length <= 1;

  preloadAdjacent();
}

function openLightbox(index) {
  currentIndex = index;
  updateLightbox({ animate: false });
  lightbox.hidden = false;
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  lightboxImage.classList.remove("is-fading");
  isFading = false;
  clearLightboxSizing();
}

function showPrev() {
  if (isFading) {
    return;
  }
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  updateLightbox({ animate: true });
}

function showNext() {
  if (isFading) {
    return;
  }
  currentIndex = (currentIndex + 1) % images.length;
  updateLightbox({ animate: true });
}

lightboxClose.addEventListener("click", closeLightbox);
lightboxPrev.addEventListener("click", (event) => {
  event.stopPropagation();
  showPrev();
});
lightboxNext.addEventListener("click", (event) => {
  event.stopPropagation();
  showNext();
});
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

lightboxStage.addEventListener("touchstart", (event) => {
  if (event.touches.length !== 1) {
    return;
  }
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}, { passive: true });

lightboxStage.addEventListener("touchend", (event) => {
  if (event.changedTouches.length !== 1) {
    return;
  }

  const deltaX = event.changedTouches[0].clientX - touchStartX;
  const deltaY = event.changedTouches[0].clientY - touchStartY;

  if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) {
    return;
  }

  if (deltaX > 0) {
    showPrev();
  } else {
    showNext();
  }
}, { passive: true });

document.addEventListener("keydown", (event) => {
  if (lightbox.hidden) {
    return;
  }
  if (event.key === "Escape") {
    closeLightbox();
  } else if (event.key === "ArrowLeft") {
    showPrev();
  } else if (event.key === "ArrowRight") {
    showNext();
  }
});

function parallaxOffset(element, viewHeight) {
  const rect = element.getBoundingClientRect();
  const centerY = rect.top + rect.height / 2;
  return (centerY - viewHeight / 2) / viewHeight;
}

function initFooterReveal() {
  const footer = document.querySelector(".site-footer");
  if (!footer) {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    footer.classList.add("is-visible");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25, rootMargin: "0px 0px -10% 0px" }
  );

  observer.observe(footer);
}

function initParallax() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    initFooterReveal();
    return;
  }

  const siteHeader = document.querySelector(".site-header");
  const headerTitle = document.querySelector(".header-title");
  const headerOrnament = document.querySelector(".header-ornament");
  const heroFrame = hero.querySelector(".artwork-frame");

  let ticking = false;

  const updateParallax = () => {
    const scrollY = window.scrollY;
    const viewHeight = window.innerHeight;

    if (siteHeader && headerTitle && headerOrnament) {
      const fade = Math.min(0.4, scrollY / 420);
      siteHeader.style.opacity = String(1 - fade);
      headerTitle.style.transform = `translateY(${scrollY * 0.28}px)`;
      headerOrnament.style.transform = `translateY(${scrollY * 0.42}px) scale(${1 - fade * 0.08})`;
    }

    if (heroFrame) {
      const dist = parallaxOffset(hero, viewHeight);
      heroFrame.style.setProperty("--parallax-x", `${dist * 18}px`);
      heroFrame.style.setProperty("--parallax-y", `${dist * 44 + scrollY * 0.07}px`);
    }

    gallery.querySelectorAll(".artwork").forEach((figure) => {
      const frame = figure.querySelector(".artwork-frame");
      if (!frame) {
        return;
      }

      const depth = Number(figure.dataset.parallaxDepth || 1);
      const side = figure.dataset.parallaxSide === "left" ? -1 : 1;
      const dist = parallaxOffset(figure, viewHeight);
      const x = side * dist * (11 + depth * 4);
      const y = dist * (18 + depth * 6);

      frame.style.setProperty("--parallax-x", `${x}px`);
      frame.style.setProperty("--parallax-y", `${y}px`);
    });
  };

  const onScroll = () => {
    if (ticking) {
      return;
    }
    ticking = true;
    requestAnimationFrame(() => {
      updateParallax();
      ticking = false;
    });
  };

  updateParallax();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  initFooterReveal();
}

fetch("images.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Could not load images.json");
    }
    return response.json();
  })
  .then((data) => {
    if (!Array.isArray(data) || data.length === 0) {
      showEmptyMessage();
      return;
    }

    images = data;
    const [cover, ...rest] = data;

    hero.hidden = false;
    hero.appendChild(createFigure(cover, 0, { featured: true }));
    rest.forEach((image, i) => {
      gallery.appendChild(createFigure(image, i + 1));
    });

    initParallax();
  })
  .catch(() => {
    showEmptyMessage();
  });
