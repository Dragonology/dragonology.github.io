const gallery = document.getElementById("gallery");

function createFigure(image) {
  const figure = document.createElement("figure");
  const img = document.createElement("img");

  img.src = `images/${image.file}`;
  img.alt = image.caption || image.file.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
  img.loading = "lazy";

  figure.appendChild(img);

  if (image.caption) {
    const caption = document.createElement("figcaption");
    caption.textContent = image.caption;
    figure.appendChild(caption);
  }

  return figure;
}

function showEmptyMessage() {
  gallery.innerHTML =
    '<p class="gallery-empty">No illustrations yet. Add images to the <code>images/</code> folder and list them in <code>images.json</code>.</p>';
}

fetch("images.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Could not load images.json");
    }
    return response.json();
  })
  .then((images) => {
    if (!Array.isArray(images) || images.length === 0) {
      showEmptyMessage();
      return;
    }

    images.forEach((image) => {
      gallery.appendChild(createFigure(image));
    });
  })
  .catch(() => {
    showEmptyMessage();
  });
