const hero = document.getElementById("hero");
const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxImage = lightbox.querySelector(".lightbox-image");
const lightboxCaption = lightbox.querySelector(".lightbox-caption");
const lightboxClose = lightbox.querySelector(".lightbox-close");
const lightboxPrev = lightbox.querySelector(".lightbox-prev");
const lightboxNext = lightbox.querySelector(".lightbox-next");

let images = [];
let currentIndex = 0;

function altText(image) {
  return image.caption || image.file.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
}

function createFigure(image, index, { featured = false } = {}) {
  const figure = document.createElement("figure");
  figure.className = "artwork";
  figure.style.animationDelay = `${index * 0.08}s`;
  figure.tabIndex = 0;

  const frame = document.createElement("div");
  frame.className = "artwork-frame";

  const img = document.createElement("img");
  img.src = `images/${image.file}`;
  img.alt = altText(image);
  img.loading = featured ? "eager" : "lazy";

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

  return figure;
}

function showEmptyMessage() {
  gallery.innerHTML =
    '<p class="gallery-empty">Illustrations coming soon.</p>';
}

function openLightbox(index) {
  currentIndex = index;
  updateLightbox();
  lightbox.hidden = false;
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function updateLightbox() {
  const image = images[currentIndex];
  lightboxImage.src = `images/${image.file}`;
  lightboxImage.alt = altText(image);
  lightboxCaption.textContent = image.caption || "";
  lightboxCaption.hidden = !image.caption;

  lightboxPrev.hidden = images.length <= 1;
  lightboxNext.hidden = images.length <= 1;
}

function showPrev() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  updateLightbox();
}

function showNext() {
  currentIndex = (currentIndex + 1) % images.length;
  updateLightbox();
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
  })
  .catch(() => {
    showEmptyMessage();
  });
