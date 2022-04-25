<template>
  <component-wrapper :component="component">
    <div v-dompurify-html="text" @click.prevent="onTextClick"></div>
  </component-wrapper>
</template>

<script>
import { buildVueDompurifyHTMLDirective } from "vue-dompurify-html";
// @TODO: add link auto-highlighting

export default {
  directives: {
    dompurifyHtml: buildVueDompurifyHTMLDirective({
      hooks: {
        afterSanitizeAttributes: (node) => {
          if (node.tagName === "A") {
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
      if (!link) {
        return;
      }

      evt.stopPropagation();

      if (/^#/.test(link.hash)) {
        const actions = link.hash.replace(/^#/, "").split("&");

        actions.forEach((action) => {
          if (["play", "pause", "stop"].includes(action)) {
            this.$emit("action", { type: action });
            return;
          }

          let matches = null;

          // play excerpt link.
          if (
            (matches = action.match(/^play=(\d*\.?\d+)?,(\d*\.?\d+)?,(.+)$/))
          ) {
            this.$emit("action", {
              type: "play",
              inTime: matches[1],
              outTime: matches[2],
              scenario: decodeURIComponent(matches[3]),
            });
            return;
          }

          // seek link.
          if ((matches = action.match(/^seek=(\d*\.?\d+)$/))) {
            this.$emit("action", {
              type: "seek",
              time: parseFloat(matches[1]),
            });
            return;
          }

          // page link.
          if ((matches = action.match(/^page=([^,]*),(\d+)$/))) {
            this.$emit("action", {
              type: "page",
              block: decodeURIComponent(matches[1]),
              index: parseInt(matches[2], 10) - 1,
            });
            return;
          }

          // show/hide/toggleBlock link.
          if ((matches = action.match(/^((show|hide|toggle)Block)=(.+)$/))) {
            this.$emit("action", {
              type: matches[1],
              name: decodeURIComponent(matches[3]),
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
  ::v-deep p {
    margin: 1em 0;
  }
}
</style>
