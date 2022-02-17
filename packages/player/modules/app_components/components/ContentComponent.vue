<template>
  <component-wrapper :model="model" class="content">
    <div v-dompurify-html="text"></div>
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
     * The associated vuex-orm model
     */
    model: {
      type: Object,
      required: true,
    },
  },
  computed: {
    text() {
      return this.model.text;
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
