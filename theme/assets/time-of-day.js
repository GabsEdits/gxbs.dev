/* ------------------------------------------------------------
         4-State Time-of-Day System
         Boundaries shift with the season using a rough sunrise/sunset
         model (fixed reference latitude, no geolocation, no network).
         ------------------------------------------------------------ */
const modes = [
  { id: "morning", greeting: "Good Morning" },
  { id: "afternoon", greeting: "Good Afternoon" },
  { id: "evening", greeting: "Good Evening" },
  { id: "night", greeting: "Good Night" },
];

// Generic mid-latitude reference so the curve is seasonal without
// asking anyone where they are.
const REFERENCE_LATITUDE = 45;

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / 86400000);
}

// Returns { sunrise, sunset } as decimal local hours (e.g. 5.5 = 5:30am).
// Standard solar-declination / hour-angle approximation. Ignores the
// equation of time and real longitude, so it's a vibe, not an almanac.
function sunTimes(date) {
  const n = dayOfYear(date);
  const declination = 23.44 *
    Math.sin(((360 / 365) * (n + 284) * Math.PI) / 180);
  const latRad = (REFERENCE_LATITUDE * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;

  let cosH = -Math.tan(latRad) * Math.tan(decRad);
  cosH = Math.min(1, Math.max(-1, cosH)); // clamp for polar edge cases
  const hourAngle = (Math.acos(cosH) * 180) / Math.PI;
  const halfDay = hourAngle / 15;

  return { sunrise: 12 - halfDay, sunset: 12 + halfDay };
}

function boundsForToday() {
  const { sunrise, sunset } = sunTimes(new Date());
  return {
    sunrise,
    morningEnd: 12, // solar noon
    eveningStart: sunset - 1, // golden hour before sunset
    nightStart: sunset + 1.5, // dusk fades out
  };
}

let currentModeIndex = 0;

function setMode(index) {
  currentModeIndex = index % modes.length;
  const currentMode = modes[currentModeIndex];

  modes.forEach((m) =>
    document.documentElement.classList.remove(`mode-${m.id}`)
  );
  document.documentElement.classList.add(`mode-${currentMode.id}`);

  // Not every layout has the hero greeting (e.g. post pages) - the
  // background/mode system still applies there, just silently.
  const prefixEl = document.getElementById("greeting-prefix");
  if (prefixEl) prefixEl.textContent = `${currentMode.greeting}, I'm`;
}

function modeIndexForHour(hour, bounds) {
  if (hour >= bounds.sunrise && hour < bounds.morningEnd) return 0;
  if (hour >= bounds.morningEnd && hour < bounds.eveningStart) return 1;
  if (hour >= bounds.eveningStart && hour < bounds.nightStart) return 2;
  return 3;
}

let manualOverride = false;

function syncModeToClock() {
  if (manualOverride) return;
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  setMode(modeIndexForHour(hour, boundsForToday()));
}

syncModeToClock();
setInterval(syncModeToClock, 5 * 60 * 1000);

function cycleMode() {
  manualOverride = true; // spacebar is a manual preview, not the real clock
  setMode(currentModeIndex + 1);
}

document.addEventListener("keydown", function (event) {
  if (
    event.code !== "Space" || event.repeat ||
    event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
    event.target.closest("a, button, input, textarea, select, [contenteditable]")
  ) return;
  event.preventDefault();
  cycleMode();
});

function initializeClouds() {
  const sky = document.querySelector(".sky");
  if (!sky) return;

  const motion = window.matchMedia(
    "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
  );
  let x = 0;
  let y = 0;
  let targetX = 0;
  let targetY = 0;
  let frame = 0;
  let previousTime = 0;

  function animate(time) {
    const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16;
    previousTime = time;
    const easing = 1 - Math.exp(-elapsed / 180);
    x += (targetX - x) * easing;
    y += (targetY - y) * easing;
    const settled = Math.abs(targetX - x) < 0.02 &&
      Math.abs(targetY - y) < 0.02;
    if (settled) {
      x = targetX;
      y = targetY;
    }
    sky.style.setProperty("--cloud-x", `${x}px`);
    sky.style.setProperty("--cloud-y", `${y}px`);
    frame = settled ? 0 : requestAnimationFrame(animate);
    if (settled) previousTime = 0;
  }

  function moveTo(nextX, nextY) {
    targetX = nextX;
    targetY = nextY;
    if (!frame) frame = requestAnimationFrame(animate);
  }

  window.addEventListener("pointermove", (event) => {
    if (!motion.matches || event.pointerType !== "mouse") return;
    moveTo(
      (event.clientX / window.innerWidth - 0.5) * -24,
      (event.clientY / window.innerHeight - 0.5) * -16,
    );
  }, { passive: true });

  document.documentElement.addEventListener("pointerleave", () => {
    if (motion.matches) moveTo(0, 0);
  });
  window.addEventListener("blur", reset);
  motion.addEventListener("change", reset);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) reset();
  });

  function reset() {
    cancelAnimationFrame(frame);
    frame = previousTime = x = y = targetX = targetY = 0;
    sky.style.removeProperty("--cloud-x");
    sky.style.removeProperty("--cloud-y");
  }
}

