interface Point {
  x: number;
  y: number;
}

(() => {
  const icon = document.querySelector<HTMLElement>("[data-floating-icon]");
  const startAnchor = document.querySelector<HTMLElement>("[data-icon-start]");
  const endAnchor = document.querySelector<HTMLElement>("[data-icon-end]");
  const hint = document.querySelector<HTMLElement>("[data-scroll-hint]");
  const root = document.querySelector<HTMLElement>("[data-reveal-root]");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  if (!icon || !startAnchor || !endAnchor || !root) return;

  const clamp = (value: number, minimum: number, maximum: number): number =>
    Math.min(maximum, Math.max(minimum, value));
  const mix = (from: number, to: number, amount: number): number =>
    from + (to - from) * amount;
  const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
  const position = (element: HTMLElement): Point => {
    const rect = element.getBoundingClientRect();
    const size = icon.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - size.width / 2,
      y: rect.top + rect.height / 2 - size.height / 2,
    };
  };

  let frame = 0;
  let hintShown = false;

  // Directly scroll-scrubbed: the icon's position is a pure function of
  // scrollY each frame, so it never lags behind or overshoots the input.
  // The path bows like a hand-drawn drag rather than a straight line, via
  // a quadratic bezier through an offset control point.
  const render = () => {
    frame = 0;
    const start = position(startAnchor);
    const end = position(endAnchor);
    const linear = clamp((scrollY - 20) / 420, 0, 1);
    const progress = reducedMotion.matches ? linear : easeOutCubic(linear);

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy) || 1;
    const nx = -dy / length;
    const ny = dx / length;
    const bow = clamp(length * 0.32, 24, 90);
    const control: Point = {
      x: mix(start.x, end.x, 0.5) + nx * bow,
      y: mix(start.y, end.y, 0.5) + ny * bow,
    };

    const t = progress;
    const it = 1 - t;
    const x = it * it * start.x + 2 * it * t * control.x + t * t * end.x;
    const y = it * it * start.y + 2 * it * t * control.y + t * t * end.y;
    icon.style.transform = `translate3d(${x}px, ${y}px, 0)`;

    const visible = scrollY <= 10;
    if (visible !== hintShown) {
      hintShown = visible;
      hint?.classList.toggle("visible", visible);
    }
  };

  const update = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  const reveal = () => {
    const nodes = [...root.querySelectorAll<HTMLElement>("[data-reveal]")];
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => (node.dataset.visible = "true"));
      return;
    }

    root.classList.add("reveal-enabled");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.visible = "true";
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
  };

  const updateTime = () => {
    const time = document.querySelector<HTMLElement>("[data-local-time]");
    const zone = document.querySelector<HTMLElement>("[data-local-zone]");
    if (!time || !zone) return;
    const now = new Date();
    time.textContent = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Chisinau",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Chisinau",
      timeZoneName: "short",
    }).formatToParts(now);
    zone.textContent = `(${
      parts.find((part) => part.type === "timeZoneName")?.value ?? "EET"
    })`;
    time.classList.remove("animate-pulse");
  };

  const spin = () => {
    if (reducedMotion.matches) return;
    icon.classList.remove("ecliptic-spin");
    // Force reflow so the animation restarts on repeated clicks.
    void icon.offsetWidth;
    icon.classList.add("ecliptic-spin");
  };
  icon.addEventListener("click", spin);
  icon.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      spin();
    }
  });

  render();
  // The hero name is set in a custom webfont loaded with font-display:
  // swap — it renders in a fallback font first, then swaps, shifting the
  // text's width. Re-measure and re-render once the real font is active
  // so the icon doesn't start in the wrong spot before the first scroll.
  document.fonts?.ready.then(render);
  requestAnimationFrame(() => icon.classList.remove("opacity-0"));
  setTimeout(() => hint?.classList.toggle("visible", scrollY <= 10), 1400);
  reveal();
  updateTime();
  setInterval(updateTime, 60_000);
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
})();
