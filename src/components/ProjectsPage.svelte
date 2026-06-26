<script lang="ts">
  import Footer from "./Footer.svelte";
  import { contributions, featuredProjects, projects } from "../data/projects";

  const projectCount = featuredProjects.length + projects.length;
</script>

<main class="container mx-auto max-w-full lg:max-w-120 p-4 flex flex-col gap-14 items-center lg:py-24 font-serif">
  <header class="flex w-full flex-col items-center gap-5 text-center">
    <div class="flex items-center justify-center gap-3 text-xl font-extrabold italic">
      <a href="/">
        <img src="/ecliptic.svg" alt="" aria-hidden="true" class="h-6 dark:invert" />
      </a>
      <span>/</span>
      <a href="/projects">projects</a>
    </div>

    <h1 class="text-5xl italic leading-none sm:text-6xl">Projects</h1>

    <p class="text-xl font-extralight leading-relaxed max-w-[75%]">
      A collection of professional work, experiments, and open-source contributions.
    </p>

    <p class="text-xs font-extralight uppercase tracking-[0.2em] opacity-45">
      {projectCount} projects listed
    </p>

    <hr class="divider w-full" />
  </header>

  <section class="flex w-full flex-col items-center gap-10">
    <div class="flex w-full items-end justify-between gap-4">
      <h2 class="italic text-xl">Selected Works</h2>
      <span class="text-xs font-extralight uppercase tracking-[0.18em] opacity-45">lab = experiments</span>
    </div>

    <ul class="flex w-full flex-col gap-4">
      {#each featuredProjects as item}
        <li class="interactive-row flex w-full flex-row items-center justify-between gap-3 self-stretch">
          <div class="flex min-w-0 flex-row items-center gap-4">
            <div class="flex w-full min-w-0 flex-col items-start gap-2">
              <a href={item.href} target="_blank" rel="noreferrer" class="micro-link text-xl font-extrabold italic">
                {item.title}
              </a>
              <p class="text-lg">{item.description}</p>
            </div>
          </div>

          <p class="meta-line text-left sm:text-right">
            {#if item.meta?.length}
              {item.meta.join(" · ")}
            {:else}
              project
            {/if}
          </p>
        </li>
      {/each}
    </ul>

    <hr class="divider w-full" />
  </section>

  <section class="flex w-full flex-col items-center gap-10">
    <div class="flex w-full flex-col items-center gap-2 text-center">
      <h2 class="italic text-xl">Projects</h2>
      <p class="text-xs font-extralight uppercase tracking-[0.18em] opacity-45">in alphabetical order</p>
    </div>

    <ul class="flex w-full flex-col gap-4">
      {#each projects as item}
        <li class="interactive-row flex w-full flex-row items-center justify-between gap-3 self-stretch">
          <div class="flex min-w-0 flex-row items-center gap-4">
            <div class="flex w-full min-w-0 flex-col items-start gap-2">
              <a href={item.href} target="_blank" rel="noreferrer" class="micro-link text-xl font-extrabold italic">
                {item.title}
              </a>
              <p class="text-lg">{item.description}</p>
            </div>
          </div>

          <p class="meta-line text-left sm:text-right">
            {#if item.meta?.length}
              {item.meta.join(" · ")}
            {:else}
              project
            {/if}
          </p>
        </li>
      {/each}
    </ul>

    <blockquote class="w-full border-l border-gray-200 pl-4 text-base font-extralight italic leading-relaxed dark:border-white/20">
      All source code is on
      <a href="https://github.com/GabsEdits" target="_blank" rel="noreferrer" class="micro-link">GitHub</a>
      and often mirrored on
      <a href="https://codeberg.org/gabs" target="_blank" rel="noreferrer" class="micro-link">Codeberg</a>.
    </blockquote>

    <hr class="divider w-full" />
  </section>

  <section class="flex w-full flex-col items-center gap-10">
    <div class="flex w-full flex-col items-center gap-2 text-center">
      <h2 class="italic text-xl">Contributions</h2>
      <p class="text-base font-extralight max-w-[70%]">
        Contributions range from small fixes and translations to deeper engineering work.
      </p>
    </div>

    <ul class="flex w-full flex-col gap-4">
      {#each contributions as item}
        <li class="interactive-row flex w-full flex-row items-center justify-between gap-3 self-stretch">
          <div class="flex min-w-0 flex-row items-center gap-4">
            <div class="flex w-full min-w-0 flex-col items-start gap-2">
              <a href={item.href} target="_blank" rel="noreferrer" class="micro-link text-xl font-extrabold italic">
                {item.title}
              </a>
              <p class="text-lg">{item.description}</p>
            </div>
          </div>

          <p class="meta-line text-left sm:text-right">
            {#if item.meta?.length}
              {item.meta.join(" · ")}
            {:else}
              oss
            {/if}
          </p>
        </li>
      {/each}
    </ul>
  </section>

  <Footer />
</main>

<style>
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

  .meta-line {
    font-size: 0.95rem;
    font-weight: 200;
    font-style: italic;
    text-transform: lowercase;
    opacity: 0.65;
    white-space: nowrap;
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

  @media (max-width: 640px) {
    .meta-line {
      white-space: normal;
      text-align: left;
      min-width: 5rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .micro-link::after {
      transition: none;
      transform: scaleX(1);
    }
  }

  @media (prefers-color-scheme: dark) {
    .divider {
      background-color: oklch(26.9% 0 0);
    }

    .micro-link:focus-visible {
      outline: 2px solid rgba(255, 255, 255, 0.45);
    }
  }
</style>