function initializeContactSheet() {
  const trigger = document.getElementById("contact-trigger");
  const sheet = document.getElementById("contact-sheet");
  if (!trigger || !sheet) return;

  if (!("showPopover" in sheet)) {
    trigger.addEventListener("click", () => {
      window.location.href = "mailto:me@gxbs.dev";
    });
    return;
  }

  let closeTimer;
  let wasOpenOnPress = false;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

  function openSheet() {
    clearTimeout(closeTimer);
    if (!sheet.matches(":popover-open")) sheet.showPopover();
  }

  function closeSoon() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      if (
        trigger.matches(":hover") || sheet.matches(":hover") ||
        document.activeElement === trigger || sheet.contains(document.activeElement)
      ) return;
      if (sheet.matches(":popover-open")) sheet.hidePopover();
    }, 90);
  }

  trigger.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse" && canHover.matches) openSheet();
  });
  trigger.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") closeSoon();
  });
  trigger.addEventListener("focus", () => {
    if (trigger.matches(":focus-visible")) openSheet();
  });
  trigger.addEventListener("blur", closeSoon);
  trigger.addEventListener("pointerdown", () => {
    wasOpenOnPress = sheet.matches(":popover-open");
  });
  trigger.addEventListener("click", (event) => {
    if (
      event.detail > 0 &&
      (event.pointerType === "touch" || window.matchMedia("(hover: none)").matches) &&
      wasOpenOnPress
    ) {
      clearTimeout(closeTimer);
      sheet.hidePopover();
    } else {
      openSheet();
    }
    wasOpenOnPress = false;
  });
  sheet.addEventListener("pointerenter", () => clearTimeout(closeTimer));
  sheet.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") closeSoon();
  });
  sheet.addEventListener("focusin", () => clearTimeout(closeTimer));
  sheet.addEventListener("focusout", closeSoon);

  function positionSheet() {
    const anchor = trigger.getBoundingClientRect();
    const gap = 8;
    const inset = 16;
    const width = sheet.offsetWidth;
    const height = sheet.offsetHeight;
    const beside = anchor.right + gap + width <= window.innerWidth - inset;
    const left = beside
      ? anchor.right + gap
      : Math.max(inset, Math.min(anchor.left, window.innerWidth - width - inset));
    const below = anchor.bottom + gap;
    const top = beside
      ? anchor.top + (anchor.height - height) / 2
      : below + height <= window.innerHeight - inset
        ? below
        : Math.max(inset, anchor.top - height - gap);
    sheet.style.left = `${left}px`;
    sheet.style.top = `${top}px`;
    sheet.style.transformOrigin = `${anchor.left + anchor.width / 2 - left}px ${top < anchor.top ? "bottom" : "top"}`;
  }

  sheet.addEventListener("beforetoggle", (event) => {
    trigger.setAttribute("aria-expanded", String(event.newState === "open"));
    if (event.newState === "open") {
      const anchor = trigger.getBoundingClientRect();
      const beside = window.innerWidth >= 640;
      sheet.style.left = `${beside ? anchor.right + 8 : anchor.left}px`;
      sheet.style.top = `${beside ? anchor.top : anchor.bottom + 8}px`;
    }
  });
  sheet.addEventListener("toggle", (event) => {
    if (event.newState === "open") positionSheet();
  });
  window.addEventListener("resize", () => {
    if (sheet.matches(":popover-open")) positionSheet();
  });
  window.addEventListener("scroll", () => {
    if (sheet.matches(":popover-open")) sheet.hidePopover();
  }, { passive: true });
}

