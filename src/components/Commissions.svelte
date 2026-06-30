<script>
  import { onMount } from "svelte";
  import Footer from "./Footer.svelte";
  import { pb } from "../lib/pocketbase";

  let slotsData = null;
  let slotsLoading = true;
  let slotsError = false;

  const ENGAGEMENT_OPTIONS = [
    "Design",
    "Development",
    "Full Package"
  ];

  let builderType = "";
  let builderScale = ""; // This will now directly hold "Core", "Presence", or "System"
  let builderInfrastructure = false;
  let builderUpkeep = false;

  const PRICES = {
    "Design": { Core: 200, Presence: 450, System: 950 },
    "Development": { Core: 300, Presence: 700, System: 1500 },
    "Full Package": { Core: 420, Presence: 1050, System: 2200 }
  };

  $: builderPrice = (() => {
    if (!builderType || !builderScale) return null;
    let base = PRICES[builderType]?.[builderScale] ?? 0;

    if (builderInfrastructure) base += 80;
    if (builderUpkeep) base += 200;

    return base;
  })();

  $: builderReady =
    !!builderType &&
    !!builderScale;

  $: startingPrice = (() => {
    if (builderPrice !== null) return builderPrice;
    if (!builderScale) return null;
    if (builderType) return PRICES[builderType]?.[builderScale] ?? null;
    const m = Math.min(
      ...ENGAGEMENT_OPTIONS.map((option) => PRICES[option]?.[builderScale] ?? Infinity)
    );
    return m === Infinity ? null : m;
  })();

  $: priceIsExact = builderPrice !== null;

  const faqs = [
    {
      q: "How long will our engagement take?",
      a: "Timeline depends on scope and feedback speed. Most Core projects ship in 1 to 2 weeks, Presence projects in 2 to 4 weeks, and System projects in 4 to 8 weeks."
    },
    {
      q: "What is included in every partnership?",
      a: "Every project includes strategy alignment, structured creative reviews, performance-first implementation, and a polished handoff package with everything you need after launch."
    },
    {
      q: "Do I own the code and intellectual property?",
      a: "Absolutely. Once the project is finalized and paid in full, you receive total ownership of the repository, source code, and Figma design files."
    },
    {
      q: "Can we build on top of what I already have?",
      a: "Yes. Share your current website or tools in the brief and I will audit what can be reused, improved, or replaced before we begin."
    },
    {
      q: "Do you operate under NDA?",
      a: "Yes, confidentiality is paramount. I am fully open to signing Non-Disclosure Agreements for sensitive intellectual property. Let me know during your request."
    },
    {
      q: "What if the project scope expands?",
      a: "We accommodate growth seamlessly. Should you need additional features or more than the 3 included creative revisions, we will transparently scope and agree upon the addendum before proceeding."
    }
  ];

  let showForm = false;
  let formName = "";
  let formEmail = "";
  let formType = "";
  let formScale = "";
  let formDetails = "";
  let formHoneypot = "";
  let submitText = "Initiate Project";
  let formError = "";
  let submitting = false;

  let revealEnabled = false;
  let reduceMotion = false;
  let contentRoot;
  const selectedWorks = [
    { name: "bromb.in", type: "Brand & Development" },
    { name: "gxbs.dev", type: "Personal Identity" },
    { name: "Steno", type: "OSS Tool & DX" },
    { name: "Ecliptic", type: "Brand System" },
    { name: "fabricators.ltd", type: "Website" }
  ];

  const fetchSlots = async () => {
    try {
      // Assumes a 'slots' collection in PocketBase
      const records = await pb.collection('slots').getFullList();
      
      const map = {};
      for (const slot of records) {
        map[slot.name.replace(/\s+/g, "").toLowerCase()] = slot;
      }

      slotsData = {
        smallScale: map["smallscale"] ?? null,
        mediumScale: map["mediumscale"] ?? null,
        largeScale: map["largescale"] ?? null
      };
    } catch {
      slotsError = true;
    } finally {
      slotsLoading = false;
    }
  };

  const buildAndOpen = () => {
    formType = builderType;
    formScale = builderScale;
    const extras = [
      builderInfrastructure ? "Include Deployment Concierge (Setup & Docs)." : "",
      builderUpkeep ? "Include Priority Upkeep (Annual Maintenance)." : ""
    ].filter(Boolean);
    formDetails =
      `${builderScale} tier for ${builderType}.\n` +
      (extras.length ? "\n" + extras.join("\n") : "");
    openForm();
  };

  const openForm = () => {
    showForm = true;
    document.body.style.overflow = "hidden";
  };

  const closeForm = () => {
    showForm = false;
    document.body.style.overflow = "";
  };

  const sendForm = async () => {
    if (formHoneypot) return;
    if (!formName || !formEmail || !formType || !formScale || !formDetails) {
      formError = "Please fill out all required fields to proceed.";
      return;
    }
    formError = "";
    submitting = true;
    submitText = "Encrypting & Sending...";

    try {
      // Assumes a 'commissions' collection in PocketBase
      await pb.collection('commissions').create({
        clientName: formName,
        clientEmail: formEmail,
        offer: formType,
        tier: formScale,
        brief: formDetails,
        status: "new",
        addons: [
          builderInfrastructure ? "Launch Support" : "",
          builderUpkeep ? "Care Plan" : "",
        ].filter(Boolean).join(", "),
        // PocketBase handles IDs and Timestamps automatically
      });

      formName = "";
      formEmail = "";
      formType = "";
      formScale = "";
      formDetails = "";
      submitText = "Received. I will be in touch shortly.";
      window.setTimeout(() => {
        submitText = "Initiate Project";
        submitting = false;
        closeForm();
      }, 2500);
    } catch {
      formError = "An error occurred. Please try again.";
      submitText = "Initiate Project";
      submitting = false;
    }
  };

  onMount(() => {
    fetchSlots();

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotion = media.matches;

    const nodes = contentRoot ? [...contentRoot.querySelectorAll("[data-reveal]")] : [];
    const mark = (n) => {
      n.dataset.visible = "true";
    };
    const marked = (n) => n.dataset.visible === "true";

    let observer;
    if (reduceMotion) {
      nodes.forEach(mark);
    } else {
      revealEnabled = true;
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            mark(e.target);
            observer.unobserve(e.target);
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
      );
      nodes.forEach((n) => {
        if (!marked(n)) observer.observe(n);
      });
    }

    const onEsc = (e) => {
      if (e.key === "Escape" && showForm) closeForm();
    };
    const onMotion = (e) => {
      reduceMotion = e.matches;
      if (reduceMotion) {
        revealEnabled = false;
        nodes.forEach(mark);
      }
    };

    document.addEventListener("keydown", onEsc);
    media.addEventListener("change", onMotion);

    return () => {
      observer?.disconnect();
      document.removeEventListener("keydown", onEsc);
      media.removeEventListener("change", onMotion);
      document.body.style.overflow = "";
    };
  });
