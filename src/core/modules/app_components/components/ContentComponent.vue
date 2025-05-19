<template>
  <component-wrapper :component="component">
    <div v-dompurify-html="text" class="contents" @click="onTextClick"></div>
  </component-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AUTO_HIGHLIGHT_CLASS, parse as parseLink } from "../utils/links";
import { buildVueDompurifyHTMLDirective } from "vue-dompurify-html";
import { useModule } from "@core/services/module-manager";

export default defineComponent ({
  directives: {
    dompurifyHtml: buildVueDompurifyHTMLDirective({
      hooks: {
        afterSanitizeAttributes: (node) => {
          if (node.tagName === "A" && node.hasAttribute("href")) {
            node.setAttribute("target", "_blank");
            node.setAttribute("rel", "noopener");
          }
        },
      },
    }),
  },
  props: {
    /**
     * The associated component
     */
    component: {
      type: Object,
      required: true,
    },
  },
  emits: ["action"],
  setup() {
    const { addCuepoint, removeCuepoint } = useModule("core:media_cuepoints");
    return { addCuepoint, removeCuepoint };
  },
  data() {
    return {
      cuepoints: [],
    };
  },
  computed: {
    text() {
      return this.component.text ?? "";
    },
  },
  watch: {
    text: {
      async handler() {
        this.destroyLinksAutoHihglight();

        await this.$nextTick();
        this.setupLinksAutoHighlight();
      },
      immediate: true,
    },
  },
  beforeUnmount() {
    this.destroyLinksAutoHihglight();
  },
  methods: {
    onTextClick(evt) {
      const link = evt.target.closest("a");
      if (!link || !link.href) {
        return;
      }

      evt.stopPropagation();
      evt.preventDefault();

      const actions = parseLink(link.href);
      if (actions) {
        actions.forEach((action) => {
          this.$emit("action", action);
        });
      } else {
        // Default action, open link in new window/tab.
        window.open(link.href, "_blank");
      }
    },
    setupLinksAutoHighlight() {
      const links = this.$el.querySelectorAll("a[href^='#']");
      links.forEach((link) => {
        const actions = parseLink(link.href);
        actions
          .filter((action) => {
            return action.type === "play" && action.highlight === true;
          })
          .forEach((action) => {
            const cuepoint = this.addCuepoint({
              startTime: action.start,
              endTime: action.end,
              onStart: () => {
                link.classList.add(AUTO_HIGHLIGHT_CLASS);
              },
              onStop: () => {
                link.classList.remove(AUTO_HIGHLIGHT_CLASS);
              },
              onDestroy: () => {
                link.classList.remove(AUTO_HIGHLIGHT_CLASS);
              },
            });

            this.cuepoints.push(cuepoint);
          });
      });
    },
    destroyLinksAutoHihglight() {
      while (this.cuepoints.length > 0) {
        const cuepoint = this.cuepoints.pop();
        this.removeCuepoint(cuepoint);
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.content {
  .contents {
    height: 100%;
    overflow: auto;

    :deep(a) {
      color: rgb(0, 0, 238);
      text-decoration: underline;

      &[data-behavior-trigger] {
        cursor: pointer;
      }

      &.metaScore-auto-highlight {
        color: rgb(238, 0, 0);
        text-decoration: none;
      }
    }
  }
}
</style>
