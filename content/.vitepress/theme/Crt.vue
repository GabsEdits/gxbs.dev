<template>
  <div class="crt scanlines">
    <slot></slot>
  </div>
</template>

<style lang="scss">
.scanlines {
  position: relative;
  overflow: hidden;
  margin: 2rem 0;
  box-shadow:
    0 0 0 0 var(--color-accent),
    0 2px 6px 2px var(--color-accent-alpha),
    0 4px 24px 4px var(--color-accent-alpha);
  border-radius: 10px;
  background: radial-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.85)),
    var(--color-accent);

  @media (prefers-color-scheme: light) {
    background: radial-gradient(rgba(255, 255, 255, 0.7),
        rgba(255, 255, 255, 0.85)),
      var(--color-accent);
  }

  &::before {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    animation: scanlines 0.25s linear infinite;
    background: repeating-linear-gradient(to top,
        rgba(0, 0, 0, 0.25),
        rgba(0, 0, 0, 0.25) 1px,
        transparent 3px,
        transparent 4px);

    @media (prefers-color-scheme: light) {
      background: repeating-linear-gradient(to top,
          rgba(255, 255, 255, 0.25),
          rgba(255, 255, 255, 0.25) 1px,
          transparent 3px,
          transparent 4px);
    }

    width: 100%;
    height: calc(100% + 0.5rem);
    pointer-events: none;
    content: "";
  }

  pre {
    animation: flicker 0.25s alternate infinite;
    margin: unset;
    box-shadow: unset;
    border: 0;
    background-color: unset;
    padding: 1rem;
    text-shadow:
      var(--color-accent-alpha) 0 0 4px,
      var(--color-accent) 0 0 12px;

    @media (prefers-color-scheme: light) {
      text-shadow:
        var(--color-accent-alpha) 0 0 4px,
        var(--color-accent-alpha) 0 0 12px;
    }

    code {
      color: var(--color-accent) !important;

      @media (prefers-color-scheme: light) {
        color: var(--color-background) !important;
      }
    }
  }

  .lang,
  .copy {
    display: none;
  }

  @keyframes flicker {
    0% {
      opacity: 1;
    }

    25% {
      opacity: 0.95;
    }

    50% {
      opacity: 0.85;
    }

    75% {
      opacity: 1;
    }

    100% {
      opacity: 0.9;
    }
  }

  @keyframes scanlines {
    0% {
      transform: translateY(-0.5rem);
    }

    100% {
      transform: translateY(0);
    }
  }
}
</style>
