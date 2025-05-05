import type { Theme } from "vitepress";
import Aplos from "./Layout.vue";
import "./extra.scss";
import "aplos/plain";
import "non.geist";

export default {
  Layout: Aplos,
} satisfies Theme;
