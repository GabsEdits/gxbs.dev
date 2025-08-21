# Commissions

**Open Slots:**

<noscript>

Slots are currently fetched via an API, which requires JavaScript to be enabled. Please enable JavaScript to see the available slots, or contact me directly for more information. { .center }

</noscript>

- **Small Scale:** <mark>{{ slots.smallScale.available }}/{{ slots.smallScale.total }} <noscript>NO/JS</noscript></mark>
- **Medium Scale:** <mark>{{ slots.mediumScale.available }}/{{ slots.mediumScale.total }} <noscript>NO/JS</noscript></mark>
- **Large Scale:** <mark>{{ slots.largeScale.available }}/{{ slots.largeScale.total }} <noscript>NO/JS</noscript></mark>

Welcome to my commissions page! Here, you'll find all the information you need to request a commission. Feel free to check out my [projects](/projects) to see my previous work.

## Key Information

<section class="non-cards non-cards-scroll">

- **Payment**
  - Processed via [Ko-fi](https://ko-fi.com/gxbsdev) or [GitHub Sponsors](https://github.com/sponsors/GabsEdits/).
  - Prices depend on project complexity.
  - 50% upfront, 50% upon completion.
  - Full refund if the commission can't be completed.
  - Max 3 revisions; refunds available before the project starts.

- **Timing**
  - Response within **24 hours**.
  - Project duration estimated after discussion.
  - Queue wait time: **24 hours to 2 weeks**.

- **Process**
  - Regular updates via email or your preferred platform (specify in the form under "Details" with your username).
  - Feedback encouraged at every stage.
  - Provide all necessary information at the start, including communication preferences.
  - Final delivery as a zip file with all necessary files, including source code and Figma file.

- **Other Details**
  - Projects include dark and light modes by default.
  - Manual switchers available for an additional <mark>3€</mark>.
  - 10% discount for returning customers, students, and non-profits.
  - Right to refuse any commission that feels uncomfortable or goes against values.

</section>

---

### Legend

#### Scales

Scales are determined by the complexity of the project and the number of pages required.

<section class="non-cards">

- **Small scale** Small projects like personal blogs, portfolios, and landing pages, that typically 2-3 hours of work.
- **Medium scale** Medium projects like small business websites and e-commerce, that typically require 4-8 hours of work.
- **Large scale** Large projects like company websites and web applications. These projects typically require 9-12 hours of work.

</section>

#### Slots

Slots are limited based on my personal availability and workload, for example, in the summer I may have more slots available than during the academic year.

## Services Offered

### Website Design

I design custom websites for personal blogs, portfolios, and businesses using modern design trends. Figma is my preferred tool, but I can work with other platforms too.

- **Small scale** <mark>5€</mark>
- **Medium scale** <mark>10€</mark>
- **Large scale** <mark>15€</mark>

---

### Website Development

#### Using Aplós (VitePress Theme)

Development using [Aplós](https://aplos.gxbs.dev), a minimalistic theme for VitePress optimized for performance. Custom features are available upon request.

- **Small scale** <mark>10€</mark>
- **Medium scale** <mark>20€</mark>
- **Large scale** <mark>30€</mark>

#### Using Aplóe (Vue.js Component Library)

Development using [Aplóe](https://aploe.gxbs.dev), a Vue.js component library with reusable components and custom functionality. SEO optimization and a free 404 page are included. This project is ideal for websites for companies, startups, and e-commerce.

- **Small scale** <mark>15€</mark>
- **Medium scale** <mark>30€</mark>
- **Large scale** <mark>60€</mark>

#### Custom Web Development

Responsive websites using modern web technologies like HTML, CSS, JavaScript/TypeScript, frameworks like Vue.js, React, Next.js, etc. and CSS
frameworks like Tailwind CSS. SEO optimization and a free 404 page are included.

Custom features and third-party integrations are available upon request, and the price will be adjusted accordingly.

- **Small scale** <mark>20€</mark>
- **Medium scale** <mark>50€</mark>
- **Large scale** <mark>70€</mark>

---

### Website Design & Development (Complete Package)

A complete design-to-development solution that includes third-party integrations and custom features\*.

- **Small scale** <mark>25€</mark>
- **Medium scale** <mark>55€</mark>
- **Large scale** <mark>80€</mark>

\* - Custom features are limited to 3 per project. Additional features are available for an extra charge.

---

### Additional Services

<section class="non-cards">

- **Logo/88x31 Badge** Need a logo or a static badge for your website? My talented friend offers this service separately. Check out his work and commissions here:\
   [daudix.one/commissions](https://daudix.one/commissions) - <mark>$3-$24</mark>

- **Hosting** Hosting your website on Vercel or GitHub Pages. Includes custom domain configuration.\
   <mark>1€</mark>

- **Website Maintenance\*** Content updates, SEO and performance optimization.\
   <mark>20€\y</mark>

- **Consulting** Web development consulting on technologies, tools, and frameworks.\
   <mark>0€</mark> (free)

</section>

\* - Maintenance services are billed annually, and the price may vary based on the type of maintenance required.

---

## Request a Commission

You can request a commission by clicking the button below:

<CommissionForm />

---

Alternatively, you can submit a request via any of the methods listed on the [find me](/find) page.

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import CommissionForm from './.vitepress/theme/CommissionsForm.vue';

const slots = ref({
  smallScale: {
    available: 0,
    total: 0
  },
  mediumScale: {
    available: 0,
    total: 0
  },
  largeScale: {
    available: 0,
    total: 0
  }
});

async function getSlots() {
  try {
    const response = await fetch('https://api.gxbs.dev/hire/slots', {
      headers: {
        "X-Source": "Cloudflare-Workers",
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch slots');
    }

    const data = await response.json();
    const results = data.reduce((acc, slot) => {
      acc[slot.name.replace(" ", "").toLowerCase()] = {
        available: slot.available,
        total: slot.total
      };
      return acc;
    }, {});

    slots.value = {
      smallScale: results.smallscale,
      mediumScale: results.mediumscale,
      largeScale: results.largescale
    };
  } catch (error) {
    console.error('Error fetching slots:', error);
  }
}

onMounted(() => {
  getSlots();
});
</script>
