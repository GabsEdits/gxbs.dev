<script>
  import { onMount } from "svelte";
  import Footer from "./Footer.svelte";

  let slotsData    = null;
  let slotsLoading = true;
  let slotsError   = false;

  let builderType          = "";
  let builderFramework     = "";
  let builderScale         = "";
  let builderInfrastructure= false;
  let builderUpkeep        = false;

  const PRICES = {
    "Web Design":      { Small: 40,   Medium: 120, Large: 250 },
    "Web Development": {
      "Astro":     { Small: 100, Medium: 250, Large: 500 },
      "SvelteKit": { Small: 120, Medium: 300, Large: 600 },
      "Custom":    { Small: 150, Medium: 400, Large: 850 },
    },
    "Both": { Small: 180, Medium: 450, Large: 950 },
  };

  $: builderFrameworkVisible =
    builderType === "Web Development" || builderType === "Both";

  $: builderPrice = (() => {
    if (!builderType || !builderScale) return null;
    let base = 0;
    if (builderType === "Web Design") {
      base = PRICES["Web Design"][builderScale] ?? 0;
    } else if (builderType === "Web Development") {
      if (!builderFramework) return null;
      base = (PRICES["Web Development"][builderFramework] ?? {})[builderScale] ?? 0;
    } else if (builderType === "Both") {
      base = PRICES["Both"][builderScale] ?? 0;
    }

    if (builderInfrastructure) base += 50;
    if (builderUpkeep)         base += 150;

    return base;
  })();

  $: builderReady =
    !!builderType &&
    !!builderScale &&
    (builderType === "Web Design" || builderType === "Both" || !!builderFramework);

  $: startingPrice = (() => {
    if (builderPrice !== null) return builderPrice;
    if (!builderScale) return null;
    const d  = PRICES["Web Design"][builderScale] ?? Infinity;
    const dv = Math.min(...Object.values(PRICES["Web Development"]).map(fw => fw[builderScale] ?? Infinity));
    const b  = PRICES["Both"][builderScale] ?? Infinity;
    if (builderType === "Web Design")      return d;
    if (builderType === "Web Development") return dv === Infinity ? null : dv;
    if (builderType === "Both")            return b;
    const m = Math.min(d, dv, b);
    return m === Infinity ? null : m;
  })();

  $: priceIsExact = builderPrice !== null;

  const faqs = [
    {
      q: "How long will our engagement take?",
      a: "Duration depends on the scale and complexity of the architecture. After our initial review, I'll provide a dedicated timeline. The Core packages typically complete within 1–2 weeks; The System applications may take 4–6 weeks.",
    },
    {
      q: "What does the Collaboration Suite entail?",
      a: "Every partnership includes high-touch communication. Instead of generic updates, we'll have dedicated creative reviews, a Lighthouse performance guarantee (95+ standard), and a polished Digital Care Package upon delivery.",
    },
    {
      q: "Do I own the code and intellectual property?",
      a: "Absolutely. Once the project is finalized and paid in full, you receive total ownership of the repository, source code, and Figma design files.",
    },
    {
      q: "Can you adapt to my existing infrastructure?",
      a: "Yes. Mention your current tech stack in the details, and I will conduct a preliminary audit before we formally begin to ensure perfect integration.",
    },
    {
      q: "Do you operate under NDA?",
      a: "Yes, confidentiality is paramount. I am fully open to signing Non-Disclosure Agreements for sensitive intellectual property. Let me know during your request.",
    },
    {
      q: "What if the project scope expands?",
      a: "We accommodate growth seamlessly. Should you need additional features or more than the 3 included creative revisions, we will transparently scope and agree upon the addendum before proceeding.",
    },
  ];

  let showForm       = false;
  let formName       = "";
  let formEmail      = "";
  let formType       = "";
  let formFramework  = "";
  let formScale      = "";
  let formDetails    = "";
  let formHoneypot   = "";
  let submitText     = "Initiate Project";
  let formError      = "";
  let submitting     = false;

  $: formFrameworkVisible =
    formType === "Web Development" || formType === "Both";

  let revealEnabled = false;
  let reduceMotion  = false;
  let contentRoot;

  const fetchSlots = async () => {
    try {
      const res = await fetch("https://api.gxbs.dev/hire/slots", {
        headers: { "X-Source": "Cloudflare-Workers" }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const map = {};
      for (const slot of data) map[slot.name.replace(/\s+/g, "").toLowerCase()] = slot;
      slotsData = {
        smallScale:  map["smallscale"]  ?? null,
        mediumScale: map["mediumscale"] ?? null,
        largeScale:  map["largescale"]  ?? null,
      };
    } catch {
      slotsError = true;
    } finally {
      slotsLoading = false;
    }
  };

  const buildAndOpen = () => {
    formType      = builderType;
    formFramework = builderFramework;
    formScale     = builderScale;
    const extras  = [
      builderInfrastructure ? "Include Deployment Concierge (Setup & Docs)." : "",
      builderUpkeep         ? "Include Priority Upkeep (Annual Maintenance)." : "",
    ].filter(Boolean);
    formDetails =
      `${builderScale}-scale ${builderType}` +
      (builderFramework ? ` leveraging ${builderFramework}` : "") + ".\n" +
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
    formError  = "";
    submitting = true;
    submitText = "Encrypting & Sending...";

    try {
      const TOKEN   = import.meta.env.VITE_TOKEN;
      const CHAT_ID = "5777053104";
      const msg = [
        "<b>Partnership Inquiry</b>",
        `\n- <b>Client:</b> ${formName}`,
        `- <b>Email:</b> ${formEmail}`,
        `- <b>Engagement:</b> ${formType}`,
        formFrameworkVisible ? `- <b>Architecture:</b> ${formFramework || "TBD"}` : "",
        `- <b>Tier:</b> ${formScale}`,
        `- <b>Brief:</b> ${formDetails}`,
      ].filter(Boolean).join("\n");

      await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ chat_id: CHAT_ID, parse_mode: "html", text: msg }),
      });

      formName = ""; formEmail = ""; formType = "";
      formFramework = ""; formScale = ""; formDetails = "";
      submitText = "Received. I will be in touch shortly.";
      window.setTimeout(() => {
        submitText = "Initiate Project";
        submitting = false;
        closeForm();
      }, 2500);
    } catch {
      formError  = "An error occurred. Please try again.";
      submitText = "Initiate Project";
      submitting = false;
    }
  };

  onMount(() => {
    fetchSlots();

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotion = media.matches;

    const nodes  = contentRoot ? [...contentRoot.querySelectorAll("[data-reveal]")] : [];
    const mark   = (n) => { n.dataset.visible = "true"; };
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
      nodes.forEach((n) => { if (!marked(n)) observer.observe(n); });
    }

    const onEsc    = (e) => { if (e.key === "Escape" && showForm) closeForm(); };
    const onMotion = (e) => {
      reduceMotion = e.matches;
      if (reduceMotion) { revealEnabled = false; nodes.forEach(mark); }
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
  class="container mx-auto max-w-full lg:max-w-120 px-4 pb-20 pt-14 lg:pt-24 flex flex-col gap-24 items-center font-serif"
  class:reveal-enabled={revealEnabled}
>

  <header class="flex flex-col items-center gap-4 text-center">
    <div class="flex items-center justify-center gap-3 text-xl font-extrabold italic">
      <a href="/">
        <img src="/ecliptic.svg" alt="" aria-hidden="true" class="h-6 dark:invert" />
      </a>
      <span>/</span>
      <a href="/blog">partnerships</a>
    </div>
  </header>

  <div class="flex flex-col items-center gap-8 w-full text-center">

    <div class="flex flex-col items-center gap-3" data-reveal>
      <h1 class="text-5xl sm:text-7xl italic leading-none">Partnerships</h1>
    </div>

    <div
      class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm"
      aria-live="polite"
      data-reveal style="--reveal-delay: 120ms;"
    >
      {#if slotsLoading}
        <span class="font-extralight italic opacity-40">Verifying availability...</span>
      {:else if slotsError || !slotsData}
        <span class="font-extralight italic opacity-40">Contact me for availability</span>
      {:else}
        {#each [
          { label: "Core",     data: slotsData.smallScale  },
          { label: "Presence", data: slotsData.mediumScale },
          { label: "System",   data: slotsData.largeScale  },
        ] as { label, data }, i}
          {#if i > 0}<span class="opacity-20" aria-hidden="true">·</span>{/if}
          <span class="inline-flex items-center gap-1.5" class:slot-full={data?.available === 0}>
            <span class="font-extralight italic">{label}</span>
            <span class="slot-count">{data?.available ?? "?"}/{data?.total ?? "?"}</span>
          </span>
        {/each}
      {/if}
    </div>

    <p class="text-xl font-extralight leading-relaxed max-w-[72%]" data-reveal style="--reveal-delay: 220ms;">
      High-performance web architecture &amp; editorial design, crafted with absolute precision.
    </p>

    <hr class="divider w-full" data-reveal style="--reveal-delay: 300ms;" />
  </div>


  <div class="flex flex-col items-center gap-12 w-full" data-reveal>

    <div class="flex flex-col items-center gap-2 text-center">
      <p class="text-xs font-extralight uppercase tracking-[0.22em] opacity-45">Blueprint</p>
      <h2 class="text-3xl italic">Define your scope</h2>
      <p class="text-sm font-extralight opacity-55 mt-1">
        Configure your stack below to generate a tailored estimate.
      </p>
    </div>

    <div class="flex flex-col gap-8 w-full">

      <div class="builder-group">
        <p class="builder-label">The Engagement</p>
        <div class="toggle-group">
          {#each ["Web Design", "Web Development", "Both"] as opt}
            <button type="button" class="toggle-btn"
                    class:active={builderType === opt}
                    on:click={() => { builderType = opt; builderFramework = ""; }}>
              {opt}
            </button>
          {/each}
        </div>
      </div>

      <div class="builder-group">
        <p class="builder-label">Project Tier</p>
        <div class="flex flex-col gap-1.5 w-full">
          {#each [
            { key: "Small",  label: "Core",     desc: "Single-page, essential presence  ·  ~1 week" },
            { key: "Medium", label: "Presence", desc: "Multi-page, integrated CMS  ·  ~2–3 weeks" },
            { key: "Large",  label: "System",   desc: "Full-stack apps, complex logic  ·  ~1 month+" },
          ] as { key, label, desc }}
            <button type="button" class="scale-btn"
                    class:active={builderScale === key}
                    on:click={() => builderScale = key}>
              <span class="font-extrabold italic min-w-[7rem]">{label}</span>
              <span class="scale-desc">{desc}</span>
            </button>
          {/each}
        </div>
      </div>

      <div class="builder-group" class:builder-dimmed={builderType === "Web Design"}>
        <p class="builder-label">Architecture Preference</p>
        <div class="toggle-group">
          {#each [
            { key: "Astro",     sub: "Content-driven & static" },
            { key: "SvelteKit", sub: "Interactive & fluid UI"  },
            { key: "Custom",    sub: "Deno backends, React…" },
          ] as { key, sub }}
            <button type="button" class="toggle-btn toggle-btn-stacked"
                    class:active={builderFramework === key}
                    disabled={builderType === "Web Design"}
                    on:click={() => builderFramework = key}>
              <span>{key}</span>
              <span class="toggle-sub">{sub}</span>
            </button>
          {/each}
        </div>
      </div>

      <div class="builder-group">
        <p class="builder-label">Premium Services</p>
        <div class="flex flex-col gap-2">
          {#each [
            { id: "infrastructure", label: "Deployment Concierge", sub: "Full Vercel/Hetzner setup & environment blueprint", price: "+50€",   value: builderInfrastructure },
            { id: "upkeep",         label: "Priority Upkeep",      sub: "Annual code audits, SEO upkeep & performance checks", price: "+150€/y", value: builderUpkeep },
          ] as item}
            <button type="button" class="addon-btn"
                    class:active={item.value}
                    on:click={() => {
                if (item.id === "infrastructure") builderInfrastructure = !builderInfrastructure;
                else builderUpkeep = !builderUpkeep;
              }}>
              <span class="addon-icon" aria-hidden="true">{item.value ? "×" : "+"}</span>
              <span class="flex flex-col items-start gap-0.5 min-w-0">
                <span class="text-sm font-extrabold italic">{item.label}</span>
                <span class="text-xs font-extralight opacity-55">{item.sub}</span>
              </span>
              <span class="ml-auto text-sm font-extralight italic opacity-60 shrink-0">{item.price}</span>
            </button>
          {/each}
        </div>
      </div>

    </div>

    <div class="w-full flex flex-col items-center gap-6 pt-2">
      <hr class="divider w-full" />

      <div class="flex flex-col items-center gap-1 min-h-[3.5rem] justify-center">
        {#if startingPrice !== null}
          <p class="text-xs font-extralight uppercase tracking-[0.2em] opacity-45">
            {priceIsExact ? "Estimated investment" : "Investment starting from"}
          </p>
          <p class="price-display">{startingPrice}<span class="price-display-unit">€</span></p>
        {:else}
          <p class="text-sm font-extralight italic opacity-40">Select parameters above for a precise estimate</p>
        {/if}
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-3">
        <button class="commission-btn commission-btn-filled"
                disabled={!builderPrice}
                on:click={buildAndOpen}>
          Secure your slot →
        </button>
        <button class="commission-btn" on:click={openForm}>Skip builder</button>
      </div>
    </div>

  </div>


  <div class="flex flex-col items-center gap-14 w-full" data-reveal>
    <h3 class="italic text-xl">The Process</h3>

    <div class="flex flex-col gap-10 w-full">
      {#each [
        {
          title: "Onboarding & Retainer", delay: 50,
          items: [
            "Secure processing via Ko-fi or GitHub Sponsors.",
            "Final estimate provided after our initial architecture review.",
            "50% retainer to secure queue placement, 50% prior to final deployment.",
            "Complete refund available before technical execution begins.",
          ]
        },
        {
          title: "Execution Timeline", delay: 130,
          items: [
            "Initial inquiry response within 24 hours.",
            "Project schedules are rigidly adhered to once scoping is complete.",
            "Current wait times range from immediate availability to 2 weeks.",
          ]
        },
        {
          title: "The Handoff", delay: 210,
          items: [
            "Creative Reviews conducted via Loom or dedicated Figma spaces.",
            "Completely transparent staging environments during development.",
            "Final delivery includes the Digital Care Package (Source, Assets, Configs).",
          ]
        },
        {
          title: "The Standard", delay: 290,
          items: [
            "Lighthouse performance guarantee (95+ baseline on all metrics).",
            "Flawless dark and light mode implementations natively integrated.",
            "10% structural discount for long-term retainers and returning clientele.",
          ]
        },
      ] as block}
        <div data-reveal style={`--reveal-delay: ${block.delay}ms;`}>
          <h4 class="text-base font-extrabold italic mb-4">{block.title}</h4>
          <ul class="info-list">
            {#each block.items as item}<li>{item}</li>{/each}
          </ul>
        </div>
      {/each}
    </div>

    <hr class="divider w-full" />
  </div>


  <div class="flex flex-col items-center gap-12 w-full" data-reveal>
    <h3 class="italic text-xl">FAQ</h3>
    <div class="faq-list w-full">
      {#each faqs as faq, i}
        <details class="faq-item" data-reveal style={`--reveal-delay: ${i * 60}ms;`}>
          <summary class="faq-q">{faq.q}</summary>
          <p class="faq-a">{faq.a}</p>
        </details>
      {/each}
    </div>
    <hr class="divider w-full" />
  </div>


  <div class="flex flex-col items-center gap-6 w-full pb-4 text-center" data-reveal>
    <h3 class="italic text-xl">Have a unique proposition?</h3>
    <p class="text-base font-extralight max-w-[72%] leading-relaxed">
      Bypass the builder and detail your specific technical requirements directly.
    </p>
    <button class="commission-btn commission-btn-filled" on:click={openForm}>
      Initiate Project →
    </button>
  </div>

  <Footer />
</main>


{#if showForm}
  <div class="form-overlay" on:click={closeForm} role="dialog" aria-modal="true" aria-label="Commission request form" tabindex="-1">
    <div class="form-panel" on:click|stopPropagation>
      <button class="form-close" on:click={closeForm} aria-label="Close">x</button>

      <div class="flex flex-col gap-6 w-full">
        <div>
          <h2 class="text-2xl italic font-extrabold">Project Initiation</h2>
          <p class="text-sm font-extralight mt-1.5 opacity-55 leading-snug">I will review and reply within 24 hours.</p>
        </div>

        <form on:submit|preventDefault={sendForm} class="flex flex-col gap-5 w-full" novalidate>

          <div aria-hidden="true" style="display:none; visibility:hidden; position:absolute; left:-9999px;">
            <label for="hp">Leave blank</label>
            <input type="text" id="hp" bind:value={formHoneypot} tabindex="-1" autocomplete="off" />
          </div>

          <div class="flex flex-col gap-5 sm:flex-row sm:gap-3">
            <div class="form-field flex-1">
              <label for="f-name">Name / Entity</label>
              <input type="text" id="f-name" bind:value={formName} placeholder="Jane Doe" autocomplete="name" />
            </div>
            <div class="form-field flex-1">
              <label for="f-email">Email</label>
              <input type="email" id="f-email" bind:value={formEmail} placeholder="jane@example.com" autocomplete="email" />
            </div>
          </div>

          <div class="form-field">
            <p class="form-group-label">The Engagement</p>
            <div class="toggle-group" role="group" aria-label="Project type">
              {#each ["Web Design", "Web Development", "Both"] as opt}
                <button type="button" class="toggle-btn"
                        class:active={formType === opt}
                        on:click={() => { formType = opt; if (opt === "Web Design") formFramework = ""; }}>
                  {opt}
                </button>
              {/each}
            </div>
          </div>

          {#if formFrameworkVisible}
            <div class="form-field">
              <p class="form-group-label">Target Architecture</p>
              <div class="toggle-group" role="group" aria-label="Framework">
                {#each ["Astro", "SvelteKit", "Custom"] as opt}
                  <button type="button" class="toggle-btn"
                          class:active={formFramework === opt}
                          on:click={() => formFramework = opt}>
                    {opt}
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <div class="form-field">
            <p class="form-group-label">Project Tier</p>
            <div class="toggle-group" role="group" aria-label="Scale">
              {#each [
                { id: "Small",  label: "Core" },
                { id: "Medium", label: "Presence" },
                { id: "Large",  label: "System" }
              ] as opt}
                <button type="button" class="toggle-btn"
                        class:active={formScale === opt.id}
                        on:click={() => formScale = opt.id}>
                  {opt.label}
                </button>
              {/each}
            </div>
          </div>

          <div class="form-field">
            <label for="f-details">Technical Brief</label>
            <textarea
              id="f-details" bind:value={formDetails} rows="5"
              placeholder="Outline your vision, required integrations, deadlines, and any infrastructure add-ons needed."
            ></textarea>
          </div>

          {#if formError}
            <p class="form-error">{formError}</p>
          {/if}

          <button type="submit" class="commission-btn commission-btn-filled w-full" disabled={submitting}>
            {submitText}
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}


<style>
  .divider {
    border: none;
    height: 1px;
    background-color: #e5e7eb;
  }

  .micro-link { position:relative; text-decoration:none; }
  .micro-link::after {
    content:""; position:absolute; left:0; bottom:-0.08em;
    width:100%; height:1px; background:currentColor;
    transform:scaleX(0); transform-origin:left;
    transition:transform 260ms cubic-bezier(0.19,1,0.22,1);
  }
  .micro-link:hover::after,
  .micro-link:focus-visible::after { transform:scaleX(1); }

  .slot-count {
    font-size:0.72rem; font-variant-numeric:tabular-nums;
    font-style:italic; opacity:0.4;
  }
  .slot-full .slot-count { color:#A34D32; opacity:1; }

  .price { font-style:italic; font-weight:800; color:#A34D32; }

  .price-display {
    font-size:3rem; font-style:italic; font-weight:800;
    color:#A34D32; font-variant-numeric:tabular-nums;
    line-height:1; letter-spacing:-0.03em;
  }
  .price-display-unit { font-size:1.5rem; margin-left:0.1em; }

  .price-rows { display:flex; flex-direction:column; gap:0; }
  .price-row {
    display:flex; justify-content:space-between; align-items:center;
    padding:0.55rem 0;
    border-bottom:1px solid rgba(17,24,39,0.05);
  }
  .price-row:last-child { border-bottom:none; }

  .info-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.5rem; }
  .info-list li {
    font-size:0.9375rem; font-weight:200; padding-left:1.1rem;
    position:relative; line-height:1.6;
  }
  .info-list li::before { content:"–"; position:absolute; left:0; opacity:0.3; }

  .svc { display:flex; flex-direction:column; gap:1.25rem; width:100%; }
  .svc-head { display:flex; flex-direction:column; }

  .builder-group { display:flex; flex-direction:column; gap:0.7rem; width:100%; }
  .builder-dimmed { opacity:0.25; pointer-events:none; user-select:none; transition:opacity 240ms; }
  .builder-label {
    font-size:0.72rem; font-weight:800; font-style:italic;
    text-transform:uppercase; letter-spacing:0.16em; opacity:0.4;
  }

  .faq-list { border-top:1px solid rgba(17,24,39,0.08); }
  .faq-item {
    border-bottom:1px solid rgba(17,24,39,0.08);
    padding:0;
  }
  .faq-item summary { list-style:none; }
  .faq-item summary::-webkit-details-marker { display:none; }
  .faq-q {
    display:flex; justify-content:space-between; align-items:center;
    padding:1rem 0;
    font-style:italic; font-weight:800; font-size:0.9375rem;
    cursor:pointer; gap:1rem;
    transition:opacity 160ms;
  }
  .faq-q:hover { opacity:0.7; }
  .faq-q::after {
    content:"+"; font-weight:200; font-style:normal;
    font-size:1.1rem; opacity:0.45; flex-shrink:0;
    transition:transform 200ms;
  }
  details[open] .faq-q::after { content:"–"; }
  .faq-a {
    padding:0 0 1rem 0;
    font-size:0.9375rem; font-weight:200; line-height:1.7; opacity:0.7;
  }

  .scale-btn {
    display:flex; align-items:center; gap:1rem;
    padding:0.8rem 1rem;
    border:1px solid rgba(17,24,39,0.1); background:transparent;
    font-family:inherit; font-size:1rem; cursor:pointer; border-radius:0;
    color:inherit; text-align:left; width:100%;
    transition:border-color 160ms, background 160ms, color 160ms;
  }
  .scale-btn:hover { border-color:rgba(17,24,39,0.35); }
  .scale-btn.active { background:#1A1A1A; border-color:#1A1A1A; color:#FDFDFB; }
  .scale-desc { font-size:0.8125rem; font-weight:200; opacity:0.5; }
  .scale-btn.active .scale-desc { opacity:0.65; }

  .addon-btn {
    display:flex; align-items:center; gap:0.85rem;
    padding:0.7rem 0.9rem;
    border:1px solid rgba(17,24,39,0.1); background:transparent;
    font-family:inherit; cursor:pointer; border-radius:0;
    color:inherit; text-align:left; width:100%;
    transition:border-color 160ms, background 160ms;
  }
  .addon-btn:hover { border-color:rgba(17,24,39,0.35); }
  .addon-btn.active { background:rgba(163,77,50,0.05); border-color:rgba(163,77,50,0.35); }

  .addon-icon {
    display:inline-flex; align-items:center; justify-content:center;
    width:1.15rem; height:1.15rem;
    border:1px solid rgba(17,24,39,0.18); font-size:0.85rem;
    color:#A34D32; flex-shrink:0;
    transition:border-color 160ms;
  }
  .addon-btn.active .addon-icon { border-color:rgba(163,77,50,0.4); }

  .toggle-group { display:flex; flex-wrap:wrap; gap:0.4rem; width:100%; }
  .toggle-btn {
    flex:1; min-width:72px; padding:0.55rem 0.85rem;
    border:1px solid rgba(17,24,39,0.12); background:transparent;
    font-family:inherit; font-size:0.875rem; font-weight:200;
    font-style:italic; cursor:pointer; border-radius:0; color:inherit;
    transition:border-color 160ms, background 160ms, color 160ms, font-weight 160ms;
  }
  .toggle-btn:hover { border-color:rgba(17,24,39,0.4); }
  .toggle-btn.active { background:#1A1A1A; border-color:#1A1A1A; color:#FDFDFB; font-weight:800; }

  .toggle-btn-stacked {
    display:flex; flex-direction:column; gap:0.15rem;
    text-align:center; padding:0.65rem 0.85rem;
  }
  .toggle-sub {
    font-size:0.675rem; opacity:0.45; font-weight:200;
    font-style:normal; letter-spacing:0.04em;
  }
  .toggle-btn.active .toggle-sub { opacity:0.6; }

  .commission-btn {
    display:inline-flex; align-items:center; justify-content:center;
    padding:0.75rem 1.75rem;
    border:1px solid currentColor; background:transparent;
    font-family:inherit; font-style:italic; font-weight:400;
    font-size:0.9375rem; cursor:pointer; border-radius:0;
    transition:background 200ms, color 200ms, border-color 200ms;
    letter-spacing:0.01em;
  }
  .commission-btn:hover:not(:disabled),
  .commission-btn:focus-visible:not(:disabled) {
    background:#1A1A1A; color:#FDFDFB; border-color:#1A1A1A;
  }
  .commission-btn.commission-btn-filled {
    background:#1A1A1A; color:#FDFDFB; border-color:#1A1A1A; font-weight:800;
  }
  .commission-btn.commission-btn-filled:hover:not(:disabled) {
    background:#A34D32; border-color:#A34D32;
  }
  .commission-btn:disabled { opacity:0.3; cursor:default; }

  .form-overlay {
    position:fixed; inset:0; z-index:9999;
    display:flex; align-items:center; justify-content:center;
    background:rgba(17,24,39,0.45); backdrop-filter:blur(8px);
    padding:1rem; animation:overlay-in 260ms ease forwards;
  }
  @keyframes overlay-in { from{opacity:0} to{opacity:1} }

  .form-panel {
    position:relative; background:#FDFDFB;
    width:100%; max-width:500px; max-height:92vh; overflow-y:auto;
    padding:2.25rem 2rem;
    border:1px solid rgba(17,24,39,0.08);
    animation:panel-in 300ms cubic-bezier(0.22,1,0.36,1) forwards;
  }
  @keyframes panel-in {
    from{opacity:0; transform:translateY(14px) scale(0.98)}
    to{opacity:1; transform:translateY(0) scale(1)}
  }

  .form-close {
    position:absolute; top:1rem; right:1.25rem;
    background:none; border:none; font-size:1.35rem; font-weight:200;
    cursor:pointer; color:inherit; padding:0.2rem 0.4rem; opacity:0.3;
    font-family:inherit; transition:opacity 140ms;
  }
  .form-close:hover { opacity:0.9; }

  .form-field { display:flex; flex-direction:column; gap:0.45rem; width:100%; }
  .form-field label,
  .form-group-label {
    font-size:0.8rem; font-weight:800; font-style:italic; letter-spacing:0.04em;
  }
  .form-field input,
  .form-field textarea {
    font-family:inherit; font-size:0.9375rem; font-weight:200;
    padding:0.7rem 0.8rem;
    border:1px solid rgba(17,24,39,0.13); border-radius:0;
    background:transparent; color:inherit; outline:none; width:100%;
    transition:border-color 160ms;
  }
  .form-field input:focus,
  .form-field textarea:focus { border-color:rgba(17,24,39,0.5); }
  .form-field textarea { resize:vertical; min-height:96px; }

  .form-error { font-size:0.875rem; font-weight:200; font-style:italic; color:#A34D32; }

  .reveal-enabled [data-reveal] {
    opacity:0; filter:blur(2px); transform:translateY(18px);
    transition:
      opacity  580ms cubic-bezier(0.22,1,0.36,1),
      transform 580ms cubic-bezier(0.22,1,0.36,1),
      filter   580ms cubic-bezier(0.22,1,0.36,1);
    transition-delay:var(--reveal-delay,0ms);
  }
  :global(.reveal-enabled [data-reveal][data-visible="true"]) {
    opacity:1; filter:none; transform:translateY(0);
  }

  @media (prefers-color-scheme: dark) {
    .divider { background-color: oklch(26.9% 0 0); }
    .price-row { border-bottom-color:rgba(255,255,255,0.06); }
    .faq-list { border-top-color:rgba(255,255,255,0.08); }
    .faq-item { border-bottom-color:rgba(255,255,255,0.08); }
    .scale-btn, .addon-btn, .toggle-btn { border-color:rgba(255,255,255,0.1); }
    .scale-btn:hover, .addon-btn:hover, .toggle-btn:hover { border-color:rgba(255,255,255,0.4); }
    .scale-btn.active, .toggle-btn.active { background:#FDFDFB; border-color:#FDFDFB; color:#1A1A1A; }
    .addon-btn.active { background:rgba(163,77,50,0.12); border-color:rgba(163,77,50,0.4); }
    .addon-icon { border-color:rgba(255,255,255,0.2); }
    .commission-btn:hover:not(:disabled),
    .commission-btn:focus-visible:not(:disabled) { background:#FDFDFB; color:#1A1A1A; border-color:#FDFDFB; }
    .commission-btn.commission-btn-filled { background:#FDFDFB; color:#1A1A1A; border-color:#FDFDFB; }
    .commission-btn.commission-btn-filled:hover:not(:disabled) { background:#A34D32; border-color:#A34D32; color:#FDFDFB; }
    .form-panel { background:#1A1A1A; border-color:rgba(255,255,255,0.08); }
    .form-field input, .form-field textarea { border-color:rgba(255,255,255,0.1); }
    .form-field input:focus, .form-field textarea:focus { border-color:rgba(255,255,255,0.5); }
  }

  @media (prefers-reduced-motion: reduce) {
    .reveal-enabled [data-reveal] { opacity:1; filter:none; transform:none; transition:none; }
    .form-overlay, .form-panel { animation:none; }
    .commission-btn, .scale-btn, .addon-btn, .toggle-btn, .micro-link::after { transition:none; }
  }

  main::before {
      content: "";
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      pointer-events: none;
      z-index: 50;
      opacity: 0.04;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }

  @media (prefers-color-scheme: dark) {
      main::before {
          opacity: 0.02;
      }
  }
</style>











