---
pageClass: home
---

# Gabriel Cozma <small>(Gabs)</small>

<small>Human, Front-End Developer & Open Source Contributor</small> { .desc }

---

<Crt>

```bash
Gabriels-MacBook-Air:~ gabs$ curl -L https://gxbs.dev/me.json

{
  "name": "Gabriel Cozma",
  "username": "gabs",
  "status": "Working on Aplóe, Tipps and other projects",
  "about": "Human",
  "interests": ["Web Development", "Technology", "Open Source", "Linux", "History"],
  "technologies": {
    "frontend": ["HTML", "CSS", "JavaScript", "TypeScript", "Vue.js", "Nuxt.js", "Vite", "React", "Next.js", "Tailwind CSS", "Sass", "Node.js"],
    "wip": ["Deno", "Docker"],
    "other": ["Git", "Linux", "Bash", "Java"]
  },
  "github": "https://github.com/GabsEdits",
  "mastodon": "https://vmst.io/@gabs",
  "blog": "https://gxbs.dev/blog",
  "other": "https://gxbs.dev/find"
}

Gabriels-MacBook-Air:~ gabs$ _
```

</Crt>

---

### Salut! <span class="wave">👋</span>

My name is **Gabriel**, also known as **Gabs** in my digital world. Yeah, I'm a human person, but also a designer and developer with a passion for creating beautiful and intuitive experiences. Proudly navigating the world of development here, in <span class="🇲🇩">Moldova</span>. Creating visually stunning and user-friendly web experiences is what I love. You can peek into my coding contributions by looking at [my Forges Profiles](/find#contributions), most of the projects are on [GitHub](https://github.com/GabsEdits)

Take a closer look at my [projects & contributions](/projects). It's more than just code; it's a reflection of my passion. Occasionally, you might even find me translating one project to another, although not very often.

<!-- I'm also an [team member](https://vanillaos.org/team) of [Vanilla OS](https://vanillaos.org/), a Linux distribution based on Debian, with a focus on simplicity, cleanliness, freedom, and an obstruction-free experience. My role is "Frontend Developer", and I'm responsible for contributing to the web infrastructure of the project (website, web tools, etc.). -->

> If you are looking for a website, feel free to request a commission, check out the [commission page](/commissions) for more information.

::: details A story of my journey
Let's fast forward to May 2023. That's when something amazing happened. I went beyond my personal space and created something truly remarkable. Aeolus – a powerful framework built with Vue.js 3 & Vite, exclusively for Boekestijn in Moldova. The success of this project fueled my desire to take on more professional work, especially for other companies. But Aeolus didn't quite take off and wasn't easy enough to reproduce the components on a shiny new webpage. I decided to start an new adventure called [Aplóe](https://aploe.gxbs.dev), aimed at solving the main issue with Aeolus – the lack of unified styles.
:::

I occasionally write about tech, development, and open-source on my [blog](/blog/), that you can also subscribe to via [RSS/Atom Feed](/atom.xml). You can check it out if you're interested in learning more about my work and the projects I'm involved in, or if you just want to read some cool stories about my journey in the tech world.

In addition to coding, I also ~~slightly~~ enjoy photography. You can find a small collection of my favorite shots on my [Photography Gallery](https://photo.gxbs.dev). <small>While it's not much, and not my main focus, I still enjoy capturing moments.</small>

For web development enthusiasts, have a look on [my tips and tricks](https://tips.gxbs.dev) page, mainly for CSS/SCSS and development in general. You can check it out! <small>It's a work in progress, but I'm getting there.</small>

Now, when I'm not in coding mode, you'll find me immersed in the ever-evolving world of technology. Learning new skills is not just a hobby; it's my way of trying to make a positive impact through my work \:D :rocket:

---

::: details About this website
Check out the special [Colophon](/colophon) page for more information about this website, including the tools and technologies used to build it. If you have any feedback or suggestions, feel free to [contact me](/find).
:::

<script setup lang="ts">
import Crt from './.vitepress/theme/Crt.vue';
import { onMounted } from 'vue';

const animate = (
  ctx: CanvasRenderingContext2D,
  snowflakes: { x: number; y: number; radius: number; speed: number; opacity: number }[],
  canvas: HTMLCanvasElement,
  maxFlakes: number,
) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (snowflakes.length < maxFlakes && Math.random() < 0.05) {
    snowflakes.push({
      x: Math.random() * canvas.width,
      y: 0,
      radius: Math.random() * 7 + 3,
      speed: Math.random() * 0.5 + 0.3,
      opacity: Math.random() * 0.6 + 0.4,
    });
  }
  snowflakes.forEach((flake) => {
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      ctx.moveTo(flake.x, flake.y);
      ctx.lineTo(
        flake.x + Math.cos(Math.PI * 2 * i / 6) * flake.radius,
        flake.y + Math.sin(Math.PI * 2 * i / 6) * flake.radius,
      );
    }
    ctx.strokeStyle = `rgba(255, 255, 255, ${flake.opacity})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
    flake.x += Math.sin(flake.y / 50) * 0.3;
    flake.y += flake.speed * 0.5;
    if (flake.y > canvas.height) {
      flake.y = 0;
      flake.x = Math.random() * canvas.width;
    }
  });
  requestAnimationFrame(() => animate(ctx, snowflakes, canvas, maxFlakes));
};

onMounted(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  if (
    new Date().getMonth() === 11 && new Date().getDate() >= 23 &&
    new Date().getDate() <= 31
  ) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("snow");
    wrapper.style.position = "fixed";
    wrapper.style.top = "0";
    wrapper.style.left = "0";
    wrapper.style.width = "100%";
    wrapper.style.height = "100px";
    wrapper.style.pointerEvents = "none";
    wrapper.style.zIndex = "9999";
    wrapper.style.maskImage =
      "linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 35px)";
    wrapper.style.transition = "opacity 0.3s ease-in-out";
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.width = window.innerWidth * 2;
    canvas.height = 200;
    wrapper.appendChild(canvas);
    document.body.appendChild(wrapper);
    const ctx = canvas.getContext("2d");
    const snowflakes: { x: number; y: number; radius: number; speed: number; opacity: number }[] = [];
    const getMaxFlakes = () => {
      return window.innerWidth <= 800 ? 25 : 50;
    };
    let maxFlakes = getMaxFlakes();
    if (ctx) {
      animate(ctx, snowflakes, canvas, maxFlakes);
    }
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth * 2;
      canvas.height = 200;
      maxFlakes = getMaxFlakes();
      if (snowflakes.length > maxFlakes) {
        snowflakes.length = maxFlakes;
      }
    });
    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop > 100) {
        wrapper.style.opacity = Math.max(0, 1 - (scrollTop - 100) / 200)
          .toString();
      } else {
        wrapper.style.opacity = "1";
      }
    });
  }
});
</script>
