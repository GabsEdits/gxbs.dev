<script setup lang="ts">
import { useData, Content } from "vitepress";

import NotFound from "aplos/src/layouts/NotFound.vue";
import HelpfulLayout from "aplos/src/layouts/Helpful.vue";
import ArticleHead from "aplos/src/layouts/ArticleHead.vue";
import ArticleFooter from "aplos/src/layouts/ArticleFooter.vue";

import SiteFooter from "aplos/src/components/Footer.vue";
import Navigation from "aplos/src/components/Navigation.vue";

const { site, frontmatter, page, theme } = useData();
</script>

<template>
  <div :class="frontmatter.pageClass">
    <Navigation />
    <main
      id="content-main"
      :class="{
        numeric: frontmatter.style === 'numeric',
        'icon-links': theme.links === 'icons',
      }"
    >
      <div v-if="frontmatter.home">
        <h1>{{ site.title }}</h1>
      </div>
      <div
        v-if="
          frontmatter.layout === 'article' &&
          (!theme.minimal || frontmatter.layout !== 'article')
        "
      >
        <ArticleHead />
      </div>
      <NotFound v-if="page.isNotFound" />
      <div v-else id="content">
        <Content />
      </div>
      <template v-if="frontmatter.layout === 'helpful'">
        <hr />
        <HelpfulLayout />
      </template>
      <div
        v-if="
          frontmatter.layout === 'article' &&
          (!theme.minimal || frontmatter.layout !== 'article')
        "
      >
        <ArticleFooter />
      </div>
    </main>
    <SiteFooter />
  </div>
</template>
