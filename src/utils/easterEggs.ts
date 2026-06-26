/**
 * Easter egg interactions throughout the site.
 * This file owns all behavior so components stay clean.
 */

const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a"
] as const;

const HERO_CLICK_THRESHOLD = 5;
const SNUG_CLICK_THRESHOLD = 7;

const HERO_SELECTOR = "[data-easter-hero-name]";
const ICON_SELECTOR = "[data-easter-svg-icon]";
const SNUG_SELECTOR = "[data-easter-snug]";

export function initEasterEggs() {
  let konamiIndex = 0;
  let lastGKeyTime = 0;
  let heroClicks = 0;
  let snugClicks = 0;

  const handleKonamiCode = (e: KeyboardEvent) => {
    const key = normalizeKonamiKey(e.key);

    if (key === KONAMI_CODE[konamiIndex]) {
      konamiIndex += 1;
      if (konamiIndex === KONAMI_CODE.length) {
        triggerKonamiEffect();
        konamiIndex = 0;
      }
      return;
    }

    konamiIndex = 0;
  };

  const handleSecretG = (e: KeyboardEvent) => {
    if ((e.key === "g" || e.key === "G") && !e.ctrlKey && !e.metaKey) {
      const now = Date.now();
      if (now - lastGKeyTime < 300) {
        triggerSecretMessage();
        lastGKeyTime = 0;
      } else {
        lastGKeyTime = now;
      }
    }
  };

  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const iconTrigger = target.closest(ICON_SELECTOR) as HTMLElement | null;
    if (iconTrigger) {
      spinFloatingIcon(iconTrigger);
      return;
    }

    const heroTrigger = target.closest(HERO_SELECTOR) as HTMLElement | null;
    if (heroTrigger) {
      heroClicks += 1;
      animateElement(heroTrigger, "easterNameWobble", 400, "cubic-bezier(0.68, -0.55, 0.265, 1.55)");

      if (heroClicks >= HERO_CLICK_THRESHOLD) {
        heroClicks = 0;
        showMessage({
          text: "You're awesome!",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "1.5rem"
        });
      }
      return;
    }

    const snugTrigger = target.closest(SNUG_SELECTOR) as HTMLElement | null;
    if (snugTrigger) {
      snugClicks += 1;
      animateElement(snugTrigger, "easterSnugBounce", 500, "cubic-bezier(0.34, 1.56, 0.64, 1)");

      if (snugClicks >= SNUG_CLICK_THRESHOLD) {
        snugClicks = 0;
        showMessage({
          text: "Snuggly!",
          bottom: "20%",
          left: "50%",
          transform: "translate(-50%, 0)",
          fontSize: "1.5rem"
        });
      }
    }
  };

  const handleInteractiveKey = (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;

    const target = e.target as HTMLElement | null;
    if (!target) return;

    const supportsEggClick = target.matches(ICON_SELECTOR) || target.matches(HERO_SELECTOR) || target.matches(SNUG_SELECTOR);
    if (!supportsEggClick) return;

    e.preventDefault();
    target.click();
  };

  window.addEventListener("keydown", handleKonamiCode);
  window.addEventListener("keydown", handleSecretG);
  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleInteractiveKey);

  logConsoleMessage();

  return () => {
    window.removeEventListener("keydown", handleKonamiCode);
    window.removeEventListener("keydown", handleSecretG);
    document.removeEventListener("click", handleClick);
    document.removeEventListener("keydown", handleInteractiveKey);
  };
}

function normalizeKonamiKey(key: string) {
  if (key === "b" || key === "B") return "b";
  if (key === "a" || key === "A") return "a";
  return key;
}

function spinFloatingIcon(trigger: HTMLElement) {
  const icon = trigger.querySelector("img");
  if (!icon) return;
  animateElement(icon as HTMLElement, "easterIconSpin", 600, "linear");
}

function animateElement(element: HTMLElement, keyframesName: string, durationMs: number, timing = "ease") {
  element.style.animation = "none";
  void element.offsetWidth;
  element.style.animation = `${keyframesName} ${durationMs}ms ${timing}`;

  window.setTimeout(() => {
    element.style.animation = "";
  }, durationMs);
}

function triggerKonamiEffect() {
  const html = document.documentElement;

  html.style.animation = "none";
  void html.offsetWidth;
  html.style.animation = "easterKonamiSpin 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)";

  window.setTimeout(() => {
    html.style.animation = "";
  }, 600);

  createConfetti();
}

function triggerSecretMessage() {
  showMessage({
    text: "You found it!",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "2rem"
  });
}

type MessageOptions = {
  text: string;
  top?: string;
  bottom?: string;
  left?: string;
  transform?: string;
  fontSize?: string;
};

function showMessage({ text, top, bottom, left, transform, fontSize = "1.5rem" }: MessageOptions) {
  const message = document.createElement("div");
  message.textContent = text;
  message.style.cssText = `
    position: fixed;
    ${top ? `top: ${top};` : ""}
    ${bottom ? `bottom: ${bottom};` : ""}
    ${left ? `left: ${left};` : ""}
    transform: ${transform ?? "none"};
    font-size: ${fontSize};
    font-weight: bold;
    color: #A34D32;
    z-index: 9999;
    animation: easterFadeInOut 2s ease-in-out forwards;
    font-family: "PPEditorialNew", "Times New Roman", serif;
    pointer-events: none;
  `;

  document.body.appendChild(message);
  window.setTimeout(() => message.remove(), 2000);
}

function createConfetti() {
  const colors = ["#A34D32", "#FDFDFB", "#1A1A1A"];

  for (let i = 0; i < 30; i += 1) {
    const confetti = document.createElement("div");
    const size = Math.random() * 10 + 5;
    const duration = Math.random() * 2 + 1.5;

    confetti.style.cssText = `
      position: fixed;
      width: ${size}px;
      height: ${size}px;
      background-color: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}%;
      top: -10px;
      z-index: 9998;
      border-radius: 50%;
      pointer-events: none;
      animation: easterConfettiFall ${duration}s linear forwards;
    `;

    document.body.appendChild(confetti);
    window.setTimeout(() => confetti.remove(), duration * 1000);
  }
}

function logConsoleMessage() {
  if (typeof window === "undefined") return;

  const styles = {
    title: "font-size: 24px; font-weight: bold; color: #A34D32;",
    subtitle: "font-size: 14px; color: #666;",
    link: "font-size: 12px; color: #0066cc; text-decoration: underline;"
  };

  console.log("%cGabriel Cozma", styles.title);
  console.log("%cLike the site? Check out the source or say hello: me@gxbs.dev", styles.link);
  console.log("%cTip: Try the Konami code (↑↑↓↓←→←→BA), double-G, or click hidden elements.", styles.subtitle);
}

export function injectEasterEggStyles() {
  if (typeof document === "undefined") return;

  const styleId = "easter-egg-styles";
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    @keyframes easterKonamiSpin {
      0% { transform: rotateX(0deg) rotateY(0deg); }
      50% { transform: rotateX(180deg) rotateY(180deg); }
      100% { transform: rotateX(0deg) rotateY(0deg); }
    }

    @keyframes easterConfettiFall {
      to {
        transform: translateY(100vh) rotateZ(720deg);
        opacity: 0;
      }
    }

    @keyframes easterFadeInOut {
      0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
      50% { opacity: 1; }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(1.2); }
    }

    @keyframes easterNameWobble {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-3deg); }
      75% { transform: rotate(3deg); }
    }

    @keyframes easterSnugBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    @keyframes easterIconSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  document.head.appendChild(style);
}
