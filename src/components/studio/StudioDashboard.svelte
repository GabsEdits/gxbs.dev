<script>
  import { onMount } from "svelte";

  export let uuid;

  // DEV TEST VARIABLE!!!!!!!!!!
  // Set to true to bypass backend fetch and load mock data
  const DEV_MODE = true;

  let project = null;
  let loading = true;
  let error = false;
  let revealEnabled = false;

  const MOCK_DATA = {
    client: "Antuan Moldovan",
    projectName: "Project Ethos Arch",
    status: "Phase 02: Infrastructure",
    progress: 68,
    stagingUrl: "https://ethos-staging.gxbs.dev",
    milestones: [
      { name: "Discovery & Scope Definition", status: "Completed" },
      { name: "Editorial UI / UX Concepts", status: "Completed" },
      { name: "Astro / Svelte Implementation", status: "In Progress" },
      { name: "Edge Network Deployment", status: "Pending" },
      { name: "Digital Care Package Handoff", status: "Pending" }
    ],
    vault: [
      { name: "Brand_Guidelines_v2.pdf", size: "2.4 MB" },
      { name: "Architecture_Blueprint.md", size: "12 KB" },
      { name: "Environment_Variables.gpg", size: "4 KB" }
    ],
    logs: [
      { time: "09:41", msg: "Deployed edge functions to chisinau-01 node." },
      { time: "18:22", msg: "Optimized LCP by preloading editorial serif fonts." },
      { time: "14:05", msg: "Client approved Stage 1 Figma layouts." },
      { time: "10:00", msg: "Initialized repository and Deno KV datastore." }
    ]
  };

  onMount(async () => {
    try {
      if (DEV_MODE) {
        // Simulate network delay for effect
        await new Promise(resolve => setTimeout(resolve, 800));
        project = MOCK_DATA;
      } else {
        const res = await fetch(`https://api.gxbs.dev/api/studio/${uuid}`);
        if (!res.ok) throw new Error("Invalid session key");
        project = await res.json();
      }
      setTimeout(() => { revealEnabled = true; }, 50);
    } catch (err) {
      error = true;
    } finally {
      loading = false;
    }
  });
</script>

<main
  class="container mx-auto max-w-full lg:max-w-240 px-4 pb-20 pt-14 lg:pt-24 flex flex-col gap-24 items-center font-serif"
>

