<script>
  import { onMount, tick } from "svelte";
  import Footer from "./Footer.svelte";

  const OWNER = "GabsEdits";
  const REPO = "photography";
  const BRANCH = "main";
  const FOLDER = ""; // "" = repo root, or "photos" for a subfolder

  const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "avif", "gif"]);
  const CACHE_KEY = `gallery-cache:${OWNER}/${REPO}/${FOLDER || "root"}`;
  const DATES_CACHE_KEY = `gallery-date-cache:${OWNER}/${REPO}/${FOLDER || "root"}`;
  const CACHE_TTL = 1000 * 60 * 10;
  const DATES_CACHE_TTL = 1000 * 60 * 60 * 12;
  const LARGE_FILE_BYTES = 18_000_000;
  const CHUNK_SIZE = 12;
  const MAX_DATE_LOOKUPS = 24;
  const DATE_LOOKUP_CONCURRENCY = 4;

  const ROW_PATTERNS = [
    [
      { ratio: "1 / 1", weight: 1 },
      { ratio: "16 / 9", weight: 16 / 9 }
    ],
    [
      { ratio: "4 / 5", weight: 4 / 5 },
      { ratio: "1 / 1", weight: 1 },
      { ratio: "4 / 4", weight: 1 }
    ],
    [
      { ratio: "16 / 9", weight: 16 / 9 },
      { ratio: "3 / 4", weight: 3 / 4 },
      { ratio: "1 / 1", weight: 1 }
    ],
    [
      { ratio: "5 / 4", weight: 5 / 4 },
      { ratio: "4 / 5", weight: 4 / 5 },
      { ratio: "3 / 2", weight: 3 / 2 }
    ]
  ];

  const LOADER_ITEMS = Array.from({ length: 8 }, (_, index) => ({
    key: `loader-${index}`,
    alt: ""
  }));

  let photos = [];
  let loading = true;
  let error = null;
  let lightboxIndex = null;
  let photoStates = {};
  let firstVisit = false;
  let galleryRoot;
  let visibleCount = CHUNK_SIZE;
  let commitDateCache = {};
  let refreshSeed = 0;

  const encodePath = (value) => value
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");

  const buildCdnUrl = (filePath) => {
    const encodedPath = encodePath(filePath);
    return `https://cdn.jsdelivr.net/gh/${OWNER}/${REPO}@${BRANCH}/${encodedPath}`;
  };

  const choosePrimarySrc = (file) => file.size > LARGE_FILE_BYTES
    ? file.download_url
    : buildCdnUrl(file.path);

  const toPhoto = (file) => ({
    key: file.sha ?? file.path,
    src: choosePrimarySrc(file),
    fallbackSrc: file.download_url,
    path: file.path,
    alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ")
  });

  const parseDateFromName = (name) => {
    const match = name.match(/(20\d{2})[-_]?([01]\d)[-_]?([0-3]\d)/);
    if (!match) return null;

    const [, year, month, day] = match;
    return `${year}-${month}-${day}T00:00:00.000Z`;
  };

  const readCommitDateCache = () => {
    try {
      const cachedValue = window.localStorage.getItem(DATES_CACHE_KEY);
      if (!cachedValue) return {};

      const cached = JSON.parse(cachedValue);
      if (typeof cached?.savedAt !== "number" || typeof cached?.dates !== "object" || !cached.dates) {
        return {};
      }

      if (Date.now() - cached.savedAt > DATES_CACHE_TTL) {
        return {};
      }

      return cached.dates;
    } catch {
      return {};
    }
  };

  const writeCommitDateCache = () => {
    try {
      window.localStorage.setItem(
        DATES_CACHE_KEY,
        JSON.stringify({ dates: commitDateCache, savedAt: Date.now() })
      );
    } catch {
      // Ignore storage quota / privacy mode failures.
    }
  };

  const fetchCommitDateForPath = async (filePath) => {
    if (commitDateCache[filePath]) {
      return commitDateCache[filePath];
    }

    const url = new URL(`https://api.github.com/repos/${OWNER}/${REPO}/commits`);
    url.searchParams.set("sha", BRANCH);
    url.searchParams.set("path", filePath);
    url.searchParams.set("per_page", "1");

    try {
      const res = await fetch(url.toString(), {
        headers: { Accept: "application/vnd.github+json" }
      });

      if (!res.ok) return null;

      const commits = await res.json();
      const commitDate = commits?.[0]?.commit?.committer?.date ?? commits?.[0]?.commit?.author?.date ?? null;

      if (commitDate) {
        commitDateCache = { ...commitDateCache, [filePath]: commitDate };
      }

      return commitDate;
    } catch {
      return null;
    }
  };

  const runWithConcurrency = async (items, limit, mapper) => {
    const results = new Array(items.length);
    let cursor = 0;

    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const currentIndex = cursor;
        cursor += 1;
        results[currentIndex] = await mapper(items[currentIndex], currentIndex);
      }
    });

    await Promise.all(workers);
    return results;
  };

  const sortPhotosNewestFirst = (items) => {
    return [...items].sort((a, b) => {
      const aTime = a.sortDate ? Date.parse(a.sortDate) : 0;
      const bTime = b.sortDate ? Date.parse(b.sortDate) : 0;

      if (bTime !== aTime) return bTime - aTime;
      return b.path.localeCompare(a.path);
    });
  };

  const hashWithSeed = (value, seed) => {
    let hash = 2166136261 ^ seed;

    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
  };

  const randomizeForRefresh = (items) => {
    const seed = refreshSeed || 1;
    return [...items].sort((a, b) => {
      const rankA = hashWithSeed(a.key, seed);
      const rankB = hashWithSeed(b.key, seed);
      return rankA - rankB;
    });
  };

  const enrichAndSortPhotos = async (rawFiles) => {
    const basePhotos = rawFiles.map((file) => {
      const filePhoto = toPhoto(file);
      const inferredDate = parseDateFromName(file.name);
      const cachedDate = commitDateCache[file.path] ?? null;

      return {
        ...filePhoto,
        sortDate: cachedDate ?? inferredDate
      };
    });

    const missingDateIndexes = basePhotos
      .map((photo, index) => (photo.sortDate ? -1 : index))
      .filter((index) => index >= 0)
      .slice(0, MAX_DATE_LOOKUPS);

    await runWithConcurrency(missingDateIndexes, DATE_LOOKUP_CONCURRENCY, async (index) => {
      const commitDate = await fetchCommitDateForPath(basePhotos[index].path);
      if (!commitDate) return;
      basePhotos[index] = { ...basePhotos[index], sortDate: commitDate };
    });

    writeCommitDateCache();
    return sortPhotosNewestFirst(basePhotos);
  };

  const getFallbackPattern = (remaining) => {
    if (remaining === 1) {
      return [{ ratio: "16 / 9", weight: 16 / 9 }];
    }

    if (remaining === 2) {
      return [
        { ratio: "1 / 1", weight: 1 },
        { ratio: "4 / 3", weight: 4 / 3 }
      ];
    }

    return [
      { ratio: "4 / 5", weight: 4 / 5 },
      { ratio: "1 / 1", weight: 1 },
      { ratio: "16 / 9", weight: 16 / 9 }
    ].slice(0, remaining);
  };

  const createRows = (items) => {
    const rows = [];
    let itemIndex = 0;
    let patternIndex = 0;

    while (itemIndex < items.length) {
      const remaining = items.length - itemIndex;
      const basePattern = ROW_PATTERNS[patternIndex % ROW_PATTERNS.length];
      const pattern = remaining >= basePattern.length
        ? basePattern
        : getFallbackPattern(remaining);

      rows.push(
        items.slice(itemIndex, itemIndex + pattern.length).map((item, index) => ({
          ...item,
          layout: pattern[index]
        }))
      );

      itemIndex += pattern.length;
      patternIndex += 1;
    }

    return rows;
  };

  const getTileStyle = (layout, index = 0) => `--tile-ratio: ${layout.ratio}; --tile-flex: ${layout.weight}; --tile-delay: ${index * 90}ms;`;

  const syncPhotoStates = (nextPhotos) => {
    const nextStateEntries = nextPhotos.map((photo) => {
      const previousPhoto = photos.find((entry) => entry.key === photo.key);
      const previousState = photoStates[photo.key];
      const sameSource = previousPhoto?.src === photo.src;

      if (previousState === "loaded" && sameSource) {
        return [photo.key, "loaded"];
      }

      if (previousState === "error" && sameSource) {
        return [photo.key, "error"];
      }

      return [photo.key, "loading"];
    });

    photoStates = Object.fromEntries(nextStateEntries);
  };

  const reconcileRenderedPhotos = async () => {
    await tick();

    const photoNodes = galleryRoot
      ? [...galleryRoot.querySelectorAll("img[data-photo-key]")]
      : [];

    if (!photoNodes.length) return;

    const completedEntries = photoNodes
      .filter((node) => node.complete && node.naturalWidth > 0)
      .map((node) => [node.dataset.photoKey, "loaded"]);

    if (!completedEntries.length) return;

    photoStates = {
      ...photoStates,
      ...Object.fromEntries(completedEntries)
    };
  };

  const readCachedPhotos = () => {
    try {
      const cachedValue = window.localStorage.getItem(CACHE_KEY);
      if (!cachedValue) return null;

      const cached = JSON.parse(cachedValue);
      if (!Array.isArray(cached?.photos) || typeof cached?.savedAt !== "number") {
        return null;
      }

      if (Date.now() - cached.savedAt > CACHE_TTL) {
        return null;
      }

      return cached.photos;
    } catch {
      return null;
    }
  };

  const writeCachedPhotos = (nextPhotos) => {
    try {
      window.localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ photos: nextPhotos, savedAt: Date.now() })
      );
    } catch {
      // Ignore storage quota / privacy mode failures.
    }
  };

  onMount(async () => {
    refreshSeed = Math.floor(Math.random() * 1_000_000_000);
    commitDateCache = readCommitDateCache();

    try {
      const hasVisited = window.localStorage.getItem(`${CACHE_KEY}:visited`) === "true";
      firstVisit = !hasVisited;
      if (!hasVisited) {
        window.localStorage.setItem(`${CACHE_KEY}:visited`, "true");
      }
    } catch {
      firstVisit = true;
    }

    const cachedPhotos = readCachedPhotos();

    if (cachedPhotos?.length) {
      const randomizedCachedPhotos = randomizeForRefresh(cachedPhotos);
      syncPhotoStates(randomizedCachedPhotos);
      photos = randomizedCachedPhotos;
      visibleCount = Math.min(CHUNK_SIZE, randomizedCachedPhotos.length);
      loading = false;
      await reconcileRenderedPhotos();
    }

    try {
      const path = FOLDER ? `/${FOLDER}` : "";
      const res = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents${path}`,
        { headers: { Accept: "application/vnd.github+json" } }
      );

      if (!res.ok) {
        error = res.status === 404
          ? "Repository or folder not found. Check OWNER / REPO / FOLDER in Gallery.svelte."
          : `GitHub API returned ${res.status}.`;
        return;
      }

      const files = await res.json();
      const imageFiles = files
        .filter((file) => {
          const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
          return file.type === "file" && IMAGE_EXT.has(ext);
        });

      const nextPhotos = await enrichAndSortPhotos(imageFiles);
      const randomizedNextPhotos = randomizeForRefresh(nextPhotos);

      syncPhotoStates(randomizedNextPhotos);
      photos = randomizedNextPhotos;
      visibleCount = Math.min(Math.max(visibleCount, CHUNK_SIZE), randomizedNextPhotos.length);
      writeCachedPhotos(nextPhotos);
      error = null;
      await reconcileRenderedPhotos();
    } catch (e) {
      if (!photos.length) {
        error = e?.message ?? "Unknown error.";
      }
    } finally {
      loading = false;
    }
  });

  const openLightbox = (index) => {
    lightboxIndex = index;
  };

  const closeLightbox = () => {
    lightboxIndex = null;
  };

  const showPreviousPhoto = () => {
    if (lightboxIndex === null || photos.length === 0) return;
    lightboxIndex = (lightboxIndex - 1 + photos.length) % photos.length;
  };

  const showNextPhoto = () => {
    if (lightboxIndex === null || photos.length === 0) return;
    lightboxIndex = (lightboxIndex + 1) % photos.length;
  };

  const handleKeydown = (e) => {
    if (lightboxIndex === null) return;

    if (e.key === "Escape") {
      closeLightbox();
      return;
    }

    if (e.key === "ArrowLeft") {
      showPreviousPhoto();
      return;
    }

    if (e.key === "ArrowRight") {
      showNextPhoto();
    }
  };

  const markPhotoLoaded = (photoKey) => {
    photoStates = { ...photoStates, [photoKey]: "loaded" };
  };

  const handleImageError = (event, photo) => {
    const img = event.currentTarget;

    if (photo.fallbackSrc && img.dataset.fallbackApplied !== "true" && img.src !== photo.fallbackSrc) {
      img.dataset.fallbackApplied = "true";
      img.src = photo.fallbackSrc;
      photoStates = { ...photoStates, [photo.key]: "loading" };
      return;
    }

    photoStates = { ...photoStates, [photo.key]: "error" };
  };

  const loadMorePhotos = () => {
    visibleCount = Math.min(visibleCount + CHUNK_SIZE, photos.length);
  };

  $: if (visibleCount > photos.length) {
    visibleCount = photos.length;
  }

  $: visiblePhotos = photos.slice(0, visibleCount);
  $: photoRows = createRows(visiblePhotos);
  $: loaderRows = createRows(LOADER_ITEMS);
  $: lightboxPhoto = lightboxIndex === null ? null : photos[lightboxIndex] ?? null;
  $: hasMorePhotos = visibleCount < photos.length;
</script>

<svelte:window on:keydown={handleKeydown} />

<header class="flex flex-col items-center gap-4 text-center">
  <div class="flex items-end justify-end gap-3 text-xl font-extrabold italic leading-4">
    <a href="/">
      <img src="/ecliptic.svg" alt="" aria-hidden="true" class="h-5 dark:invert" />
    </a>
    <span>/</span>
    <a href="/gallery">gallery</a>
  </div>
</header>

<div bind:this={galleryRoot} class="mx-auto flex w-full max-w-full flex-col gap-8 px-4 pt-10 pb-8 sm:px-6 lg:pt-16">
  <div class="flex flex-col items-center justify-center gap-1.5 text-center">
    <h1 class="font-serif text-2xl md:text-6xl italic">Gallery</h1>
    <p class="text-sm font-sans">Different types of captures, from various places</p>
  </div>

  {#if loading}
    <div class:loader-first-visit={firstVisit} class="flex flex-col gap-6 pt-2 pb-4" aria-hidden="true">
      <div class="flex flex-col gap-1.5">
        <p class="font-sans text-[0.72rem] uppercase tracking-[0.18em] opacity-55">loading frames</p>
        <h2 class="font-serif text-[clamp(1.4rem,3vw,2.2rem)] italic leading-[1.05]">Developing the gallery…</h2>
      </div>

      <div class="flex flex-col gap-4">
        {#each loaderRows as row, rowIndex}
          <div class="flex items-stretch gap-4 max-md:flex-col">
            {#each row as item, itemIndex}
              <div
                class="min-w-0 flex-[var(--tile-flex)_1_0%]"
                style={getTileStyle(item.layout, rowIndex * 3 + itemIndex)}
              >
                <div class="loader-shell">
                  <div class="skeleton"></div>
                </div>
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  {:else if error}
    <div class="py-16 text-center">
      <p class="font-serif italic text-gray-400 dark:text-neutral-500">{error}</p>
    </div>
  {:else if photos.length === 0}
    <div class="py-16 text-center">
      <p class="font-serif italic text-gray-400 dark:text-neutral-500">No photos yet — check back soon.</p>
    </div>
  {:else}
    <div class="flex flex-col gap-4">
      {#each photoRows as row, rowIndex}
        <div class="flex items-stretch gap-4 max-md:flex-col">
          {#each row as photo, itemIndex}
            <button
              class="block min-w-0 cursor-zoom-in border-none bg-transparent p-0 flex-[var(--tile-flex)_1_0%] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgba(17,24,39,0.3)] rounded-[1.25rem]"
              style={getTileStyle(photo.layout, rowIndex * 3 + itemIndex)}
              on:click={() => openLightbox(photos.findIndex((item) => item.key === photo.key))}
              aria-label={`View ${photo.alt}`}
            >
              <span class:photo-shell-loaded={photoStates[photo.key] === "loaded"} class="photo-shell">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  data-photo-key={photo.key}
                  loading={rowIndex === 0 ? "eager" : "lazy"}
                  fetchpriority={rowIndex === 0 && itemIndex < 2 ? "high" : "auto"}
                  decoding="async"
                  class="photo-img"
                  on:load={() => markPhotoLoaded(photo.key)}
                  on:error={(event) => handleImageError(event, photo)}
                />
              </span>
            </button>
          {/each}
        </div>
      {/each}

      {#if hasMorePhotos}
        <div class="flex flex-col items-center gap-3 pt-3">
          <button
            class="rounded-full border border-black/10 px-5 py-2 text-xs font-sans uppercase tracking-[0.14em] text-black/70 transition-colors duration-200 hover:bg-black/5 dark:border-white/15 dark:text-white/75 dark:hover:bg-white/8"
            on:click={loadMorePhotos}
          >
            Load more photos
          </button>
          <p class="text-[0.75rem] font-sans text-black/45 dark:text-white/45">
            Showing {visibleCount} of {photos.length}
          </p>
        </div>
      {/if}
    </div>
  {/if}

  <div class="flex w-full items-center justify-end">
    <p class="font-extralight">~by <b class="font-extrabold italic">Gabs</b></p>
  </div>

  <div class="mt-8">
    <Footer />
  </div>
</div>

{#if lightboxPhoto}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="lightbox-backdrop fixed inset-0 z-100 flex cursor-zoom-out items-center justify-center bg-[rgba(10,10,10,0.88)] p-6 backdrop-blur-sm" on:click={closeLightbox}>
    <button
      class="fixed left-4 top-1/2 z-101 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border-none bg-white/12 text-2xl text-white/80 transition-colors duration-200 hover:bg-white/20 hover:text-white max-sm:left-3"
      on:click|stopPropagation={showPreviousPhoto}
      aria-label="Previous photo"
    >
      ←
    </button>

    <div class="flex max-h-[88vh] max-w-[min(90vw,1100px)] cursor-default flex-col items-center gap-3" on:click|stopPropagation>
      <img src={lightboxPhoto.src} alt={lightboxPhoto.alt} class="max-h-[82vh] max-w-full rounded-xl object-contain shadow-[0_20px_60px_rgba(0,0,0,0.5)]" />
      {#if lightboxPhoto.alt}
        <p class="text-center font-sans text-[0.8125rem] italic text-white/50">{lightboxPhoto.alt}</p>
      {/if}
    </div>

    <button
      class="fixed right-4 top-1/2 z-101 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border-none bg-white/12 text-2xl text-white/80 transition-colors duration-200 hover:bg-white/20 hover:text-white max-sm:right-3"
      on:click|stopPropagation={showNextPhoto}
      aria-label="Next photo"
    >
      →
    </button>

    <button class="fixed top-5 right-5 flex size-9 items-center justify-center rounded-full border-none bg-white/12 text-base text-white/75 transition-colors duration-200 hover:bg-white/22 hover:text-white" on:click={closeLightbox} aria-label="Close">✕</button>
  </div>
{/if}

<style>
  .photo-shell,
  .loader-shell {
    position: relative;
    display: block;
    width: 100%;
    aspect-ratio: var(--tile-ratio);
    overflow: hidden;
    border-radius: 1rem;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.55), rgba(0, 0, 0, 0.04));
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.06),
      0 10px 30px rgba(0, 0, 0, 0.05);
  }

  .photo-shell::before,
  .loader-shell::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(120deg, transparent 18%, rgba(255, 255, 255, 0.72) 42%, transparent 68%),
      radial-gradient(circle at 18% 20%, rgba(255, 255, 255, 0.3), transparent 34%);
    transform: translateX(-140%);
    animation: loader-sweep 1.8s ease-in-out infinite;
    animation-delay: var(--tile-delay);
    z-index: 1;
    pointer-events: none;
  }

  .photo-shell-loaded::before {
    opacity: 0;
    animation: none;
  }

  .photo-img {
    position: absolute;
    inset: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 1rem;
    border: 1px solid rgba(0, 0, 0, 0.07);
    background: rgba(0, 0, 0, 0.03);
    opacity: 0;
    transform: scale(1.035);
    transition:
      opacity 360ms ease,
      transform 600ms cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 280ms ease;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.06),
      0 4px 16px rgba(0, 0, 0, 0.05);
  }

  .photo-shell-loaded .photo-img {
    opacity: 1;
    transform: scale(1);
  }

  button:hover .photo-img,
  button:focus-visible .photo-img {
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.09),
      0 14px 38px rgba(0, 0, 0, 0.1);
    transform: scale(1.018);
  }

  .loader-first-visit .loader-shell::before {
    animation-duration: 1.2s;
  }

  .skeleton {
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(135deg, #f2eee9 0%, #ece7e1 35%, #f5f1ed 100%);
    animation: skeleton-breathe 2.4s ease-in-out infinite;
  }

  .lightbox-backdrop {
    animation: lb-in 200ms ease both;
  }

  @keyframes loader-sweep {
    0% {
      transform: translateX(-140%);
    }

    100% {
      transform: translateX(140%);
    }
  }

  @keyframes skeleton-breathe {
    0%,
    100% {
      filter: saturate(1) brightness(1);
    }

    50% {
      filter: saturate(1.03) brightness(1.04);
    }
  }

  @keyframes lb-in {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @media (prefers-color-scheme: dark) {
    .photo-shell,
    .loader-shell {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
      box-shadow:
        0 1px 3px rgba(0, 0, 0, 0.28),
        0 4px 20px rgba(0, 0, 0, 0.28);
    }

    .photo-img {
      border-color: rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.03);
      box-shadow:
        0 1px 3px rgba(0, 0, 0, 0.28),
        0 4px 20px rgba(0, 0, 0, 0.28);
    }

    button:hover .photo-img,
    button:focus-visible .photo-img {
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.4),
        0 14px 38px rgba(0, 0, 0, 0.42);
    }

    .photo-shell::before,
    .loader-shell::before {
      background:
        linear-gradient(120deg, transparent 18%, rgba(255, 255, 255, 0.14) 42%, transparent 68%),
        radial-gradient(circle at 18% 20%, rgba(255, 255, 255, 0.08), transparent 34%);
    }

    .skeleton {
      background: linear-gradient(135deg, #252525 0%, #1d1d1d 35%, #2a2a2a 100%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .photo-shell::before,
    .loader-shell::before,
    .skeleton,
    .lightbox-backdrop {
      animation: none;
      transition: none;
    }

    .photo-img,
    button:hover .photo-img,
    button:focus-visible .photo-img {
      transition: none;
      transform: none;
    }
  }
</style>


