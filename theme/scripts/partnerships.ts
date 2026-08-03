type Scale = "core" | "presence" | "system";
type ProjectType = "design" | "development" | "full";
type Extras = "none" | "launch" | "care" | "both";
type CycleKey = "scale" | "type" | "extras";

interface TierPrices {
  core: number;
  presence: number;
  system: number;
}

interface State {
  scale: Scale | "";
  type: ProjectType | "";
  extras: Extras;
}

(() => {
  const main = document.querySelector<HTMLElement>("main[data-design-core]");
  if (!main) return;

  const number = (name: string): number => Number(main.dataset[name]);
  const prices: Record<ProjectType, TierPrices> = {
    design: {
      core: number("designCore"),
      presence: number("designPresence"),
      system: number("designSystem"),
    },
    development: {
      core: number("developmentCore"),
      presence: number("developmentPresence"),
      system: number("developmentSystem"),
    },
    full: {
      core: number("fullCore"),
      presence: number("fullPresence"),
      system: number("fullSystem"),
    },
  };
  const labels: {
    scale: Record<Scale, string>;
    type: Record<ProjectType, string>;
    extras: Record<Extras, string>;
  } = {
    scale: { core: "Core", presence: "Presence", system: "System" },
    type: {
      design: "Design",
      development: "Development",
      full: "Full package",
    },
    extras: {
      none: "None",
      launch: "Launch support",
      care: "Care plan",
      both: "Both",
    },
  };
  const values: {
    scale: Scale[];
    type: ProjectType[];
    extras: Extras[];
  } = {
    scale: ["core", "presence", "system"],
    type: ["design", "development", "full"],
    extras: ["none", "launch", "care", "both"],
  };
  const state: State = { scale: "", type: "", extras: "none" };
  // `values`/`state`/`labels` are correlated per key (scale->Scale[], etc.)
  // but TS can't express that correlation through a runtime `CycleKey`
  // lookup, so this one boundary is intentionally loosely typed.
  const advance = (key: CycleKey): string => {
    const options = values[key] as readonly string[];
    const currentIndex = options.indexOf(state[key]);
    const next = options[(currentIndex + 1) % options.length];
    (state as Record<CycleKey, string>)[key] = next;
    return next;
  };
  const priceOutput = main.querySelector<HTMLElement>("[data-price-output]");
  const priceBlock = main.querySelector<HTMLElement>("[data-price-block]");
  const pricePlaceholder = main.querySelector<HTMLElement>(
    "[data-price-placeholder]",
  );
  const secureButton = main.querySelector<HTMLButtonElement>(
    "[data-open-form][disabled]",
  );
  const cycleHint = main.querySelector<HTMLElement>("[data-cycle-hint]");

  const total = (): number | null => {
    if (!state.type || !state.scale) return null;
    let amount = prices[state.type][state.scale];
    if (state.extras === "launch" || state.extras === "both") {
      amount += number("launch");
    }
    if (state.extras === "care" || state.extras === "both") {
      amount += number("care");
    }
    return amount;
  };

  const update = () => {
    const amount = total();
    if (priceBlock) priceBlock.hidden = amount === null;
    if (pricePlaceholder) pricePlaceholder.hidden = amount !== null;
    if (secureButton) secureButton.disabled = amount === null;
    if (cycleHint) {
      cycleHint.style.opacity =
        state.scale || state.type || state.extras !== "none" ? "0" : "1";
    }
    if (amount !== null && priceOutput) {
      priceOutput.textContent = amount.toLocaleString("en");
    }
  };

  main.querySelectorAll<HTMLButtonElement>("[data-cycle]").forEach(
    (button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.cycle as CycleKey;
        const next = advance(key);
        const label = button.querySelector("span");
        if (label) {
          label.textContent = (labels[key] as Record<string, string>)[next];
          label.classList.remove("opacity-40");
        }
        update();
      });
    },
  );

  const drawer = document.querySelector<HTMLElement>("[data-project-drawer]");
  if (!drawer) return;

  const openForm = () => {
    const brief = drawer.querySelector<HTMLTextAreaElement>(
      "textarea[name=brief]",
    );
    const amount = total();
    if (brief && !brief.value && state.scale && state.type && amount !== null) {
      brief.value = `${labels.scale[state.scale]} ${
        labels.type[state.type].toLowerCase()
      } project, with ${
        labels.extras[state.extras].toLowerCase()
      }. Estimated at €${amount.toLocaleString("en")}.`;
    }
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    drawer.querySelector<HTMLInputElement>("input[name=name]")?.focus();
  };

  const closeForm = () => {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  main.querySelectorAll("[data-open-form]").forEach((button) =>
    button.addEventListener("click", openForm)
  );
  drawer.querySelector("[data-close-form]")?.addEventListener(
    "click",
    closeForm,
  );
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeForm();
  });

  drawer.querySelector("form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    if (data.get("website")) return;

    const button = form.querySelector<HTMLButtonElement>(
      "button[type=submit]",
    );
    const note = form.querySelector<HTMLElement>("[data-form-note]");
    if (button) button.disabled = true;
    if (button) button.textContent = "Sending…";

    try {
      const response = await fetch(
        "https://cdn.gxbs.dev/api/collections/commissions/records",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName: data.get("name"),
            clientEmail: data.get("email"),
            offer: state.type ? labels.type[state.type] : "Custom",
            tier: state.scale ? labels.scale[state.scale] : "Custom",
            addons: labels.extras[state.extras],
            brief: data.get("brief"),
            status: "new",
          }),
        },
      );
      if (!response.ok) throw new Error("Request failed");
      if (note) note.textContent = "Received. I will be in touch shortly.";
      form.reset();
      setTimeout(closeForm, 1800);
    } catch {
      if (note) {
        note.textContent =
          "Something went wrong. Please email me at me@gxbs.dev.";
      }
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Initiate Project";
      }
    }
  });

  const revealNodes = [...main.querySelectorAll<HTMLElement>("[data-reveal]")];
  if (
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !("IntersectionObserver" in window)
  ) {
    revealNodes.forEach((node) => (node.dataset.visible = "true"));
  } else {
    main.classList.add("reveal-enabled");
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.visible = "true";
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08 });
    revealNodes.forEach((node) => observer.observe(node));
  }
})();
