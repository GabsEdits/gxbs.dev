<script>
  import { onMount } from "svelte";
  import Footer from "./Footer.svelte";
  import { initEasterEggs, injectEasterEggStyles } from "../utils/easterEggs";

  let workHistory = [
    {
      company: "fabricators.ltd",
      position: "Jr. Software Engineer",
      logo: "/fab.png",
      startDate: "Nov. 24’",
      endDate: "Present"
    },
    {
      company: "Vanilla OS",
      position: "Volunteer - Engineer",
      logo: "/vos.png",
      startDate: "Jul. 24’",
      endDate: "Present"
    },
    {
      company: "Bottles",
      position: "Volunteer - Engineer",
      logo: "/bottles.png",
      startDate: "Oct. 24’",
      endDate: "Present"
    }
  ];

  let achievements = [
    {
      title: "IT Spec. - HTML5 App Development",
      link: "https://www.credly.com/badges/7b064a7b-40ae-4fa8-891f-134fda3fabb4/public_url",
      description: "Certification",
      date: "Oct. 24'"
    },
    {
      title: "IT Spec. - Databases",
      link: "https://www.credly.com/badges/484c7451-0c30-48fe-aa9d-16e4ff708c7d/public_url",
      description: "Certification",
      date: "Aug. 25'"
    },
    {
      title: "GitHub Foundations",
      link: "https://www.credly.com/badges/bed86599-e2cc-443a-87fd-856d04d1cd3f/public_url",
      description: "Certification",
      date: "May. 25'"
    },
    {
      title: "InfoMatrix - Platinum",
      link: "https://infomatrix.world",
      description: "Competition",
      date: "May. 25'"
    },
    {
      title: "Moldsef - III Place",
      link: "https://ance.gov.md/sites/default/files/document/attachments/mold_sef_2026_premianti.pdf",
      description: "Competition",
      date: "Feb. 26'"
    }
  ];

  let projects = [
    {
      title: "Steno",
      link: "https://github.com/stenodevs/steno",
      description: "SSG build with Deno",
      date: "/ 25'"
    },
    {
      title: "Aplós",
      link: "https://aplos.gxbs.dev",
      description: "VitePress theme",
      date: "/ 24'"
    },
    {
      title: "@feed/feed",
      link: "https://jsr.io/@feed/feed",
      description: "Feed generator for Deno",
      date: "/ 25'"
    }
  ];

  const boldSkills = new Set([
    "vue.js",
    "svelte",
    "deno",
    "tailwind",
    "typescript"
  ]);

  let skills = [
    "vue.js",
    "next.js",
    "astro",
    "release management",
    "docker",
    "git",
    "nuxt",
    "vite",
    "react",
    "svelte",
    "fresh.js",
    "gh actions",
    "sql",
    "node.js",
    "deno",
    "devops",
    "tailwind",
    "sass",
    "liquid",
    "typescript",
    "javascript"
  ];

  const lineTargets = [42, 46, 48, 48];

  const ICON_WIDTH = 45;
  const ICON_HEIGHT = 21;
  const INTRO_DURATION = 1200;
  const ICON_TRIGGER_SCROLL = 100;
  const ICON_TRAVEL_DURATION = 760;
  const MOLDOVA_TIMEZONE = "Europe/Chisinau";

  const moldovaTimeFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: MOLDOVA_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const moldovaPartsFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: MOLDOVA_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short"
  });

  let heroIconAnchor;
  let targetIconAnchor;
  let iconReady = false;
  let reduceMotion = false;
  let revealEnabled = false;
  let introDone = false;
  let iconX = 0;
  let iconY = 0;
  let iconProgress = 0;
  let iconTravelStart = 0;
  let iconTravelTriggered = false;
  let iconTravelRafId;
  let contentRoot;
  let scrolled = false;
  let hintVisible = false;
  let moldovaTime = "";
  let moldovaZone = "";
  let hoverFlag = "trans";
  let hoverFlagQueue = [];


  $: orderedSkills = [...skills].sort((a, b) => {
    const lengthDiff = a.length - b.length;
    return lengthDiff !== 0 ? lengthDiff : a.localeCompare(b);
  });

  let skillLines = [];

  $: {
    skillLines = [];
    let index = 0;

    for (const target of lineTargets) {
      let line = [];
      let lineLength = 0;

      while (index < orderedSkills.length) {
        const skill = orderedSkills[index];
        const extraLength = line.length === 0 ? skill.length : skill.length + 2;

        if (line.length > 0 && lineLength + extraLength > target) break;

        line = [...line, skill];
        lineLength += extraLength;
        index += 1;
      }

      if (line.length) {
        skillLines = [...skillLines, line];
      }
    }

    if (index < orderedSkills.length) {
      skillLines = [...skillLines, orderedSkills.slice(index)];
    }
  }

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

  const nextHoverFlag = () => {
    // Shuffle a tiny bag so every 2 hovers show both flags in random order.
    if (hoverFlagQueue.length === 0) {
      hoverFlagQueue = Math.random() < 0.5
        ? ["trans", "aroace"]
        : ["aroace", "trans"];
    }

    hoverFlag = hoverFlagQueue.pop();
  };

  const getAnchorPosition = (element) => {
    const rect = element.getBoundingClientRect();

    return {
      x: rect.left + rect.width / 2 - ICON_WIDTH / 2,
      y: rect.top + rect.height / 2 - ICON_HEIGHT / 2
    };
  };

  const updateIconPosition = (timestamp = performance.now()) => {
    if (!heroIconAnchor || !targetIconAnchor) return;

    const start = getAnchorPosition(heroIconAnchor);
    const end = getAnchorPosition(targetIconAnchor);

    if (reduceMotion) {
      iconTravelTriggered = window.scrollY >= ICON_TRIGGER_SCROLL;
      iconProgress = iconTravelTriggered ? 1 : 0;
    } else if (!introDone) {
      iconProgress = 0;
    } else {
      if (!iconTravelTriggered && window.scrollY >= ICON_TRIGGER_SCROLL) {
        iconTravelTriggered = true;
        iconTravelStart = timestamp;
      }

      if (iconTravelTriggered && iconProgress < 1) {
        const travelProgress = clamp(
          (timestamp - iconTravelStart) / ICON_TRAVEL_DURATION,
          0,
          1
        );
        iconProgress = easeOutCubic(travelProgress);

        if (travelProgress < 1 && !iconTravelRafId) {
          iconTravelRafId = requestAnimationFrame((nextTimestamp) => {
            iconTravelRafId = undefined;
            updateIconPosition(nextTimestamp);
          });
        }
      }
    }

    iconX = start.x + (end.x - start.x) * iconProgress;
    iconY = start.y + (end.y - start.y) * iconProgress;
    iconReady = true;
  };

  const updateMoldovaTime = () => {
    const now = new Date();
    const parts = moldovaPartsFormatter.formatToParts(now);

    moldovaTime = moldovaTimeFormatter.format(now);
    moldovaZone = parts.find((part) => part.type === "timeZoneName")?.value ?? "EET";
  };

  onMount(() => {
    // Initialize Easter eggs
    injectEasterEggStyles();
    const cleanupEasterEggs = initEasterEggs();

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotion = media.matches;
    const revealNodes = contentRoot
      ? [...contentRoot.querySelectorAll("[data-reveal]")]
      : [];

    const markNodeVisible = (node) => {
      node.dataset.visible = "true";
    };

    const isNodeVisible = (node) => node.dataset.visible === "true";

    let revealObserver;

    let ticking = false;
    let moldovaTickTimeout;
    let moldovaTickInterval;

    const requestUpdate = () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        updateIconPosition();
      });
    };

    const handleMotionChange = (event) => {
      reduceMotion = event.matches;

      if (reduceMotion && iconTravelRafId) {
        cancelAnimationFrame(iconTravelRafId);
        iconTravelRafId = undefined;
      }

      requestUpdate();

      if (reduceMotion) {
        revealEnabled = false;
        revealObserver?.disconnect();
        revealNodes.forEach(markNodeVisible);
        return;
      }

      revealEnabled = true;
      revealObserver?.disconnect();
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            markNodeVisible(entry.target);
            revealObserver?.unobserve(entry.target);
          });
        },
        {
          threshold: 0.18,
          rootMargin: "0px 0px -10% 0px"
        }
      );

      revealNodes.forEach((node) => {
        if (!isNodeVisible(node)) {
          revealObserver?.observe(node);
        }
      });
    };

    let introRafId;
    const trackDuringIntro = () => {
      updateIconPosition();
      if (!introDone) introRafId = requestAnimationFrame(trackDuringIntro);
    };

    requestAnimationFrame(() => {
      handleMotionChange({ matches: reduceMotion });
      introRafId = requestAnimationFrame(trackDuringIntro);
    });

    updateMoldovaTime();
    moldovaTickTimeout = window.setTimeout(() => {
      updateMoldovaTime();
      moldovaTickInterval = window.setInterval(updateMoldovaTime, 60_000);
    }, 60_000 - (Date.now() % 60_000));

    const introTimer = window.setTimeout(() => {
      introDone = true;
      cancelAnimationFrame(introRafId);
      requestUpdate();
    }, INTRO_DURATION);

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    media.addEventListener("change", handleMotionChange);

    const handleScrollHide = () => {
      if (window.scrollY > 10) scrolled = true;
    };
    window.addEventListener("scroll", handleScrollHide, { passive: true });

    const hintTimer = window.setTimeout(() => { hintVisible = true; }, 1400);

    return () => {
      cleanupEasterEggs();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("scroll", handleScrollHide);
      window.removeEventListener("resize", requestUpdate);
      media.removeEventListener("change", handleMotionChange);
      revealObserver?.disconnect();
      cancelAnimationFrame(introRafId);
      if (iconTravelRafId) {
        cancelAnimationFrame(iconTravelRafId);
      }
      window.clearTimeout(moldovaTickTimeout);
      window.clearInterval(moldovaTickInterval);
      window.clearTimeout(introTimer);
      window.clearTimeout(hintTimer);
    };
  });


