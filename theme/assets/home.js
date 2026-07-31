(() => {
  const icon = document.querySelector("[data-floating-icon]");
  const startAnchor = document.querySelector("[data-icon-start]");
  const endAnchor = document.querySelector("[data-icon-end]");
  const hint = document.querySelector("[data-scroll-hint]");
  const root = document.querySelector("[data-reveal-root]");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  if (!icon || !startAnchor || !endAnchor) return;

  const size = { width: 45, height: 21 };
  const clamp = (value, minimum, maximum) =>
    Math.min(maximum, Math.max(minimum, value));
  const mix = (from, to, amount) => from + (to - from) * amount;
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const position = (element) => {
    const rect = element.getBoundingClientRect();
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
    const control = {
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
    const nodes = [...root.querySelectorAll("[data-reveal]")];
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => (node.dataset.visible = "true"));
      return;
    }

    root.classList.add("reveal-enabled");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.dataset.visible = "true";
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
  };

  const updateTime = () => {
    const time = document.querySelector("[data-local-time]");
    const zone = document.querySelector("[data-local-zone]");
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

  render();
  requestAnimationFrame(() => icon.classList.remove("opacity-0"));
  setTimeout(() => hint?.classList.toggle("visible", scrollY <= 10), 1400);
  reveal();
  updateTime();
  setInterval(updateTime, 60_000);
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
})();
