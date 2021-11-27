<i18n>
{
}
</i18n>

<template>
  <div
    v-show="active"
    :class="['metaScore-component', 'block', { active }]"
    @mouseenter="_onMouseEnter"
    @mouseleave="_onMouseLeave"
  >
    <nav v-show="pagerVisibe" class="pager">
      <div class="count"></div>
      <ul class="links">
        <li>
          <a href="#" aria-label="First" @click="_onPagerFirstClick">
            <span aria-hidden="true">&laquo;</span>
            <span class="sr-only">First</span>
          </a>
        </li>
        <li>
          <a href="#" aria-label="Previous" @click="_onPagerPreviousClick">
            <span aria-hidden="true">&laquo;</span>
            <span class="sr-only">Previous</span>
          </a>
        </li>
        <li>
          <a href="#" aria-label="Next" @click="_onPagerNextClick">
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
import { computed } from "vue";
import useCuePoint from "@/player/composables/useCuePoint";
import Page from "./Page";

export default {
  components: {
    Page,
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
  setup(props) {
    const startTime = computed(() => props.model["start-time"]);
    const endTime = computed(() => props.model["end-time"]);
    return {
      ...useCuePoint(startTime, endTime),
    };
  },
  data() {
    return {
      hover: false,
    };
  },
  computed: {
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
    /**
     * The 'mouseenter' event handler
     * @private
     */
    _onMouseEnter() {
      this.hover = true;
    },

    /**
     * The 'mouseleave' event handler
     * @private
     */
    _onMouseLeave() {
      this.hover = false;
    },

    /**
     * The page's first link 'click' event handler
     * @private
     */
    _onPagerFirstClick() {},

    /**
     * The page's preious link 'click' event handler
     * @private
     */
    _onPagerPreviousClick() {},

    /**
     * The page's next link 'click' event handler
     * @private
     */
    _onPagerNextClick() {},
  },
};
</script>

<style lang="scss" scoped></style>