</script>

<div class="relative grid h-screen w-full place-items-center overflow-hidden px-4">
  <div class="relative inline-block">
    <h1
      class="hero-name text-center text-5xl leading-none sm:text-7xl -ml-12.5 sm:ml-0 transition-all"
      data-easter-hero-name
      title="Try clicking me"
    >
      Gabriel <b class="italic">Cozma</b>
    </h1>
    <span
      bind:this={heroIconAnchor}
      class="pointer-events-none absolute bottom-3 left-[calc(100%+0.5rem)] inline-flex h-5.25 w-11.25"
      aria-hidden="true"
    ></span>
  </div>
  <div class="scroll-hint absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 select-none" aria-hidden="true" class:visible={hintVisible && !scrolled}>
    <p class="font-serif italic text-sm text-gray-400">scroll</p>
    <span class="scroll-arrow text-gray-300 text-base leading-none">↓</span>
  </div>
</div>

<div
  class="ecliptic-icon fixed left-0 top-0 z-40 will-change-transform transition-opacity duration-300 cursor-pointer pointer-events-auto"
  class:flag-trans={hoverFlag === "trans"}
  class:flag-aroace={hoverFlag === "aroace"}
  class:opacity-0={!iconReady}
  style={`transform: translate3d(${iconX}px, ${iconY}px, 0);`}
  data-easter-svg-icon
  role="button"
  tabindex="0"
  title="Click to spin"
  on:mouseenter={nextHoverFlag}
  on:focus={nextHoverFlag}
