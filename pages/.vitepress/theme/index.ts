import type { Theme } from "vitepress";
import Aplos from "aplos/Layout.vue";
import "./extra.scss";
import "aplos";

export default {
  Layout: Aplos,
} satisfies Theme;
