<template>
  <component-wrapper :component="component">
    <div v-dompurify-html="text" class="contents" @click="onTextClick"></div>
  </component-wrapper>
</template>

<script>
import { parse as parseLink } from "../utils/links";
import { buildVueDompurifyHTMLDirective } from "vue-dompurify-html";
// @TODO: add link auto-highlighting

export default {
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
  computed: {
    text() {
      return this.component.text;
    },
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
            });
            return;
          }

          // scenario link.
          if ((matches = action.match(/^scenario=(.+)$/))) {
            this.$emit("action", {
              type: "scenario",
              scenario: decodeURIComponent(matches[1]),
            });
            return;
          }

          // enter/exit/toggleFullscreen.
          if ((matches = action.match(/^(enter|exit|toggle)Fullscreen$/))) {
            this.$emit("action", { type: matches[0] });
            return;
          }
        });

        return;
      }

      // Default action, open link in new window/tab.
      window.open(link.href, "_blank");
    },
  },
};
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
    }
  }
}
</style>