>
  <img
    src="/ecliptic.svg"
    alt=""
    class="ecliptic-base h-5.25 w-11.25 dark:invert hover:animate-spin"
    class:hero-icon-intro={!reduceMotion}
  />
  <span class="ecliptic-trans-overlay" aria-hidden="true"></span>
</div>

<main bind:this={contentRoot} class="container mx-auto max-w-full lg:max-w-120 p-4 flex flex-col gap-12 items-center lg:py-24 font-serif" class:reveal-enabled={revealEnabled}>
  <div class="h-6 flex items-center justify-center">
    <div bind:this={targetIconAnchor} class="h-5.25 w-11.25" aria-hidden="true"></div>
  </div>

  <!-- Intro -->
  <div class="flex flex-col items-center justify-center gap-12 w-full">
    <h1 class="text-3xl text-center" data-reveal style="--reveal-delay: 600ms;">
      <i>Software Engineer & OSS Contributor</i>, based in <span class="font-extralight">Moldova.</span>
    </h1>

    <p class="text-2xl text-center max-w-[80%]" data-reveal style="--reveal-delay: 1000ms;">
      Focused on delivering intuitive and visually appealing web experiences through <i>clean, minimalist design</i>.
    </p>

    <hr class="divider w-full" />
  </div>

  <!-- History -->
  <div class="flex flex-col items-center justify-center gap-16 w-full" data-reveal style="--reveal-delay: 1400ms;">
    <h3 class="italic text-xl">History</h3>
    <ul class="flex flex-col gap-4 w-full">
      {#each workHistory as item, index}
        <li
          class="interactive-row flex w-full flex-row items-center justify-between gap-3 self-stretch"
          data-reveal
          style={`--reveal-delay: ${200 + index * 90}ms;`}
        >
          <div class="flex min-w-0 flex-row items-center gap-4">
            <img src="{item.logo}" alt="{item.company}" class="size-12 rounded-lg dark:invert" />
            <div class="flex w-full min-w-0 flex-col items-start gap-2">
              <h4 class="text-xl font-extrabold italic">{item.company}</h4>
              <p class="text-lg">{item.position}</p>
            </div>
          </div>
          <p class="text-lg font-normal font-sans text-left sm:text-right">{item.startDate} - <br>{item.endDate}</p>
        </li>
      {/each}
    </ul>
    <ul class="flex flex-col gap-4 w-full">
      {#each achievements as item, index}
        <li
          class="interactive-row flex w-full flex-col items-start justify-between gap-3 self-stretch sm:flex-row sm:items-center"
          data-reveal
          style={`--reveal-delay: ${520 + index * 90}ms;`}
        >
          <div class="flex min-w-0 flex-row items-center gap-4">
            <div class="flex w-full min-w-0 flex-col items-start gap-2">
              <a
                href="{item.link}"
                target="_blank"
                rel="noreferrer"
                class="micro-link text-xl font-extrabold italic"
              >{item.title}</a>
              <p class="text-lg">{item.description}</p>
            </div>
          </div>
          <p class="text-lg font-normal font-sans text-left sm:text-right">{item.date}</p>
        </li>
      {/each}
    </ul>
    <hr class="divider w-full" />
  </div>

  <!-- Projects -->
  <div class="flex flex-col items-center justify-center gap-16 w-full" data-reveal style="--reveal-delay: 120ms;">
    <h3 class="italic text-xl">Selected Works</h3>
    <ul class="flex flex-col gap-4 w-full">
      {#each projects as item, index}
        <li
          class="interactive-row flex w-full flex-row items-center justify-between gap-3 self-stretch"
          data-reveal
          style={`--reveal-delay: ${180 + index * 90}ms;`}
        >
          <div class="flex min-w-0 flex-row items-center gap-4">
            <div class="flex w-full min-w-0 flex-col items-start gap-2">
              <a
                href="{item.link}"
                target="_blank"
                rel="noreferrer"
                class="micro-link text-xl font-extrabold italic"
              >{item.title}</a>
              <p class="text-lg">{item.description}</p>
            </div>
          </div>
          <p class="text-lg font-normal font-sans text-left sm:text-right">{item.date}</p>
        </li>
      {/each}
    </ul>
    <a href="/projects" class="micro-link text-lg">View all projects <span class="arrow-nudge">→</span></a>

    <hr class="divider w-full" />
  </div>

  <!-- Skills -->
  <div class="flex flex-col items-center justify-center gap-12 w-full" data-reveal style="--reveal-delay: 160ms;">
    <h3 class="italic text-xl">Skills</h3>
    <p class="text-lg text-center font-normal font-sans">
      {#each skillLines as line, lineIndex}
        {#each line as skill, index}
          <span class="ml-1" class:font-bold={boldSkills.has(skill)}>{skill}</span>
          {#if index < line.length - 1},{/if}
        {/each}
        {#if lineIndex < skillLines.length - 1}<br>{/if}
      {/each}
    </p>

    <hr class="divider w-full" />
  </div>

  <!-- Contact -->
  <div class="flex flex-col items-center justify-center gap-12 w-full" data-reveal style="--reveal-delay: 210ms;">
    <h3 class="italic text-xl">Contact</h3>
    <p
      class="local-time-line"
      aria-live="polite"
      aria-label={moldovaTime ? `Current local time in Chișinău is ${moldovaTime} ${moldovaZone}` : "Loading local time in Chișinău"}
    >
      <span class="local-time-value animate-pulse">{moldovaTime || "--:--"}</span>
      <span aria-hidden="true" class="opacity-60">·</span>
      <span class="text-xs font-extralight uppercase opacity-70">({moldovaZone || "EET"})</span>
    </p>
    <div class="flex flex-row flex-wrap gap-6 items-center justify-center">
      <p class="text-lg text-center">
        <b>Blog:</b> <a href="/blog" class="micro-link font-extralight font-sans italic">/blog</a>
      </p>
      <p class="text-lg text-center">
        <b>GitHub:</b>
        <a href="https://github.com/GabsEdits" class="micro-link font-extralight font-sans italic">gabsedits</a>
      </p>
      <p class="text-lg text-center">
        <b>Discord:</b>
        <a href="https://discord.com/users/841649648606249021" class="micro-link font-extralight font-sans italic">gabsme</a>
      </p>
      <p class="text-lg text-center">
        <b>Email:</b> <a href="mailto:me@gxbs.dev" class="micro-link font-extralight font-sans italic">me@gxbs.dev</a>
      </p>
      <p class="text-lg text-center">
        <b>Keyoxide:</b>
        <a href="https://keyoxide.com" class="micro-link font-extralight font-sans italic">me@gxbs.dev</a>
      </p>
    </div>

    <a href="/partnerships"
       class="group flex items-center gap-3 px-5 py-2.5 mt-2 border border-gray-900/10 dark:border-white/10 rounded-full transition-all hover:bg-gray-900/5 dark:hover:bg-white/5 cursor-pointer text-xs font-medium font-sans uppercase opacity-75 hover:opacity-100"
       style="text-decoration: none; --reveal-delay: 1100ms;"
       data-reveal>
      <span class="relative flex h-2 w-2">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sienna opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-sienna-600"></span>
      </span>
      <span>Interested in working together?</span>
      <span class="font-serif text-sm italic lowercase tracking-normal transform transition-transform duration-300 group-hover:translate-x-1">→</span>
    </a>

    <hr class="divider w-full" />
  </div>

  <!-- Sponsors -->
  <div class="flex flex-col items-center justify-center gap-12 w-full" data-reveal style="--reveal-delay: 260ms;">
    <h3 class="italic text-xl">Backed by</h3>
    <div class="flex w-full flex-wrap items-center justify-center gap-6 sm:gap-12">
      <a
        class="micro-link sponsor-link text-center text-2xl font-extrabold italic sm:text-3xl"
        href="https://bromb.in"
        target="_blank"
        rel="noreferrer"
      >
        bromb.in
      </a>
      <a
        class="micro-link sponsor-link text-center text-2xl font-extrabold italic sm:text-3xl"
        href="https://tuta.com"
        target="_blank"
        rel="noreferrer"
      >
        tuta.com
      </a>
      <a
        class="micro-link sponsor-link text-center text-2xl font-extrabold italic sm:text-3xl"
        href="https://daudix.one"
        target="_blank"
        rel="noreferrer"
      >
        daudix.one
      </a>
    </div>
  </div>

  <Footer />
</main>

<style>
  .hero-name {
    opacity: 0;
    transform: translateY(20px) scale(0.985);
    animation: hero-name-in 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) 0.12s forwards;
  }

  .hero-name b {
    display: inline-block;
    opacity: 0;
    transform: translateY(18px);
    animation: hero-name-in 0.72s cubic-bezier(0.2, 0.7, 0.2, 1) 0.26s forwards;
  }

  .scroll-hint {
    opacity: 0;
    transition: opacity 500ms ease;
  }

  .scroll-hint.visible {
    opacity: 1;
  }

  .scroll-arrow {
    animation: arrow-bob 1.8s ease-in-out infinite 2s;
  }

  .hero-icon-intro {
    opacity: 0;
    transform: scale(0.75) translateY(-8px);
    animation: ecliptic-in 0.72s cubic-bezier(0.2, 0.8, 0.2, 1) 0.7s forwards;
  }

  .ecliptic-icon {
    position: fixed;
    isolation: isolate;
    width: 45px;
    height: 21px;
  }

  .ecliptic-base {
    display: block;
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 1;
    transition: opacity 280ms ease;
  }

  .ecliptic-trans-overlay {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    z-index: 2;
    pointer-events: none;
    opacity: 0;
    transition: opacity 320ms ease;
    overflow: hidden;
    --flag-gradient: linear-gradient(
      110deg,
      #5bcefa 0%,
      #5bcefa 12%,
      #f5a9b8 24%,
      #ffffff 38%,
      #f5a9b8 52%,
      #5bcefa 66%,
      #f5a9b8 80%,
      #ffffff 90%,
      #f5a9b8 96%,
      #5bcefa 100%
    );
    background-image: var(--flag-gradient);
    background-size: 220% 100%;
    background-position: 0 50%;
    -webkit-mask-image: url("/ecliptic.svg");
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center;
    -webkit-mask-size: 100% 100%;
    mask-image: url("/ecliptic.svg");
    mask-repeat: no-repeat;
    mask-position: center;
    mask-size: 100% 100%;
    animation: trans-gradient-drift 4.2s linear infinite;
    will-change: background-position, opacity;
  }

  .ecliptic-icon.flag-trans .ecliptic-trans-overlay {
    --flag-gradient: linear-gradient(
      110deg,
      #5bcefa 0%,
      #5bcefa 12%,
      #f5a9b8 24%,
      #ffffff 38%,
      #f5a9b8 52%,
      #5bcefa 66%,
      #f5a9b8 80%,
      #ffffff 90%,
      #f5a9b8 96%,
      #5bcefa 100%
    );
  }

  .ecliptic-icon.flag-aroace .ecliptic-trans-overlay {
    --flag-gradient: linear-gradient(
      110deg,
      #e28c00 0%,
      #e28c00 12%,
      #eccd00 24%,
      #ffffff 38%,
      #62afdd 52%,
      #203856 66%,
      #62afdd 80%,
      #ffffff 90%,
      #eccd00 96%,
      #e28c00 100%
    );
  }

  .ecliptic-icon:hover .ecliptic-base,
  .ecliptic-icon:focus-visible .ecliptic-base {
    opacity: 0.95;
  }

  .ecliptic-icon:hover .ecliptic-trans-overlay,
  .ecliptic-icon:focus-visible .ecliptic-trans-overlay {
    opacity: 0.3;
  }

  .divider {
    border: none;
    height: 1px;
    background-color: #e5e7eb;
  }

  .interactive-row {
    border-radius: 0.8rem;
    margin-inline: -0.4rem;
    padding: 0.4rem;
  }

  .local-time-line {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    margin-top: -0.25rem;
    margin-bottom: -0.15rem;
  }

  .local-time-value {
    font-size: 1rem;
    font-style: italic;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.01em;
  }

  .micro-link {
    position: relative;
    text-decoration: none;
    text-underline-offset: 0.22em;
  }

  .micro-link::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -0.08em;
    width: 100%;
    height: 1px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 260ms cubic-bezier(0.19, 1, 0.22, 1);
  }

  .micro-link:hover::after,
  .micro-link:focus-visible::after {
    transform: scaleX(1);
  }

  .micro-link:focus-visible {
    outline: 2px solid rgba(17, 24, 39, 0.35);
    outline-offset: 4px;
    border-radius: 4px;
  }

  .arrow-nudge {
    display: inline-block;
    transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .micro-link:hover .arrow-nudge,
  .micro-link:focus-visible .arrow-nudge {
    transform: translateX(3px);
  }

  .sponsor-link {
    transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .sponsor-link:hover,
  .sponsor-link:focus-visible {
    transform: translateY(-2px) scale(1.02);
  }

  .reveal-enabled [data-reveal] {
    opacity: 0;
    filter: blur(2px);
    transform: translateY(16px);
    transition:
      opacity 560ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 560ms cubic-bezier(0.22, 1, 0.36, 1),
      filter 560ms cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: var(--reveal-delay, 0ms);
  }

  :global(.reveal-enabled [data-reveal][data-visible="true"]) {
    opacity: 1;
    filter: none;
    transform: translateY(0);
  }

  @keyframes arrow-bob {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(4px); }
  }

  @keyframes hero-name-in {
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes ecliptic-in {
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes trans-gradient-drift {
    0% {
      background-position: 0 50%;
    }
    100% {
      background-position: 220% 50%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-name,
    .hero-name b,
    .hero-icon-intro,
    .scroll-arrow,
    .reveal-enabled [data-reveal] {
      animation: none;
      opacity: 1;
      filter: none;
      transform: none;
      transition: none;
    }

    .scroll-hint {
      opacity: 1;
      transition: none;
    }

    .divider {
      animation: none;
      background-size: 100% 100%;
    }

    .micro-link::after {
      transition: none;
      transform: scaleX(1);
    }

    .ecliptic-icon:hover .ecliptic-trans-overlay,
    .ecliptic-icon:focus-visible .ecliptic-trans-overlay {
      animation: none;
    }

    .ecliptic-trans-overlay {
      animation: none;
    }

    .ecliptic-trans-overlay {
      background-position: 50% 50%;
    }
  }

  @media (prefers-color-scheme: dark) {
    .divider {
      background-color: oklch(26.9% 0 0);
    }
  }
</style>
