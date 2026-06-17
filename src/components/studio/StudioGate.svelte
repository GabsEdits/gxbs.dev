<script>
  import { onMount } from "svelte";

  let revealEnabled = false;
  let reduceMotion = false;

  onMount(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotion = media.matches;

    if (!reduceMotion) {
      setTimeout(() => { revealEnabled = true; }, 100);
    } else {
      revealEnabled = false;
    }
  });
</script>

<div class="flex flex-col justify-center items-center h-[70vh] font-serif text-center w-full" class:reveal-enabled={revealEnabled}>

  <div class="flex flex-col items-center gap-6" data-reveal>
    <img src="/ecliptic.svg" alt="" aria-hidden="true" class="h-8 mb-2 dark:invert opacity-80" />

    <div class="flex flex-col gap-1">
      <p class="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">Private Access</p>
      <h1 class="text-4xl sm:text-5xl italic font-light">The Console</h1>
    </div>

    <p class="text-sm font-extralight opacity-60 max-w-xs leading-relaxed mt-2">
      A dedicated environment for project tracking, asset management, and architectural review.
    </p>

    <div class="mt-8 p-8 border border-gray-900/10 dark:border-white/10 w-full max-w-md relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/[0.02] dark:via-white/[0.02] to-transparent bg-[length:100%_4px] pointer-events-none"></div>

      <p class="text-xs font-mono opacity-50 mb-4 uppercase tracking-widest text-[#A34D32]">Authentication Required</p>
      <p class="text-sm italic opacity-80 font-light leading-relaxed">
        Please use the unique secure access link provided in your partnership onboarding email.
      </p>
    </div>

    <a href="/" class="micro-link text-xs font-extralight uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity mt-12">
      ← Return to Studio
    </a>

    <a href="/studio/admin" class="micro-link text-[10px] font-extralight uppercase tracking-widest opacity-30 hover:opacity-70 transition-opacity mt-4">
      Owner review console
    </a>
  </div>
</div>

<style>
    .micro-link { position:relative; text-decoration:none; }
    .micro-link::after {
        content:""; position:absolute; left:0; bottom:-0.08em;
        width:100%; height:1px; background:currentColor;
        transform:scaleX(0); transform-origin:left;
        transition:transform 260ms cubic-bezier(0.19,1,0.22,1);
    }
    .micro-link:hover::after,
    .micro-link:focus-visible::after { transform:scaleX(1); }

    .reveal-enabled [data-reveal] {
        opacity: 0; filter: blur(2px); transform: translateY(18px);
        transition:
                opacity 700ms cubic-bezier(0.22,1,0.36,1),
                transform 700ms cubic-bezier(0.22,1,0.36,1),
                filter 700ms cubic-bezier(0.22,1,0.36,1);
    }
    :global(.reveal-enabled [data-reveal]) {
        opacity: 1; filter: none; transform: translateY(0);
    }
</style>