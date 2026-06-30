<script>
  import { onMount } from "svelte";
  import {
    COMMISSION_STATUSES,
    PAYMENT_PROVIDERS,
    PAYMENT_STATUSES,
    buildApprovalMessage,
    createSeedCommissions,
    createStudioAccessCode,
    createStudioSessionId,
    normalizeCommission,
  } from "../../utils/studioWorkflow";
  import { pb } from "../../lib/pocketbase";

  export let uuid;
  export let mode = "client";

  const PB_URL = "https://cdn.gxbs.dev";
  const USE_MOCK_DATA = false; // Set to false to test PocketBase

  let project = null;
  let loading = true;
  let error = false;
  let revealEnabled = false;
  let commissions = [];
  let selectedCommissionId = "";
  let decisionNote = "";
  let denialReason = "";
  let copyState = "";
  let creatingPaymentLinkId = "";
  let markingPaidId = "";

  const statusLabel = {
    [COMMISSION_STATUSES.NEW]: "New",
    [COMMISSION_STATUSES.UNDER_REVIEW]: "Under review",
    [COMMISSION_STATUSES.APPROVED]: "Approved",
    [COMMISSION_STATUSES.DENIED]: "Denied",
  };

  const paymentStatusLabel = {
    [PAYMENT_STATUSES.UNPAID]: "Unpaid",
    [PAYMENT_STATUSES.PENDING]: "Pending",
    [PAYMENT_STATUSES.PAID]: "Paid",
  };

  const STATUS_ORDER = [
    COMMISSION_STATUSES.NEW,
    COMMISSION_STATUSES.UNDER_REVIEW,
    COMMISSION_STATUSES.APPROVED,
    COMMISSION_STATUSES.DENIED,
  ];

  const MOCK_DATA = {
    client: "Antuan Moldovan",
    projectName: "Project Ethos Arch",
    status: "Phase 02: Infrastructure",
    progress: 68,
    paymentStatus: "pending",
    paymentProvider: "kofi",
    paymentUrl: "https://ko-fi.com/gabs",
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

  const toDateLabel = (isoDate) => {
    if (!isoDate) return "-";
    return new Date(isoDate).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const sortCommissions = (items) => {
    return [...items].sort((a, b) => {
      const statusDiff = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  };

  const loadCommissions = async () => {
    try {
      // Fetch directly from PocketBase
      const records = await pb.collection('commissions').getFullList({
        sort: '-created',
      });
      
      // Map PocketBase fields to your internal StudioCommission interface
      // PB uses 'id', 'created', 'updated' by default.
      commissions = sortCommissions(records.map(rec => normalizeCommission({ ...rec, updatedAt: rec.updated, submittedAt: rec.created })));
    } catch {
      commissions = sortCommissions(createSeedCommissions());
      copyState = "Admin API unavailable. Showing fallback data.";
    }
  };

  $: selectedCommission = commissions.find((item) => item.id === selectedCommissionId) ?? null;

  const updateCommission = async (id, patch) => {
    try {
      const record = await pb.collection('commissions').update(id, patch);
      const updated = normalizeCommission({
        ...record,
        updatedAt: record.updated,
        submittedAt: record.created
      });
      
      commissions = sortCommissions(
        commissions.map((item) => (item.id === id ? updated : item))
      );
      return true;
    } catch {
      copyState = "Could not save changes. Try again.";
      return false;
    }
  };

  const markUnderReview = async (id) => {
    const ok = await updateCommission(id, {
      status: COMMISSION_STATUSES.UNDER_REVIEW,
      decisionNote: decisionNote.trim() || "Moved to review.",
    });
    if (ok) decisionNote = "";
  };

  const approveCommission = async (id) => {
    const accessCode = createStudioAccessCode();
    const sessionId = createStudioSessionId();
    const approvedAt = new Date().toISOString();

    const ok = await updateCommission(id, {
      status: COMMISSION_STATUSES.APPROVED,
      accessCode,
      sessionId,
      approvedAt,
      decisionNote: decisionNote.trim() || "Approved. Invite generated.",
      paymentStatus: PAYMENT_STATUSES.UNPAID,
      paymentProvider: PAYMENT_PROVIDERS.KOFI,
      paymentUrl: "",
      paymentReference: "",
      paidAt: "",
    });

    if (ok) decisionNote = "";
  };

  const denyCommission = async (id) => {
    if (!denialReason.trim()) {
      copyState = "Add a denial reason first.";
      return;
    }

    const ok = await updateCommission(id, {
      status: COMMISSION_STATUSES.DENIED,
      accessCode: "",
      sessionId: "",
      approvedAt: "",
      decisionNote: denialReason.trim(),
      paymentStatus: PAYMENT_STATUSES.UNPAID,
      paymentProvider: PAYMENT_PROVIDERS.KOFI,
      paymentUrl: "",
      paymentReference: "",
      paidAt: "",
    });

    if (ok) denialReason = "";
  };

  const copyText = async (value, successMessage) => {
    try {
      await navigator.clipboard.writeText(value);
      copyState = successMessage;
      window.setTimeout(() => {
        if (copyState === successMessage) copyState = "";
      }, 2200);
    } catch {
      copyState = "Clipboard unavailable. Copy manually.";
    }
  };

  const copyApproval = async (commission) => {
    if (!commission?.accessCode || !commission?.sessionId) return;

    const origin = window.location.origin;
    const text = buildApprovalMessage({
      clientName: commission.clientName,
      projectTitle: commission.projectTitle,
      accessCode: commission.accessCode,
      studioLink: `${origin}/studio/${commission.sessionId}`,
      paymentLink: commission.paymentUrl,
    });
    await copyText(text, "Approval message copied.");
  };

  const formatMoney = (amount, currency = "EUR") => {
    const value = Number(amount ?? 0);
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const createPaymentLink = async (commission) => {
    if (!commission) return;

    creatingPaymentLinkId = commission.id;
    copyState = "Creating payment link...";

    try {
      const response = await fetch("/api/studio/payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commissionId: commission.id,
          provider: PAYMENT_PROVIDERS.KOFI,
          paymentUrl: "https://ko-fi.com/gabs",
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.ok || !payload.paymentUrl) {
        throw new Error(payload.error || "Could not create payment link.");
      }

      await loadCommissions();
      selectedCommissionId = commission.id;

      copyState = "Payment link generated.";
    } catch (err) {
      copyState = err instanceof Error ? err.message : "Failed to create payment link.";
    } finally {
      creatingPaymentLinkId = "";
      window.setTimeout(() => {
        if (copyState === "Payment link generated.") copyState = "";
      }, 2200);
    }
  };

  const markPaymentPaid = async (commission) => {
    if (!commission?.paymentUrl) {
      copyState = "Generate a payment link first.";
      return;
    }

    markingPaidId = commission.id;
    copyState = "Marking payment as paid...";

    try {
      const response = await fetch("/api/studio/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commissionId: commission.id,
          reference: "manual-kofi-confirmation",
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Could not update payment status.");
      }

      await loadCommissions();
      selectedCommissionId = commission.id;
      copyState = "Payment marked as paid.";
    } catch (err) {
      copyState = err instanceof Error ? err.message : "Failed to mark payment as paid.";
    } finally {
      markingPaidId = "";
    }
  };

  const copyStudioLink = async (commission) => {
    if (!commission?.sessionId) return;
    await copyText(`${window.location.origin}/studio/${commission.sessionId}`, "Studio link copied.");
  };

  onMount(async () => {
    if (mode === "admin") {
      await loadCommissions();
      selectedCommissionId = commissions[0]?.id ?? "";
      loading = false;
      window.setTimeout(() => {
        revealEnabled = true;
      }, 40);
      return;
    }

    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 800));
        project = MOCK_DATA;
      } else {
        // Client view: Fetch specific project by session ID or Access Code
        // Assumes you have a field 'sessionId' in the collection
        project = await pb.collection('commissions').getFirstListItem(`sessionId="${uuid}"`);
      }
      revealEnabled = true;
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
{:else if mode === "admin"}
  <div class="w-full font-serif pb-20" class:reveal-enabled={revealEnabled}>
    <header class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-gray-900/10 dark:border-white/10 pb-8 pt-4" data-reveal>
      <div>
        <p class="text-[10px] font-mono opacity-40 uppercase tracking-[0.25em] mb-3">Studio Control / Owner Workspace</p>
        <h1 class="text-4xl sm:text-5xl italic font-light">Commissions Pipeline</h1>
      </div>
      <p class="text-sm font-light opacity-55 max-w-sm">
        Review requests, approve or deny, and generate a studio invite instantly.
      </p>
    </header>

    <div class="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-8 lg:gap-10">
      <section class="border border-gray-900/10 dark:border-white/10" data-reveal style="--reveal-delay: 60ms;">
        <div class="px-4 py-3 border-b border-gray-900/10 dark:border-white/10 flex items-center justify-between">
          <h2 class="text-sm uppercase tracking-[0.2em] opacity-55 font-mono">Requests</h2>
          <span class="text-xs opacity-45">{commissions.length}</span>
        </div>

        <div class="flex flex-col">
          {#each commissions as item}
            <button
              type="button"
              class="request-item"
              class:active={selectedCommissionId === item.id}
              on:click={() => {
                selectedCommissionId = item.id;
                decisionNote = "";
                denialReason = "";
              }}
            >
              <span class="flex items-start justify-between gap-3">
                <span class="text-left">
                  <span class="block text-base italic">{item.projectTitle}</span>
                  <span class="block text-xs opacity-60 font-sans">{item.clientName} - {item.offer} / {item.tier}</span>
                </span>
                <span class={`status-badge status-${item.status}`}>{statusLabel[item.status]}</span>
              </span>
              <span class="block text-xs opacity-45 font-mono mt-3">Submitted {toDateLabel(item.submittedAt)}</span>
            </button>
          {/each}
        </div>
      </section>

      {#if selectedCommission}
        <section class="border border-gray-900/10 dark:border-white/10 p-6 lg:p-8" data-reveal style="--reveal-delay: 120ms;">
          <div class="flex flex-col gap-4">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p class="text-[10px] font-mono uppercase tracking-[0.2em] opacity-45">Commission</p>
                <h3 class="text-3xl italic">{selectedCommission.projectTitle}</h3>
                <p class="font-sans text-sm opacity-60 mt-2">{selectedCommission.clientName} - {selectedCommission.clientEmail}</p>
              </div>
              <span class={`status-badge status-${selectedCommission.status}`}>{statusLabel[selectedCommission.status]}</span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm font-sans">
              <div class="p-3 border border-gray-900/10 dark:border-white/10">
                <p class="text-[10px] uppercase tracking-[0.14em] opacity-45">Offer</p>
                <p class="mt-1 italic text-base">{selectedCommission.offer}</p>
              </div>
              <div class="p-3 border border-gray-900/10 dark:border-white/10">
                <p class="text-[10px] uppercase tracking-[0.14em] opacity-45">Tier</p>
                <p class="mt-1 italic text-base">{selectedCommission.tier}</p>
              </div>
            </div>

            <div class="p-4 bg-gray-900/[0.02] dark:bg-white/[0.02] border border-gray-900/10 dark:border-white/10">
              <p class="text-[10px] uppercase tracking-[0.2em] opacity-45 mb-2">Brief</p>
              <p class="font-sans text-sm leading-relaxed opacity-80">{selectedCommission.brief}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="p-3 border border-gray-900/10 dark:border-white/10">
                <p class="text-[10px] uppercase tracking-[0.14em] opacity-45">Submitted</p>
                <p class="mt-1 text-sm">{toDateLabel(selectedCommission.submittedAt)}</p>
              </div>
              <div class="p-3 border border-gray-900/10 dark:border-white/10">
                <p class="text-[10px] uppercase tracking-[0.14em] opacity-45">Updated</p>
                <p class="mt-1 text-sm">{toDateLabel(selectedCommission.updatedAt)}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm font-sans">
              <div class="p-3 border border-gray-900/10 dark:border-white/10">
                <p class="text-[10px] uppercase tracking-[0.14em] opacity-45">Quoted amount</p>
                <p class="mt-1 italic text-base">{formatMoney(selectedCommission.quotedAmount, selectedCommission.currency)}</p>
              </div>
              <div class="p-3 border border-gray-900/10 dark:border-white/10">
                <p class="text-[10px] uppercase tracking-[0.14em] opacity-45">Payment status</p>
                <p class="mt-2">
                  <span class={`status-badge status-payment-${selectedCommission.paymentStatus}`}>
                    {paymentStatusLabel[selectedCommission.paymentStatus] ?? "Unpaid"}
                  </span>
                </p>
              </div>
              <div class="p-3 border border-gray-900/10 dark:border-white/10">
                <p class="text-[10px] uppercase tracking-[0.14em] opacity-45">Paid at</p>
                <p class="mt-1 text-sm">{toDateLabel(selectedCommission.paidAt)}</p>
              </div>
            </div>

            {#if selectedCommission.status !== COMMISSION_STATUSES.DENIED}
              <label class="form-label" for="decision-note">Internal note</label>
              <textarea
                id="decision-note"
                class="admin-textarea"
                bind:value={decisionNote}
                placeholder="Add internal notes for review or approval."
                rows="3"
              ></textarea>
            {/if}

            <div class="flex flex-wrap items-center gap-3 pt-1">
              {#if selectedCommission.status === COMMISSION_STATUSES.NEW}
                <button type="button" class="system-btn" on:click={() => markUnderReview(selectedCommission.id)}>Move to review</button>
              {/if}

              {#if selectedCommission.status === COMMISSION_STATUSES.NEW || selectedCommission.status === COMMISSION_STATUSES.UNDER_REVIEW}
                <button type="button" class="system-btn system-btn-accent" on:click={() => approveCommission(selectedCommission.id)}>
                  Approve + generate invite
                </button>
              {/if}
            </div>

            {#if selectedCommission.status === COMMISSION_STATUSES.NEW || selectedCommission.status === COMMISSION_STATUSES.UNDER_REVIEW}
              <div class="pt-3 border-t border-gray-900/10 dark:border-white/10">
                <label class="form-label" for="denial-reason">Deny reason (client-facing)</label>
                <textarea
                  id="denial-reason"
                  class="admin-textarea"
                  bind:value={denialReason}
                  rows="2"
                  placeholder="Example: Timeline mismatch for current queue."
                ></textarea>
                <button type="button" class="system-btn mt-3" on:click={() => denyCommission(selectedCommission.id)}>Deny request</button>
              </div>
            {/if}

            {#if selectedCommission.status === COMMISSION_STATUSES.APPROVED}
              <div class="pt-3 border-t border-gray-900/10 dark:border-white/10 flex flex-col gap-3">
                <div class="p-3 border border-[#A34D32]/35 bg-[#A34D32]/[0.03]">
                  <p class="text-[10px] uppercase tracking-[0.2em] opacity-60">Studio invite</p>
                  <p class="text-sm mt-2 font-mono">Code: {selectedCommission.accessCode}</p>
                  <p class="text-sm mt-1 font-mono break-all">Session: /studio/{selectedCommission.sessionId}</p>
                </div>
                <div class="p-3 border border-gray-900/10 dark:border-white/10 bg-gray-900/[0.02] dark:bg-white/[0.02]">
                  <p class="text-[10px] uppercase tracking-[0.2em] opacity-60">Payment link</p>
                  <p class="text-sm mt-2 font-mono break-all">
                    {selectedCommission.paymentUrl || "Not generated yet."}
                  </p>
                  <p class="text-xs mt-2 opacity-55 font-mono">Provider: {selectedCommission.paymentProvider}</p>
                  {#if selectedCommission.paymentReference}
                    <p class="text-xs mt-2 opacity-55 font-mono">Reference: {selectedCommission.paymentReference}</p>
                  {/if}
                </div>
                <div class="flex flex-wrap gap-3">
                  <button type="button" class="system-btn" on:click={() => copyApproval(selectedCommission)}>Copy approval message</button>
                  <button type="button" class="system-btn" on:click={() => copyStudioLink(selectedCommission)}>Copy studio link</button>
                  <button
                    type="button"
                    class="system-btn"
                    disabled={creatingPaymentLinkId === selectedCommission.id}
                    on:click={() => createPaymentLink(selectedCommission)}
                  >
                    {creatingPaymentLinkId === selectedCommission.id ? "Creating link..." : "Create Ko-fi link"}
                  </button>
                  <button
                    type="button"
                    class="system-btn"
                    disabled={markingPaidId === selectedCommission.id || !selectedCommission.paymentUrl}
                    on:click={() => markPaymentPaid(selectedCommission)}
                  >
                    {markingPaidId === selectedCommission.id ? "Updating..." : "Mark paid"}
                  </button>
                  {#if selectedCommission.paymentUrl}
                    <a href={selectedCommission.paymentUrl} target="_blank" rel="noreferrer" class="system-btn">
                      Open payment page →
                    </a>
                  {/if}
                </div>
              </div>
            {/if}

            {#if selectedCommission.decisionNote}
              <div class="p-3 border border-gray-900/10 dark:border-white/10 bg-gray-900/[0.02] dark:bg-white/[0.02]">
                <p class="text-[10px] uppercase tracking-[0.16em] opacity-45">Decision note</p>
                <p class="text-sm mt-2 opacity-75">{selectedCommission.decisionNote}</p>
              </div>
            {/if}

            {#if copyState}
              <p class="text-sm text-[#A34D32]">{copyState}</p>
            {/if}
          </div>
        </section>
      {/if}
    </div>
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

        {#if project.paymentUrl || project.paypalCheckoutUrl || project.paymentStatus}
          <section class="p-6 border border-gray-900/10 dark:border-white/10" data-reveal style="--reveal-delay: 560ms;">
            <h3 class="text-[10px] font-mono uppercase tracking-[0.2em] mb-3 opacity-55">Payment</h3>
            <p class="text-sm font-extralight opacity-70 mb-3 leading-relaxed">
              Status: {project.paymentStatus || "unpaid"}
            </p>
            {#if project.paymentUrl || project.paypalCheckoutUrl}
              <a href={project.paymentUrl || project.paypalCheckoutUrl} target="_blank" rel="noreferrer" class="system-btn w-full">
                Complete payment →
              </a>
            {/if}
          </section>
        {/if}

      </div>

    </div>
  </div>
{/if}
</main>

<style>
    .request-item {
        width: 100%;
        border: none;
        border-bottom: 1px solid rgba(17,24,39,0.1);
        background: transparent;
        padding: 1rem;
        text-align: left;
        transition: background 180ms ease;
        cursor: pointer;
    }
    .request-item:hover,
    .request-item.active {
        background: rgba(17,24,39,0.04);
    }

    :global(.status-badge) {
        font-family: "PPNeueMontreal", "Inter", sans-serif;
        font-size: 0.65rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 0.25rem 0.5rem;
        border: 1px solid rgba(17,24,39,0.16);
    }
    :global(.status-new) {
        color: #6b7280;
    }

    :global(.status-under_review) {
        color: #A34D32;
        border-color: rgba(163,77,50,0.5);
    }
    :global(.status-approved) {
        color: #15803d;
        border-color: rgba(21,128,61,0.4);
    }
    :global(.status-denied) {
        color: #b91c1c;
        border-color: rgba(185,28,28,0.35);
    }
    :global(.status-payment-unpaid) {
        color: #9a3412;
        border-color: rgba(154,52,18,0.35);
    }
    :global(.status-payment-pending) {
        color: #A34D32;
        border-color: rgba(163,77,50,0.45);
    }
    :global(.status-payment-paid) {
        color: #15803d;
        border-color: rgba(21,128,61,0.4);
    }

    .form-label {
        font-family: "PPNeueMontreal", "Inter", sans-serif;
        font-size: 0.67rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        opacity: 0.55;
    }

    .admin-textarea {
        width: 100%;
        border: 1px solid rgba(17,24,39,0.16);
        background: transparent;
        font-family: "PPNeueMontreal", "Inter", sans-serif;
        font-size: 0.9rem;
        font-weight: 300;
        padding: 0.7rem 0.75rem;
        resize: vertical;
        min-height: 80px;
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
    .system-btn:disabled {
        opacity: 0.45;
        cursor: default;
        transform: none;
    }
    .system-btn:hover {
        background: #A34D32;
        border-color: #A34D32;
        transform: translateY(-1px);
    }
    .system-btn.system-btn-accent {
        background: #A34D32;
        border-color: #A34D32;
        color: #FDFDFB;
    }
    .system-btn.system-btn-accent:hover {
        filter: brightness(1.05);
    }

    @media (prefers-color-scheme: dark) {
        .request-item {
            border-bottom-color: rgba(255,255,255,0.1);
        }
        .request-item:hover,
        .request-item.active {
            background: rgba(255,255,255,0.05);
        }
        :global(.status-badge) {
            border-color: rgba(255,255,255,0.25);
        }
        .admin-textarea {
            border-color: rgba(255,255,255,0.2);
        }
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
        .system-btn.system-btn-accent {
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
    .reveal-enabled [data-reveal] {
        opacity: 1; transform: translateY(0);
    }
    @media (prefers-reduced-motion: reduce) {
        [data-reveal] { transition: none; opacity: 1; transform: none; }
    }
</style>