<i18n>
{
}
</i18n>

<template>
  <div
    v-show="active"
    :class="['metaScore-component', 'block', { active }]"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <nav v-show="pagerVisibe" class="pager">
      <div class="count"></div>
      <ul class="links">
        <li>
          <a href="#" aria-label="First" @click="onPagerFirst">
            <span aria-hidden="true">&laquo;</span>
            <span class="sr-only">First</span>
          </a>
        </li>
        <li>
          <a href="#" aria-label="Previous" @click="onPagerPrevious">
            <span aria-hidden="true">&laquo;</span>
            <span class="sr-only">Previous</span>
          </a>
        </li>
        <li>
          <a href="#" aria-label="Next" @click="onPagerNext">
            <span aria-hidden="true">&raquo;</span>
            <span class="sr-only">Next</span>
          </a>
        </li>
      </ul>
    </nav>
    <div class="pages">
      <template v-for="page in model.pages" :key="page.id">
        <page :model="page" />
      </template>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Page from "./Page";

export default {
  components: {
    Page,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      hover: false,
    };
  },
  computed: {
    ...mapState("media", {
      mediaTime: "time",
    }),
    startTime() {
      return this.model["start-time"];
    },
    endTime() {
      return this.model["end-time"];
    },
    active() {
      if (this.startTime === null && this.endTime === null) {
        return true;
      }

      return this.mediaTime >= this.startTime && this.mediaTime <= this.endTime;
    },
    pagerVisibe() {
      switch (this.model["pager-visibility"]) {
        case "visible":
          return true;

        case "hidden":
          return false;

        default:
          return this.hover;
      }
    },
  },
  methods: {
    onMouseEnter() {
      this.hover = true;
    },
    onMouseLeave() {
      this.hover = false;
    },
    onPagerFirst() {},
    onPagerPrevious() {},
    onPagerNext() {},
  },
};
</script>

<style lang="scss" scoped></style>
