<template>
      <div class="blog-posts">
    <div class="filter-tags">
      <button @click="filterPosts('')">All</button>
      <button v-for="tag in uniqueTags" :key="tag" @click="filterPosts(tag)">#{{ tag }}</button>
    </div>
    <div class="post-container">
      <a v-for="post in filteredPosts" :key="post.title" :href="`posts/${post.title.toLowerCase().replace(/\s+/g, '-')}.html`" class="post">
        <h3>{{ post.title }}</h3>
        <p>{{ post.desc }}</p>
        <p class="date">{{ post.date }}</p>
        <div class="tags">
          <span v-if="typeof post.tags === 'string'" :key="post.tags">#{{ post.tags }}</span>
          <span v-else v-for="tag in post.tags" :key="tag">#{{ tag }}</span>
        </div>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedTag: null,
    };
  },
  computed: {
    allTags() {
      return this.$frontmatter.posts.reduce((tags, post) => {
        return tags.concat(Array.isArray(post.tags) ? post.tags : [post.tags]);
      }, []);
    },
    uniqueTags() {
      const tags = [...new Set(this.allTags)];
      return tags.filter(tag => tag !== '');
    },
    filteredPosts() {
      return this.selectedTag === null
        ? this.$frontmatter.posts
        : this.$frontmatter.posts.filter(post =>
            Array.isArray(post.tags) ? post.tags.includes(this.selectedTag) : post.tags === this.selectedTag
          );
    },
  },
  methods: {
    filterPosts(tag) {
      this.selectedTag = tag === '' ? null : tag;
    },
  },
};
</script>

<style lang="scss">
.blog-posts {
  margin: 0 auto;
}

.post-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 10px;

  @media screen and (max-width: 600px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  .post {
    background-color: var(--color-background-second);
    text-decoration: none;
    padding: 20px;
    border-radius: 8px;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.9);
    }

    h3 {
      margin: 0 !important;
      font-weight: 900;
      font-size: 24px;
    }

    p {
      margin: 0 !important;
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    .date {
      text-align: right;
      font-size: 0.9rem;
      font-weight: 600;
      font-feature-settings: "zero", "tnum", "cv03", "cv02";
    }
  }
}

.filter-tags {
  margin-bottom: 20px;

  button {
    margin-right: 10px;
    margin-bottom: 3px;
    background-color: var(--color-background-second);
    border-radius: 20px;
    padding: 0.25rem 0.75rem;
    font-size: 0.8rem;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.8);
    }
  }
}

.tags {
  margin-top: 10px;

  span {
    margin-right: 5px;
    color: var(--color-text-secondary);
    background-color: var(--color-background);
    padding: 0.15rem 0.45rem;
    border-radius: 20px;
    font-size: 12px;
  }
}
</style>