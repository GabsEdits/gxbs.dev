---
posts:
  - title: Changing Up My Website 
    desc: Why and how I'm redoing my website.
    date: 13/01/2024
    tags:
      - tech
      - web
      - personal
      - devlog
  - title: Behind Aplós
    desc: A new way to make websites, with Vitepress.
    date: 04/01/2024
    tags:
      - tech
      - web
      - devlog
      - oss
---

# Blog

Welcome to my blog, a space where I share updates on my latest projects and delve into topics that captivate my interest.

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