{#if loading}
  <div class="h-[70vh] flex flex-col items-center justify-center font-serif gap-4 w-full">
    <span class="relative flex h-3 w-3">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A34D32] opacity-40"></span>
      <span class="relative inline-flex rounded-full h-3 w-3 bg-[#A34D32] opacity-80"></span>
    </span>
    <p class="italic opacity-40 text-sm animate-pulse">Authenticating Console Access...</p>
  </div>
{:else if error}
  <div class="h-[70vh] flex flex-col items-center justify-center font-serif text-center gap-4 w-full">
    <h1 class="text-3xl italic text-[#A34D32]">Session Invalid</h1>
    <p class="opacity-50 text-sm font-light">This console session has expired or the secure key is invalid.</p>
    <a href="/" class="micro-link mt-6 opacity-40 hover:opacity-100 uppercase text-[10px] tracking-widest transition-opacity">Return to Studio</a>
  </div>
{:else}
  <div class="w-full font-serif pb-20" class:reveal-enabled={revealEnabled}>

    <header class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16 border-b border-gray-900/10 dark:border-white/10 pb-8 pt-4" data-reveal>
      <div>
        <p class="text-[10px] font-mono opacity-40 uppercase tracking-[0.25em] mb-3">Active Partnership / {uuid ? uuid.substring(0,8) : 'DEV-ENV'}</p>
        <h1 class="text-4xl sm:text-5xl italic font-light">{project.projectName}</h1>
      </div>
      <div class="text-left md:text-right">
        <p class="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-1">Current Status</p>
        <p class="text-lg italic text-[#A34D32]">{project.status}</p>
      </div>
    </header>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-12 lg:gap-16">

      <div class="xl:col-span-2 flex flex-col gap-14">

        <section data-reveal style="--reveal-delay: 100ms;">
          <h3 class="text-xs font-extralight uppercase tracking-[0.2em] mb-6 opacity-50">Build Progress</h3>
          <div class="w-full bg-gray-900/5 dark:bg-white/5 h-[2px] relative overflow-hidden">
            <div class="absolute left-0 top-0 h-full bg-[#A34D32] transition-all duration-[1.5s] ease-out" style="width: {project.progress}%"></div>
          </div>
          <p class="text-right text-[10px] font-mono mt-3 opacity-40 tracking-widest">{project.progress}% OPTIMIZED</p>
        </section>

        <section data-reveal style="--reveal-delay: 200ms;">
          <h3 class="text-xs font-extralight uppercase tracking-[0.2em] mb-6 opacity-50">The Roadmap</h3>
          <div class="flex flex-col gap-3">
            {#each project.milestones as m}
              <div class="flex justify-between items-center p-4 border border-gray-900/10 dark:border-white/10 transition-colors hover:bg-gray-900/5 dark:hover:bg-white/5">
                <span class="text-base italic font-light {m.status === 'Pending' ? 'opacity-40' : ''}">{m.name}</span>
                <span class="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1
                  {m.status === 'Completed' ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
                   m.status === 'In Progress' ? 'bg-[#A34D32]/10 text-[#A34D32] animate-pulse' :
                   'opacity-30'}">
                  {m.status}
                </span>
              </div>
            {/each}
          </div>
        </section>

        <section data-reveal style="--reveal-delay: 300ms;">
          <h3 class="text-xs font-extralight uppercase tracking-[0.2em] mb-6 opacity-50">Live System Log</h3>
          <div class="bg-gray-900/[0.03] dark:bg-white/[0.03] p-5 border border-gray-900/10 dark:border-white/10 font-mono text-xs leading-relaxed flex flex-col gap-3 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/[0.01] dark:via-white/[0.01] to-transparent bg-[length:100%_4px] pointer-events-none"></div>
            {#each project.logs as log}
              <div class="flex gap-4 opacity-70">
                <span class="text-[#A34D32] shrink-0">[{log.time}]</span>
                <span class="font-light">// {log.msg}</span>
              </div>
            {/each}
          </div>
        </section>

      </div>

      <div class="flex flex-col gap-10">

        <section class="p-6 bg-gray-900/[0.02] dark:bg-white/[0.02] border border-gray-900/10 dark:border-white/10" data-reveal style="--reveal-delay: 400ms;">
          <h3 class="text-xs font-extralight uppercase tracking-[0.2em] mb-5 opacity-50">The Vault</h3>
          <ul class="flex flex-col gap-4">
            {#each project.vault as item}
              <li class="flex justify-between items-center group">
                <a href={item.url || "#"} class="text-sm italic group-hover:text-[#A34D32] transition-colors flex items-center gap-2">
                  <span class="opacity-30 text-[10px] font-mono group-hover:opacity-100 transition-opacity">↓</span>
                  {item.name}
                </a>
                <span class="text-[10px] font-mono opacity-30">{item.size}</span>
              </li>
            {/each}
          </ul>
        </section>

        <section class="p-6 border border-[#A34D32]/30 bg-[#A34D32]/[0.02]" data-reveal style="--reveal-delay: 500ms;">
          <h3 class="text-[10px] font-mono text-[#A34D32] uppercase tracking-[0.2em] mb-3">Staging Gate</h3>
          <p class="text-sm font-extralight opacity-70 mb-5 leading-relaxed">The latest architecture build is compiled and ready for review.</p>
          <a href={project.stagingUrl} target="_blank" class="system-btn w-full">
            Access Preview →
          </a>
        </section>

      </div>

    </div>
  </div>
{/if}
</main>

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

    .system-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.8rem 1.5rem;
        background: #1A1A1A;
        color: #FDFDFB;
        border: 1px solid #1A1A1A;
        font-family: inherit;
        font-style: italic;
        font-size: 0.9375rem;
        cursor: pointer;
        text-decoration: none;
        transition: all 300ms ease;
    }
    .system-btn:hover {
        background: #A34D32;
        border-color: #A34D32;
        transform: translateY(-1px);
    }

    @media (prefers-color-scheme: dark) {
        .system-btn {
            background: #FDFDFB;
            color: #1A1A1A;
            border-color: #FDFDFB;
        }
        .system-btn:hover {
            background: #A34D32;
            color: #FDFDFB;
            border-color: #A34D32;
        }
    }

    [data-reveal] {
        opacity: 0; transform: translateY(15px);
        transition: all 800ms cubic-bezier(0.22,1,0.36,1);
        transition-delay: var(--reveal-delay, 0ms);
    }
    :global(.reveal-enabled) [data-reveal] {
        opacity: 1; transform: translateY(0);
    }
    @media (prefers-reduced-motion: reduce) {
        [data-reveal] { transition: none; opacity: 1; transform: none; }
    }
</style>