interface TileLayout {
  ratio: string;
  weight: number;
}

interface Photo {
  key: string;
  src: string;
  fullSrc: string;
  alt: string;
}

interface LoaderTile {
  key: string;
}

type RowItem<T> = T & { layout: TileLayout };

interface PocketBaseRecord {
  id: string;
  collectionId: string;
  file: string;
  title?: string;
}

interface PocketBaseListResponse {
  items?: PocketBaseRecord[];
}

type GalleryState = "loading" | "error" | "empty" | "results";

(() => {
  const app = document.querySelector<HTMLElement>("#gallery-app");
  if (!app) return;

  const loadingEl = app.querySelector<HTMLElement>("[data-gallery-loading]");
  const loaderEl = app.querySelector<HTMLElement>("[data-gallery-loader]");
  const errorEl = app.querySelector<HTMLElement>("[data-gallery-error]");
  const emptyEl = app.querySelector<HTMLElement>("[data-gallery-empty]");
  const resultsEl = app.querySelector<HTMLElement>("[data-gallery-results]");
  const outputEl = app.querySelector<HTMLElement>("[data-gallery-output]");
  const moreEl = app.querySelector<HTMLElement>("[data-gallery-more]");
  const loadMoreButton = app.querySelector<HTMLButtonElement>(
    "[data-gallery-load-more]",
  );
  const countEl = app.querySelector<HTMLElement>("[data-gallery-count]");

  const POCKETBASE_URL = "https://cdn.gxbs.dev";
  const COLLECTION = "gallery";
  const CHUNK_SIZE = 12;

  const ROW_PATTERNS: TileLayout[][] = [
    [
      { ratio: "1 / 1", weight: 1 },
      { ratio: "16 / 9", weight: 16 / 9 },
    ],
    [
      { ratio: "4 / 5", weight: 4 / 5 },
      { ratio: "1 / 1", weight: 1 },
      { ratio: "4 / 4", weight: 1 },
    ],
    [
      { ratio: "16 / 9", weight: 16 / 9 },
      { ratio: "3 / 4", weight: 3 / 4 },
      { ratio: "1 / 1", weight: 1 },
    ],
    [
      { ratio: "5 / 4", weight: 5 / 4 },
      { ratio: "4 / 5", weight: 4 / 5 },
      { ratio: "3 / 2", weight: 3 / 2 },
    ],
  ];

  const getFallbackPattern = (remaining: number): TileLayout[] => {
    if (remaining === 1) return [{ ratio: "16 / 9", weight: 16 / 9 }];
    if (remaining === 2) {
      return [
        { ratio: "1 / 1", weight: 1 },
        { ratio: "4 / 3", weight: 4 / 3 },
      ];
    }
    return [
      { ratio: "4 / 5", weight: 4 / 5 },
      { ratio: "1 / 1", weight: 1 },
      { ratio: "16 / 9", weight: 16 / 9 },
    ].slice(0, remaining);
  };

  const createRows = <T,>(items: T[]): RowItem<T>[][] => {
    const rows: RowItem<T>[][] = [];
    let itemIndex = 0;
    let patternIndex = 0;

    while (itemIndex < items.length) {
      const remaining = items.length - itemIndex;
      const basePattern = ROW_PATTERNS[patternIndex % ROW_PATTERNS.length];
      const pattern = remaining >= basePattern.length
        ? basePattern
        : getFallbackPattern(remaining);

      rows.push(
        items
          .slice(itemIndex, itemIndex + pattern.length)
          .map((item, index) => ({ ...item, layout: pattern[index] })),
      );

      itemIndex += pattern.length;
      patternIndex += 1;
    }

    return rows;
  };

  const mapRecordToPhoto = (record: PocketBaseRecord): Photo => {
    const baseFileUrl =
      `${POCKETBASE_URL}/api/files/${record.collectionId}/${record.id}/${record.file}`;
    return {
      key: record.id,
      src: `${baseFileUrl}?thumb=1000x1000`,
      fullSrc: baseFileUrl,
      alt: record.title || "Captured moment",
    };
  };

  let firstVisit = false;
  try {
    const hasVisited =
      window.localStorage.getItem("gallery:visited") === "true";
    firstVisit = !hasVisited;
    if (!hasVisited) window.localStorage.setItem("gallery:visited", "true");
  } catch {
    firstVisit = true;
  }
  loadingEl?.classList.toggle("loader-first-visit", firstVisit);

  const LOADER_ROWS = createRows<LoaderTile>(
    Array.from({ length: 8 }, (_, index) => ({ key: `loader-${index}` })),
  );

  const renderLoaderSkeleton = () => {
    if (!loaderEl) return;
    loaderEl.replaceChildren();
    LOADER_ROWS.forEach((row, rowIndex) => {
      const rowEl = document.createElement("div");
      rowEl.className = "flex items-stretch gap-4 max-md:flex-col";
      row.forEach((item, itemIndex) => {
        const tile = document.createElement("div");
        tile.className = "min-w-0 flex-[var(--tile-flex)_1_0%]";
        tile.style.cssText =
          `--tile-ratio: ${item.layout.ratio}; --tile-flex: ${item.layout.weight}; --tile-delay: ${
            (rowIndex * 3 + itemIndex) * 90
          }ms;`;
        const shell = document.createElement("div");
        shell.className = "loader-shell";
        const skeleton = document.createElement("div");
        skeleton.className = "skeleton";
        shell.append(skeleton);
        tile.append(shell);
        rowEl.append(tile);
      });
      loaderEl.append(rowEl);
    });
  };

  let photos: Photo[] = [];
  let visibleCount = CHUNK_SIZE;
  let lightboxIndex: number | null = null;

  const backdrop = document.createElement("div");
  backdrop.className =
    "lightbox-backdrop fixed inset-0 z-100 hidden cursor-zoom-out items-center justify-center bg-[rgba(10,10,10,0.88)] p-6 backdrop-blur-sm";
  backdrop.setAttribute("role", "dialog");
  backdrop.setAttribute("aria-modal", "true");
  backdrop.setAttribute("aria-label", "Photograph preview");

  const prevButton = document.createElement("button");
  prevButton.type = "button";
  prevButton.className =
    "fixed top-1/2 left-4 z-101 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border-none bg-white/12 text-2xl text-white/80 transition-colors duration-200 hover:bg-white/20 hover:text-white max-sm:left-3";
  prevButton.setAttribute("aria-label", "Previous photo");
  prevButton.textContent = "←";

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className =
    "fixed top-1/2 right-4 z-101 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border-none bg-white/12 text-2xl text-white/80 transition-colors duration-200 hover:bg-white/20 hover:text-white max-sm:right-3";
  nextButton.setAttribute("aria-label", "Next photo");
  nextButton.textContent = "→";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className =
    "fixed top-5 right-5 flex size-9 items-center justify-center rounded-full border-none bg-white/12 text-base text-white/75 transition-colors duration-200 hover:bg-white/22 hover:text-white";
  closeButton.setAttribute("aria-label", "Close");
  closeButton.textContent = "✕";

  const frame = document.createElement("div");
  frame.className =
    "flex max-h-[88vh] max-w-[min(90vw,1100px)] cursor-default flex-col items-center gap-3";
  frame.addEventListener("click", (event) => event.stopPropagation());

  const preview = document.createElement("img");
  preview.className =
    "max-h-[82vh] max-w-full rounded-xl object-contain shadow-[0_20px_60px_rgba(0,0,0,0.5)]";

  const caption = document.createElement("p");
  caption.className =
    "text-center font-sans text-[0.8125rem] text-white/50 italic";

  frame.append(preview, caption);
  backdrop.append(prevButton, frame, nextButton, closeButton);
  document.body.append(backdrop);

  const closeLightbox = () => {
    lightboxIndex = null;
    backdrop.classList.add("hidden");
    backdrop.classList.remove("flex");
    document.body.style.overflow = "";
  };

  const renderLightbox = () => {
    if (lightboxIndex === null || !photos[lightboxIndex]) {
      closeLightbox();
      return;
    }
    const photo = photos[lightboxIndex];
    preview.src = photo.fullSrc;
    preview.alt = photo.alt;
    caption.textContent = photo.alt || "";
    caption.hidden = !photo.alt;
    backdrop.classList.remove("hidden");
    backdrop.classList.add("flex");
    document.body.style.overflow = "hidden";
  };

  const openLightbox = (index: number) => {
    lightboxIndex = index;
    renderLightbox();
  };

  const showPrevious = () => {
    if (lightboxIndex === null || !photos.length) return;
    lightboxIndex = (lightboxIndex - 1 + photos.length) % photos.length;
    renderLightbox();
  };

  const showNext = () => {
    if (lightboxIndex === null || !photos.length) return;
    lightboxIndex = (lightboxIndex + 1) % photos.length;
    renderLightbox();
  };

  backdrop.addEventListener("click", closeLightbox);
  prevButton.addEventListener("click", (event) => {
    event.stopPropagation();
    showPrevious();
  });
  nextButton.addEventListener("click", (event) => {
    event.stopPropagation();
    showNext();
  });
  closeButton.addEventListener("click", (event) => {
    event.stopPropagation();
    closeLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (lightboxIndex === null) return;
    if (event.key === "Escape") closeLightbox();
    else if (event.key === "ArrowLeft") showPrevious();
    else if (event.key === "ArrowRight") showNext();
  });

  const renderPhotos = () => {
    if (!outputEl) return;
    outputEl.replaceChildren();
    const visible = photos.slice(0, visibleCount);
    const rows = createRows<Photo>(visible);

    rows.forEach((row, rowIndex) => {
      const rowEl = document.createElement("div");
      rowEl.className = "flex items-stretch gap-4 max-md:flex-col";

      row.forEach((photo, itemIndex) => {
        const flatIndex = rowIndex * 3 + itemIndex;
        const button = document.createElement("button");
        button.type = "button";
        button.className =
          "block min-w-0 flex-[var(--tile-flex)_1_0%] cursor-zoom-in rounded-[1.25rem] border-none bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgba(17,24,39,0.3)]";
        button.style.cssText =
          `--tile-ratio: ${photo.layout.ratio}; --tile-flex: ${photo.layout.weight}; --tile-delay: ${
            flatIndex * 90
          }ms;`;
        button.setAttribute("aria-label", `View ${photo.alt}`);
        button.addEventListener("click", () => {
          openLightbox(photos.findIndex((item) => item.key === photo.key));
        });

        const shell = document.createElement("span");
        shell.className = "photo-shell";

        const image = document.createElement("img");
        image.src = photo.src;
        image.alt = photo.alt;
        image.loading = rowIndex === 0 ? "eager" : "lazy";
        image.decoding = "async";
        image.className = "photo-img";
        image.addEventListener(
          "load",
          () => shell.classList.add("photo-shell-loaded"),
        );
        image.addEventListener(
          "error",
          () => shell.classList.add("photo-shell-loaded"),
        );

        shell.append(image);
        button.append(shell);
        rowEl.append(button);
      });

      outputEl.append(rowEl);
    });

    if (moreEl) moreEl.hidden = visibleCount >= photos.length;
    if (countEl) {
      countEl.textContent = `Showing ${visible.length} of ${photos.length}`;
    }
  };

  loadMoreButton?.addEventListener("click", () => {
    visibleCount = Math.min(visibleCount + CHUNK_SIZE, photos.length);
    renderPhotos();
  });

  const showState = (state: GalleryState) => {
    loadingEl?.setAttribute("hidden", "");
    errorEl?.setAttribute("hidden", "");
    emptyEl?.setAttribute("hidden", "");
    resultsEl?.setAttribute("hidden", "");
    if (state === "loading") loadingEl?.removeAttribute("hidden");
    if (state === "error") errorEl?.removeAttribute("hidden");
    if (state === "empty") emptyEl?.removeAttribute("hidden");
    if (state === "results") resultsEl?.removeAttribute("hidden");
  };

  renderLoaderSkeleton();
  showState("loading");

  fetch(
    `${POCKETBASE_URL}/api/collections/${COLLECTION}/records?sort=-created&perPage=500`,
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`PocketBase returned ${response.status}`);
      }
      return response.json() as Promise<PocketBaseListResponse>;
    })
    .then((data) => {
      photos = (data.items ?? []).map(mapRecordToPhoto);
      visibleCount = Math.min(CHUNK_SIZE, photos.length);
      if (!photos.length) {
        showState("empty");
        return;
      }
      renderPhotos();
      showState("results");
    })
    .catch(() => {
      const message = errorEl?.querySelector("p");
      if (message) {
        message.textContent = "Unable to connect to the gallery backend.";
      }
      showState("error");
    });
})();
