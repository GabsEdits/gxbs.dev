(() => {
  const main = document.querySelector("main[data-design-core]");
  if (!main) return;

  const number = (name) => Number(main.dataset[name]);
  const prices = {
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
  const labels = {
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
  const values = {
    scale: ["core", "presence", "system"],
    type: ["design", "development", "full"],
    extras: ["none", "launch", "care", "both"],
  };
  const state = { scale: "", type: "", extras: "none" };
  const priceOutput = main.querySelector("[data-price-output]");
  const priceBlock = main.querySelector("[data-price-block]");
  const pricePlaceholder = main.querySelector("[data-price-placeholder]");
  const secureButton = main.querySelector("[data-open-form][disabled]");
  const cycleHint = main.querySelector("[data-cycle-hint]");

  const total = () => {
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
    priceBlock.hidden = amount === null;
    pricePlaceholder.hidden = amount !== null;
    secureButton.disabled = amount === null;
    cycleHint.style.opacity =
      state.scale || state.type || state.extras !== "none" ? "0" : "1";
    if (amount !== null) priceOutput.textContent = amount.toLocaleString("en");
  };

  main.querySelectorAll("[data-cycle]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.cycle;
      const options = values[key];
      state[key] = options[(options.indexOf(state[key]) + 1) % options.length];
      const label = button.querySelector("span");
      label.textContent = labels[key][state[key]];
      label.classList.remove("opacity-40");
      update();
    });
  });

  const drawer = document.querySelector("[data-project-drawer]");

  const openForm = () => {
    const brief = drawer.querySelector("textarea[name=brief]");
    const amount = total();
    if (!brief.value && state.scale && state.type) {
      brief.value = `${labels.scale[state.scale]} ${
        labels.type[state.type].toLowerCase()
      } project, with ${
        labels.extras[state.extras].toLowerCase()
      }. Estimated at €${amount.toLocaleString("en")}.`;
    }
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    drawer.querySelector("input[name=name]").focus();
  };

  const closeForm = () => {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  main.querySelectorAll("[data-open-form]").forEach((button) =>
    button.addEventListener("click", openForm)
  );
  drawer.querySelector("[data-close-form]").addEventListener(
    "click",
    closeForm,
  );
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeForm();
  });

  drawer.querySelector("form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get("website")) return;

    const button = form.querySelector("button[type=submit]");
    const note = form.querySelector("[data-form-note]");
    button.disabled = true;
    button.textContent = "Sending…";

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
      note.textContent = "Received. I will be in touch shortly.";
      form.reset();
      setTimeout(closeForm, 1800);
    } catch {
      note.textContent =
        "Something went wrong. Please email me at me@gxbs.dev.";
    } finally {
      button.disabled = false;
      button.textContent = "Initiate Project";
    }
  });

  const revealNodes = [...main.querySelectorAll("[data-reveal]")];
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
        entry.target.dataset.visible = "true";
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08 });
    revealNodes.forEach((node) => observer.observe(node));
  }
})();