</script>

<main
  bind:this={contentRoot}
  class="w-full overflow-x-hidden font-serif"
  class:reveal-enabled={revealEnabled}
>

  <nav class="absolute inset-x-0 top-0 z-[100] flex items-center justify-end px-12 py-10 lg:px-10">
    <div class="font-neue flex items-center justify-center gap-2 text-sm font-medium">
      <a href="/"><img src="/ecliptic.svg" alt="" aria-hidden="true" class="h-5 dark:invert" /></a>
      <span class="opacity-30">/</span>
      <a href="/partnerships" class="opacity-60">partnerships</a>
    </div>
  </nav>

  <!-- ── 2. Hero ────────────────────────────────────────────────── -->
  <section class="relative flex min-h-[100svh] flex-col justify-end">
    <div class="mx-auto w-full max-w-5xl px-8 pb-16 pt-20 lg:px-16">
      <h1 class="font-neue m-0 text-[clamp(5rem,12vw,9.5rem)] italic leading-[0.9] tracking-[-0.03em]">Let's work<br><span class="font-editorial">together</span>.</h1>
      <hr class="mt-10 h-px w-full border-none bg-[rgba(17,24,39,0.1)] dark:bg-[rgba(255,255,255,0.08)]" />
      <div class="mt-6 flex flex-wrap items-end justify-between gap-8">
        <p class="font-neue m-0 max-w-[45ch] text-[1.05rem] font-light italic leading-[1.65] opacity-70">Outcome-focused websites and digital systems designed to move your business forward.</p>
        <div class="flex flex-col gap-1" aria-live="polite">
          {#if slotsLoading}
            <p class="font-neue m-0 animate-pulse text-[0.7rem] italic opacity-30">Checking availability…</p>
          {:else if slotsError || !slotsData}
            <span class="font-neue text-[0.7rem] opacity-30">—</span>
          {:else}
            {#each [
              { label: "Core",     data: slotsData.smallScale  },
              { label: "Presence", data: slotsData.mediumScale },
              { label: "System",   data: slotsData.largeScale  },
            ] as { label, data }}
              <div class="slot-row flex justify-between gap-8" class:slot-full={data?.available === 0}>
                <span class="font-neue text-[0.68rem] font-medium opacity-45">{label}</span>
                <span class="slot-count font-neue text-[0.68rem] font-medium tabular-nums opacity-45">{data?.available ?? "?"}/{data?.total ?? "?"}</span>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
    <div class="font-neue pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2 animate-[bob_2.6s_ease-in-out_infinite] text-[0.7rem] font-light opacity-20" aria-hidden="true">↓</div>
  </section>

  <!-- ── 3. Sentence + 4. Price ─────────────────────────────────── -->
  <section class="mx-auto w-full max-w-5xl px-8 py-20 lg:px-16" data-reveal>
    <hr class="h-px w-full border-none bg-[rgba(17,24,39,0.1)] dark:bg-[rgba(255,255,255,0.08)]" />
    <p class="font-neue mt-7 text-[0.62rem] font-medium uppercase tracking-[0.28em] opacity-30">build your project</p>

    <div class="relative mt-12 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_auto]">
      <p class="font-editorial m-0 max-w-[26ch] text-[clamp(2.2rem,4vw,3.2rem)] italic leading-[1.3] tracking-[-0.02em]">
        I am looking for a
        <button
          type="button"
          class="border-0 border-b-2 border-black dark:border-white bg-transparent px-0 text-inherit font-bold transition-opacity hover:opacity-65"
          on:click={() => {
            const tiers = ["Core", "Presence", "System"]; // Changed to actual tier names
            const idx = tiers.indexOf(builderScale);
            builderScale = tiers[(idx + 1) % tiers.length];
          }}
        >{#key builderScale}<span class="inline animate-[word-swap_180ms_ease]">{#if !builderScale}<span class="opacity-40">a scope</span>{:else}{builderScale}{/if}</span>{/key}</button><sup class="font-neue ml-[0.15em] align-super text-[0.45em] font-light not-italic opacity-40">↕</sup>
        <br>project, focusing on
        <button
          type="button"
          class="border-0 border-b-2 border-black dark:border-white bg-transparent px-0 text-inherit font-bold transition-opacity hover:opacity-65"
          on:click={() => {
            const types = ["Design", "Development", "Full Package"];
            const idx = types.indexOf(builderType);
            builderType = types[(idx + 1) % types.length];
          }}
        >{#key builderType}<span class="inline animate-[word-swap_180ms_ease]">{#if !builderType}<span class="opacity-40">a focus</span>{:else}{builderType}{/if}</span>{/key}</button><sup class="font-neue ml-[0.15em] align-super text-[0.45em] font-light not-italic opacity-40">↕</sup>,<br> with
        <button
          type="button"
          class="border-0 border-b-2 border-black dark:border-white bg-transparent px-0 text-inherit font-bold transition-opacity hover:opacity-65"
          on:click={() => {
            if (!builderInfrastructure && !builderUpkeep) { builderInfrastructure = true; builderUpkeep = false; }
            else if (builderInfrastructure && !builderUpkeep) { builderInfrastructure = false; builderUpkeep = true; }
            else if (!builderInfrastructure && builderUpkeep) { builderInfrastructure = true; builderUpkeep = true; }
            else { builderInfrastructure = false; builderUpkeep = false; }
          }}
        >{#key `${builderInfrastructure}-${builderUpkeep}`}<span class="inline animate-[word-swap_180ms_ease]">{builderInfrastructure && builderUpkeep ? "both add-ons" : builderInfrastructure ? "launch support" : builderUpkeep ? "a care plan" : "nothing extra"}</span>{/key}</button><sup class="font-neue ml-[0.15em] align-super text-[0.45em] font-light not-italic opacity-40">↕</sup>.
      </p>

      <div
        class="font-neue pointer-events-none flex flex-col items-end pt-2 text-right transition-opacity duration-[400ms]"
        class:hint-hidden={builderScale || builderType || builderInfrastructure || builderUpkeep}
      >
        <span class="font-mono text-[0.6rem] opacity-25">&lt;---------</span>
        <span class="text-[0.65rem] font-light opacity-35">click to cycle</span>
      </div>
    </div>

    <!-- ── 4. Price block ──────────────────────────────────────── -->
    <div class="mt-10">
      <hr class="h-px w-full border-none bg-[rgba(17,24,39,0.1)] dark:bg-[rgba(255,255,255,0.08)]" />
      <div class="mt-8">
        {#if startingPrice !== null}
          <div>
            <p class="font-neue mb-2 text-[0.62rem] font-medium uppercase tracking-[0.25em] opacity-30">{priceIsExact ? "Estimated investment" : "Starting from"}</p>
            {#key startingPrice}
              <p class="font-editorial m-0 animate-[price-in_220ms_cubic-bezier(0.22,1,0.36,1)] text-[clamp(4rem,8vw,7rem)] font-extrabold italic leading-none tracking-[-0.04em]  text-black dark:text-white">{startingPrice}<span class="font-neue ml-[0.5em] align-top text-[1.3rem] font-medium not-italic">€</span></p>
            {/key}
          </div>
        {:else}
          <p class="font-neue m-0 text-[0.875rem] font-light italic opacity-30">select a tier above to see pricing</p>
        {/if}
      </div>
      <div class="mt-8 flex flex-wrap items-center gap-8">
        <button type="button" class="font-neue border-0 bg-[#1A1A1A] px-9 py-[0.85rem] text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[#FDFDFB] transition-colors hover:bg-[#A34D32] disabled:cursor-default disabled:opacity-20 dark:bg-[#FDFDFB] dark:text-[#1A1A1A] dark:hover:bg-[#A34D32] dark:hover:text-[#FDFDFB]" disabled={!builderPrice} on:click={buildAndOpen}>Secure your slot →</button>
        <button type="button" class="font-neue border-0 border-b border-current bg-transparent p-0 text-[0.875rem] font-light opacity-50 transition-opacity hover:opacity-85" on:click={openForm}>Skip builder</button>
      </div>
    </div>
  </section>

  <!-- ── 5. Selected Works ─────────────────────────────────────── -->
  <section class="mx-auto w-full max-w-5xl px-8 py-16 lg:px-16" data-reveal>
    <hr class="h-px w-full border-none bg-[rgba(17,24,39,0.1)] dark:bg-[rgba(255,255,255,0.08)]" />
    <div class="mt-6 flex items-baseline justify-between gap-6">
      <span class="font-neue text-[0.62rem] font-medium uppercase tracking-[0.28em] opacity-30">Selected Works</span>
      <span class="font-neue text-[0.62rem] font-medium uppercase tracking-[0.28em] opacity-20">2025 — 2026</span>
    </div>
    <div
      class="works-marquee mt-8"
      role="region"
      aria-label="Selected works marquee"
    >
      <div class="works-marquee-window border-y border-[rgba(17,24,39,0.07)] py-5 dark:border-[rgba(255,255,255,0.07)]">
        <div class="works-marquee-track" aria-live="off">
          {#each [...selectedWorks, ...selectedWorks] as work, i}
            <div class="works-marquee-item group" aria-hidden={i >= selectedWorks.length}>
              <div class="flex items-baseline gap-5">
                <span class="font-neue w-6 shrink-0 text-[0.65rem] tabular-nums opacity-20">{String((i % selectedWorks.length) + 1).padStart(2, "0")}</span>
                <span class="font-editorial text-[clamp(1.3rem,2.2vw,2rem)] font-extrabold italic leading-none tracking-[-0.02em]">{work.name}</span>
              </div>
              <span class="font-neue text-[0.68rem] font-light opacity-40">{work.type}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <!-- ── 6. Process ─────────────────────────────────────────────── -->
  <section class="mx-auto w-full max-w-5xl px-8 py-[clamp(4rem,8vw,7rem)] lg:px-16" data-reveal>
    <hr class="h-px w-full border-none bg-[rgba(17,24,39,0.1)] dark:bg-[rgba(255,255,255,0.08)]" />
    <div class="mt-6 flex items-baseline justify-between gap-6">
      <h3 class="font-editorial m-0 text-[clamp(2.5rem,5vw,4rem)] font-extrabold italic tracking-[-0.02em]">The Process</h3>
      <span class="font-neue text-[0.62rem] font-medium uppercase tracking-[0.28em] opacity-30">HOW IT WORKS</span>
    </div>
    <div class="mt-14">
      {#each [
        { num: "01", statement: "Response within 24 hours, without exception."              },
        { num: "02", statement: "50% retainer locks your spot. Remainder due at launch."    },
        { num: "03", statement: "Full refund guaranteed before execution begins."            },
        { num: "04", statement: "Lighthouse 95+ delivered on every metric, every time."     },
        { num: "05", statement: "Three structured reviews. Staging open from day one."      },
        { num: "06", statement: "Ten percent off for every returning partnership."           },
      ] as step, i}
        <div
          class="group flex items-center gap-6 border-t border-[rgba(17,24,39,0.07)] py-5 dark:border-[rgba(255,255,255,0.07)]"
          data-reveal
          style={`--reveal-delay: ${i * 60}ms;`}
        >
          <span class="font-editorial w-14 shrink-0 select-none text-[clamp(2.2rem,4vw,3.2rem)] font-extrabold italic leading-none text-[#A34D32] opacity-[0.13] transition-opacity duration-300 group-hover:opacity-[0.45]">
            {step.num}
          </span>
          <span class="font-neue text-[clamp(0.9rem,1.5vw,1.1rem)] font-medium leading-snug">{step.statement}</span>
        </div>
      {/each}
      <div class="border-t border-[rgba(17,24,39,0.07)] dark:border-[rgba(255,255,255,0.07)]"></div>
    </div>
  </section>

  <!-- ── 6. FAQ ──────────────────────────────────────────────────── -->
  <section class="mx-auto w-full max-w-5xl px-8 py-[clamp(4rem,8vw,7rem)] lg:px-16" data-reveal>
    <hr class="h-px w-full border-none bg-[rgba(17,24,39,0.1)] dark:bg-[rgba(255,255,255,0.08)]" />
    <div class="mt-6 flex items-baseline justify-between gap-6">
      <h3 class="font-editorial m-0 text-[clamp(2.5rem,5vw,4rem)] font-extrabold italic tracking-[-0.02em]">FAQ</h3>
      <span class="font-neue text-[0.62rem] font-medium uppercase tracking-[0.28em] opacity-30">COMMON QUESTIONS</span>
    </div>
    <div class="faq-list mt-12 border-t border-[rgba(17,24,39,0.08)] dark:border-[rgba(255,255,255,0.08)]">
      {#each faqs as faq, i}
        <details class="faq-item border-b border-[rgba(17,24,39,0.08)] dark:border-[rgba(255,255,255,0.08)]" data-reveal style={`--reveal-delay: ${i * 60}ms;`}>
          <summary class="faq-q">{faq.q}</summary>
          <p class="faq-a">{faq.a}</p>
        </details>
      {/each}
    </div>
  </section>

  <!-- ── 7. Closing CTA ─────────────────────────────────────────── -->
  <section class="flex min-h-[100svh] w-full flex-col items-center justify-center gap-6 bg-[#1A1A1A] px-8 py-16 text-center text-[#FDFDFB]" data-reveal>
    <div class="flex items-center gap-2.5">
      <span class="inline-block h-2 w-2 rounded-full bg-[#A34D32] animate-[pulse-dot_2.4s_ease-in-out_infinite]" aria-hidden="true"></span>
      <span class="font-neue text-[0.62rem] font-medium uppercase tracking-[0.22em] opacity-35">Available for new work</span>
    </div>
    <p class="font-neue m-0 text-[0.62rem] font-medium uppercase tracking-[0.28em] opacity-25">READY TO BEGIN</p>
    <h2 class="font-editorial m-0 text-[clamp(4rem,11vw,8.5rem)] font-extrabold italic leading-[0.9] tracking-[-0.03em]">Let's build<br>something.</h2>
    <p class="font-neue mt-2 max-w-[34ch] text-[0.9375rem] font-light leading-7 opacity-35">Skip the estimator and share your goals directly for a custom proposal.</p>
    <button type="button" class="font-neue mt-3 border border-[rgba(255,255,255,0.2)] bg-transparent px-11 py-4 text-[0.75rem] font-medium uppercase tracking-[0.14em] transition-colors hover:border-[#A34D32] hover:bg-[#A34D32]" on:click={openForm}>Start a conversation →</button>
  </section>

  <!-- ── 8. Footer ──────────────────────────────────────────────── -->
  <div class="mx-auto w-full max-w-5xl px-8 pb-20 lg:px-16">
    <Footer />
  </div>
</main>


<!-- ── 9. Form Drawer ──────────────────────────────────────────── -->
{#if showForm}
  <div
    class="fixed inset-0 z-[9999] bg-[rgba(0,0,0,0.18)] animate-[overlay-in_260ms_ease_forwards]"
    on:click|self={closeForm}
    on:keydown={(event) => {
      if (event.key === "Escape") closeForm();
    }}
    role="dialog"
    aria-modal="true"
    aria-label="Commission request form"
    tabindex="-1"
  >
    <div class="fixed right-0 top-0 h-[100svh] w-[min(500px,100vw)] overflow-y-auto border-l border-l-[rgba(17,24,39,0.1)] border-t-[3px] border-t-[#A34D32] bg-[#FDFDFB] px-10 py-12 animate-[drawer-in_320ms_cubic-bezier(0.22,1,0.36,1)_forwards] dark:border-l-[rgba(255,255,255,0.08)] dark:bg-[#0f0f0f]">
      <button class="font-neue absolute right-6 top-6 border-0 bg-transparent p-1 text-[1.4rem] font-light opacity-30 transition-opacity hover:opacity-100" on:click={closeForm} aria-label="Close">×</button>

      <div class="flex w-full flex-col gap-6">
        <div>
          <h2 class="font-editorial m-0 text-[1.9rem] font-extrabold italic tracking-[-0.02em]">Project Initiation</h2>
          <p class="font-neue mt-2 text-sm font-light leading-snug opacity-55">I will review and reply within 24 hours.</p>
        </div>

        <form on:submit|preventDefault={sendForm} class="flex w-full flex-col gap-5" novalidate>

          <div aria-hidden="true" style="display:none; visibility:hidden; position:absolute; left:-9999px;">
            <label for="hp">Leave blank</label>
            <input type="text" id="hp" bind:value={formHoneypot} tabindex="-1" autocomplete="off" />
          </div>

          <div class="flex flex-col gap-5 sm:flex-row sm:gap-3">
            <div class="flex-1">
              <label class="font-neue mb-2 block text-[0.75rem] font-semibold uppercase tracking-[0.1em]" for="f-name">Name / Entity</label>
              <input class="font-neue w-full border-0 border-b border-[rgba(17,24,39,0.12)] bg-transparent px-0 py-3 text-[0.9375rem] font-light outline-none transition-colors focus:border-b-[#A34D32] dark:border-b-[rgba(255,255,255,0.12)]" type="text" id="f-name" bind:value={formName} placeholder="Jane Doe" autocomplete="name" />
            </div>
            <div class="flex-1">
              <label class="font-neue mb-2 block text-[0.75rem] font-semibold uppercase tracking-[0.1em]" for="f-email">Email</label>
              <input class="font-neue w-full border-0 border-b border-[rgba(17,24,39,0.12)] bg-transparent px-0 py-3 text-[0.9375rem] font-light outline-none transition-colors focus:border-b-[#A34D32] dark:border-b-[rgba(255,255,255,0.12)]" type="email" id="f-email" bind:value={formEmail} placeholder="jane@example.com" autocomplete="email" />
            </div>
          </div>

          <div>
            <p class="font-neue mb-2 text-[0.75rem] font-semibold uppercase tracking-[0.1em]">The Engagement</p>
            <div class="toggle-group flex w-full flex-wrap gap-1.5" role="group" aria-label="Project type">
              {#each ["Design", "Development", "Full Package"] as opt}
                <button type="button" class="toggle-btn font-neue min-w-[72px] flex-1 border border-[rgba(17,24,39,0.12)] bg-transparent px-3.5 py-2 text-sm font-normal tracking-[0.01em] transition-[border-color,font-weight] hover:border-[rgba(17,24,39,0.4)] dark:border-[rgba(255,255,255,0.1)] dark:hover:border-[rgba(255,255,255,0.4)]"
                        class:active={formType === opt}
                        on:click={() => { formType = opt; }}>
                  {opt}
                </button>
              {/each}
            </div>
          </div>

          <div>
            <p class="font-neue mb-2 text-[0.75rem] font-semibold uppercase tracking-[0.1em]">Project Tier</p>
            <div class="toggle-group flex w-full flex-wrap gap-1.5" role="group" aria-label="Scale">
              {#each [
                { id: "Core", label: "Core" },     // Changed id from "Small" to "Core"
                { id: "Presence", label: "Presence" }, // Changed id from "Medium" to "Presence"
                { id: "System", label: "System" }   // Changed id from "Large" to "System"
              ] as opt}
                <button type="button" class="toggle-btn font-neue min-w-[72px] flex-1 border border-[rgba(17,24,39,0.12)] bg-transparent px-3.5 py-2 text-sm font-normal tracking-[0.01em] transition-[border-color,font-weight] hover:border-[rgba(17,24,39,0.4)] dark:border-[rgba(255,255,255,0.1)] dark:hover:border-[rgba(255,255,255,0.4)]"
                        class:active={formScale === opt.id}
                        on:click={() => formScale = opt.id}>
                  {opt.label}
                </button>
              {/each}
            </div>
          </div>

          <div>
            <label class="font-neue mb-2 block text-[0.75rem] font-semibold uppercase tracking-[0.1em]" for="f-details">Technical Brief</label>
            <textarea
              class="font-neue min-h-24 w-full resize-y border-0 border-b border-[rgba(17,24,39,0.12)] bg-transparent px-0 py-3 text-[0.9375rem] font-light outline-none transition-colors focus:border-b-[#A34D32] dark:border-b-[rgba(255,255,255,0.12)]"
              id="f-details" bind:value={formDetails} rows="5"
              placeholder="Outline your vision, required integrations, deadlines, and any infrastructure add-ons needed."
            ></textarea>
          </div>

          {#if formError}
            <p class="font-neue m-0 text-[0.875rem] text-[#A34D32]">{formError}</p>
          {/if}

          <button type="submit" class="font-neue w-full border-0 bg-[#1A1A1A] p-4 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[#FDFDFB] transition-colors hover:bg-[#A34D32] disabled:cursor-default disabled:opacity-25 dark:bg-[#FDFDFB] dark:text-[#1A1A1A] dark:hover:bg-[#A34D32] dark:hover:text-[#FDFDFB]" disabled={submitting}>
            {submitText}
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}


<style>
  .font-editorial {
    font-family: "PPEditorialNew", "Times New Roman", serif;
  }

  .font-neue {
    font-family: "PPNeueMontreal", "Inter", sans-serif;
  }

  main::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 50;
    opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }

  .reveal-enabled [data-reveal] {
    opacity: 0;
    filter: blur(2px);
    transform: translateY(18px);
    transition: opacity 580ms cubic-bezier(0.22, 1, 0.36, 1), transform 580ms cubic-bezier(0.22, 1, 0.36, 1), filter 580ms cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: var(--reveal-delay, 0ms);
  }

  :global(.reveal-enabled [data-reveal][data-visible="true"]) {
    opacity: 1;
    filter: none;
    transform: translateY(0);
  }

  .slot-full .slot-count {
    color: #A34D32;
    opacity: 1;
  }

  .hint-hidden {
    opacity: 0;
  }

  .faq-item summary {
    list-style: none;
  }

  .faq-item summary::-webkit-details-marker {
    display: none;
  }

  .faq-q {
    font-family: "PPNeueMontreal", "Inter", sans-serif;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.4rem 0;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 160ms;
  }

  .faq-q:hover {
    opacity: 0.7;
  }

  .faq-q::after {
    content: "+";
    color: #A34D32;
    opacity: 0.55;
    font-size: 1.3rem;
    font-weight: 400;
    flex-shrink: 0;
  }

  details[open] .faq-q::after {
    content: "-";
  }

  .faq-a {
    padding-bottom: 1.5rem;
    margin: 0;
    font-family: "PPNeueMontreal", "Inter", sans-serif;
    font-size: 0.9375rem;
    font-weight: 300;
    line-height: 1.7;
    opacity: 0.58;
  }

  .toggle-btn.active {
    font-weight: 700;
    background: none;
    border-color: #A34D32;
    color: inherit;
  }

  .works-marquee {
    overflow: hidden;
  }

  .works-marquee-window {
    overflow: hidden;
    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
    mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
  }

  .works-marquee-track {
    display: flex;
    width: max-content;
    gap: 0.85rem;
    animation: marquee-scroll 20s linear infinite;
    will-change: transform;
  }

  .works-marquee-item {
    display: flex;
    flex-shrink: 0;
    align-items: baseline;
    gap: 1.1rem;
    min-width: max-content;
    padding: 0 1rem;
    border-right: 1px solid rgba(17, 24, 39, 0.07);
    transition: opacity 180ms;
  }

  .works-marquee-item:hover {
    opacity: 0.72;
  }

  @keyframes bob {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50%       { transform: translateX(-50%) translateY(7px); }
  }

  @keyframes word-swap {
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes price-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes marquee-scroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1;    transform: scale(1);    }
    50%       { opacity: 0.35; transform: scale(0.75); }
  }

  @keyframes overlay-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes drawer-in {
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
  }

  @media (prefers-color-scheme: dark) {
    main::before {
      opacity: 0.02;
    }
    .toggle-btn.active {
      border-color: #A34D32;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .reveal-enabled [data-reveal] {
      opacity: 1;
      filter: none;
      transform: none;
      transition: none;
    }

    [class*="animate-"] {
      animation: none;
    }

    .toggle-btn,
    .faq-q,
    .hint-hidden {
      transition: none;
    }

    .works-marquee-track {
      animation: none;
      transform: none;
    }
  }
</style>