/* ------------------------------------------------------------
         Name Transition System
         ------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", initializePage);

function initializePage() {
  setMode(currentModeIndex);
  initializeClouds();
  initializeContactSheet();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add("theme-ready");
    });
  });

  const names = ["Gabriel Cozma", "Gabs"];
  let currentIndex = 0;

  function rotateName() {
    const mainName = document.getElementById("main-name");
    if (!mainName) return; // no name carousel on this layout (e.g. post pages)

    currentIndex = (currentIndex + 1) % names.length;
    mainName.classList.add("transition-out");

    setTimeout(() => {
      mainName.textContent = names[currentIndex];
      mainName.classList.remove("transition-out");
      mainName.classList.add("transition-prep");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          mainName.classList.remove("transition-prep");
        });
      });
    }, 400);
  }

  setInterval(rotateName, 3000);

  const revealTargets = document.querySelectorAll(
    document.body.classList.contains("home-page")
      ? ".home-hero, .paragraph-block p, .paragraph-block h2, .work-list li, .sponsors"
      : document.body.classList.contains("partnership-page")
        ? ".partnership-hero, .partnership-section"
        : ".post-aside, .post-body > *, .post-content > .back-link, .post-header, .post-list-item",
  );
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!reducedMotion.matches && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.remove("reveal-pending");
        entry.target.classList.add("content-ready");
        revealObserver.unobserve(entry.target);
      }
    }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });

    for (const target of revealTargets) {
      target.classList.add("reveal-pending");
      revealObserver.observe(target);
      target.addEventListener("focusin", () => {
        target.classList.remove("reveal-pending");
        revealObserver.unobserve(target);
      }, { once: true });
    }

    reducedMotion.addEventListener("change", (event) => {
      if (!event.matches) return;
      revealObserver.disconnect();
      for (const target of revealTargets) {
        target.classList.remove("reveal-pending", "content-ready");
      }
    });
  }

  const scrollCue = document.querySelector(".scroll-cue");
  const aboutSection = document.getElementById("about");

  if (scrollCue && aboutSection) {
    let cancelScroll = () => {};

    scrollCue.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      cancelScroll();
      if (reducedMotion.matches) return;
      event.preventDefault();

      const scrollContainer =
        document.body.scrollHeight > document.body.clientHeight
          ? document.body
          : document.scrollingElement;
      const start = scrollContainer.scrollTop;
      const destination = Math.min(
        start + aboutSection.getBoundingClientRect().top - 32,
        scrollContainer.scrollHeight - scrollContainer.clientHeight,
      );
      const startedAt = performance.now();
      const duration = 3200;
      const listeners = new AbortController();
      let frame;

      cancelScroll = () => {
        cancelAnimationFrame(frame);
        listeners.abort();
      };

      for (const type of ["wheel", "touchstart", "pointerdown", "keydown"]) {
        window.addEventListener(type, cancelScroll, {
          passive: true,
          signal: listeners.signal,
        });
      }
      reducedMotion.addEventListener("change", cancelScroll, {
        signal: listeners.signal,
      });

      function scrollFrame(now) {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = progress * progress * (3 - 2 * progress);
        scrollContainer.scrollTo({
          top: start + (destination - start) * eased,
          behavior: "instant",
        });

        if (progress < 1) {
          frame = requestAnimationFrame(scrollFrame);
        } else {
          cancelScroll();
          history.replaceState(null, "", "#about");
          aboutSection.focus({ preventScroll: true });
        }
      }

      frame = requestAnimationFrame(scrollFrame);
    });
  }
}
