---
pageClass: home
title: "Gabriel Cozma (Gabs)"
---

# Salut, I'm <br><span>Gabriel Cozma</span>

<small>Human, Front-End Developer <br>& Open Source Contributor</small> { .desc }

<div class="fade-text">

My name is **Gabriel**, also known as **Gabs**. I'm a designer and developer passionate about creating intuitive and visually appealing web experiences. Based in <span class="🇲🇩">Moldova</span>, I focus on building user-friendly solutions. You can explore my coding contributions on [my Forges Profiles](/find#contributions), with most projects hosted on [GitHub](https://github.com/GabsEdits).

Check out my [projects & contributions](/projects) to see my work. If you're interested in a custom website, visit the [commission page](/commissions) for details.

I write about tech, development, and open-source on my [blog](/blog/), which you can subscribe to via [RSS/Atom Feed](/atom.xml). It's a space to share insights and stories from my tech journey.

I also enjoy photography and share some of my favorite shots in my [Photography Gallery](https://photo.gxbs.dev). While it's not my main focus, I love capturing moments.

For web development tips, visit [my tips and tricks](https://tips.gxbs.dev) page, primarily focused on CSS/SCSS and general development. It's a work in progress, but growing steadily.

When I'm not coding, I'm learning new skills to stay updated and make a positive impact through my work. :D :rocket:

---

### About this website

Visit the [Colophon](/colophon) page for details about the tools and technologies behind this website. For feedback or suggestions, feel free to [contact me](/find).

</div>

<div class="button-center">
<button class="action-button" id="read-more-button">Read More ↓</button>
</div>

<section class="cards">

- [**Blog →**](/blog)
- [**Find Me →**](/find)

</section>

## Works

<div class="works">
  <ul>
    <li v-for="work in [
      {
        title: 'Vanilla OS',
        role: 'Volunteer (& more) - Team Member',
        period: 'Jul. 2024 - Present',
        adaptiveLogo: true
      },
      {
        title: 'Bottles',
        role: 'Volunteer - Team Member',
        period: 'Oct. 2024 - Present',
        adaptiveLogo: true
      },
      {
        title: 'HackClub',
        role: 'Community Member',
        period: 'Dec. 2024 - Present',
      }
    ]" :key="work.title" class="work-item">
      <div class="work-info">
        <img :src="`/assets/works/${work.title.replace(/\s+/g, '').toLowerCase()}${work.adaptiveLogo ? isDarkMode ? '-dark' : '-light' : ''}.svg#static`" :alt="`${work.title} Logo`">
        <div class="work-desc">
          <h4>{{ work.title }}</h4>
          <p>{{ work.role }}</p>
        </div>
      </div>
      <p class="work-period">{{ work.period }}</p>
    </li>
  </ul>
</div>

## Skills

<ul class="skills">
  <li v-for="skill in [
    { name: 'HTML', link: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
    { name: 'CSS', link: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
    { name: 'JavaScript', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
    { name: 'TypeScript', link: 'https://www.typescriptlang.org/' },
    { name: 'Vue.js', link: 'https://vuejs.org/' },
    { name: 'Next.js', link: 'https://nextjs.org/' },
    { name: 'Nuxt', link: 'https://nuxt.com/' },
    { name: 'Vite', link: 'https://vitejs.dev/' },
    { name: 'React', link: 'https://react.dev/' },
    { name: 'Astro', link: 'https://astro.build/' },
    { name: 'Svelte', link: 'https://svelte.dev/' },
    { name: 'Fresh.js', link: 'https://fresh.deno.dev/' },
    { name: 'Hono', link: 'https://hono.dev/' },
    { name: 'Java', link: 'https://www.java.com/' },
    { name: 'Liquid', link: 'https://shopify.github.io/liquid/' },
    { name: 'Tailwind CSS', link: 'https://tailwindcss.com/' },
    { name: 'Sass', link: 'https://sass-lang.com/' },
    { name: 'Node.js', link: 'https://nodejs.org/' },
    { name: 'Deno', link: 'https://deno.land/' },
    { name: 'Docker', link: 'https://www.docker.com/' },
    { name: 'Git', link: 'https://git-scm.com/' },
    { name: 'Bash', link: 'https://www.gnu.org/software/bash/' },
    { name: 'DevOps', link: 'https://azure.microsoft.com/en-us/solutions/devops/' },
    { name: 'GitHub Actions', link: 'https://github.com/features/actions' },
    { name: 'Release Management', link: 'https://en.wikipedia.org/wiki/Release_management' },
    { name: '& learning other skills', link: '#' }
  ]" :key="skill.name">
    <a :href="skill.link" target="_blank" rel="noopener noreferrer">{{ skill.name }}</a>
  </li>
</ul>

## Achievements

<div class="achievements">
      <ul>
        <li v-for="achievement in [
          {
            title: 'InfoMatrix 2025 (World Final)',
            link: 'https://infomatrix.ro',
            type: 'Hackathon',
            place: '🥇 Platinum Medal',
            date: 'May 2025',
          },
          {
            title: 'GitHub Foundations',
            link: 'https://www.credly.com/badges/bed86599-e2cc-443a-87fd-856d04d1cd3f/public_url',
            type: 'Certification',
            place: '',
            date: 'May 2025',
          },
          {
            title: 'IT Specialist - HTML5 Application Development',
            link: 'https://www.credly.com/badges/7b064a7b-40ae-4fa8-891f-134fda3fabb4/public_url',
            type: 'Certification',
            place: '',
            date: 'Oct. 2024',
          }
        ]" :key="achievement.title" class="achievement-item">
          <div class="achievement-info">
            <img :src="`/assets/achievements/${achievement.title.replace(/\s+/g, '').toLowerCase()}.svg#static`" :alt="`${achievement.title} Logo`">
            <div class="achievement-desc">
              <a class="achievement-title" :href="achievement.link">{{ achievement.title }}</a>
              <div class="achievement-details">
                <p class="achievement-type">{{ achievement.type }}</p>
                <p v-if="achievement.type === 'Hackathon'" class="achievement-place">{{ achievement.place }}</p>
              </div>
            </div>
          </div>
          <p class="achievement-period">{{ achievement.date }}</p>
        </li>
      </ul>
</div>

## Projects

<ul class="projects">
  <li v-for="project in [
    {
      title: 'Steno',
      link: 'https://github.com/stenodevs/steno',
      description: 'A modern and simple static site generator.'
    },
    {
      title: '@feed',
      link: 'https://jsr.io/@feed/feed',
      description: 'A fast and easy-to-use feed generator for Deno.'
    }
  ]" :key="project.title" class="project-item">
    <div class="project-info">
        <h4><a :href="project.link">{{ project.title }}</a></h4>
        <p>{{ project.description }}</p>
    </div>
      <img :src="`/assets/projects/${project.title.replace(/\s+/g, '').toLowerCase()}.png#static`" :alt="`Screenshot of ${project.title}`">
  </li>
</ul>

<div class="button-center">
<a class="action-button" href="/projects">More Projects -></a>
</div>

## Sponsor

<section class="sponsors">

- [![Tuta](https://tuta.com/assets/Logo_text.LuqsxYBF_Z2cigi2.webp#no-border#static)](https://tuta.com)

</section>

<script setup lang="ts">
import { onMounted } from 'vue';

let isDarkMode = false;

if (typeof window !== 'undefined') {
  isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
}

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
  if (typeof window === 'undefined') {
    return;
  }

  if (window?.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
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

  const readMoreBtn = document.querySelector('#read-more-button');
  const fadeText = document.querySelector('.fade-text');

  if (readMoreBtn && fadeText) {
    readMoreBtn.addEventListener('click', () => {
      fadeText.classList.toggle('expanded');
      readMoreBtn.textContent = fadeText.classList.contains('expanded')
        ? 'Read Less ↑'
        : 'Read More ↓';
    });
  }
});
</script>
