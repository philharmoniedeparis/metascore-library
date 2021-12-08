<i18n>
{
}
</i18n>

<template>
  <component-wrapper
    :model="model"
    :class="{ toggled: model.$toggled }"
    class="block"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <nav v-show="pagerVisibe" class="pager">
      <div class="count">page {{ activePageIndex + 1 }}/{{ pageCount }}</div>
      <ul class="links">
        <li>
          <a
            href="#"
            aria-label="First"
            :class="{ disabled: activePageIndex === 0 }"
            @click.prevent="reset"
          >
            <span aria-hidden="true"><pager-first-icon /></span>
            <span class="tw-sr-only">First</span>
          </a>
        </li>
        <li>
          <a
            href="#"
            aria-label="Previous"
            :class="{ disabled: activePageIndex === 0 }"
            @click.prevent="turnPageBackward"
          >
            <span aria-hidden="true"><pager-previous-icon /></span>
            <span class="tw-sr-only">Previous</span>
          </a>
        </li>
        <li>
          <a
            href="#"
            aria-label="Next"
            :class="{ disabled: activePageIndex === pageCount - 1 }"
            @click.prevent="turnPageForward"
          >
            <span aria-hidden="true"><pager-next-icon /></span>
            <span class="tw-sr-only">Next</span>
          </a>
        </li>
      </ul>
    </nav>
    <div ref="pages" class="pages">
      <template v-for="(page, index) in model.pages" :key="page.id">
        <template v-if="synched">
          <page :model="page" @activated="onTimedPageActivated" />
        </template>
        <template v-else>
          <page v-show="activePageIndex === index" :model="page" />
        </template>
      </template>
    </div>
  </component-wrapper>
</template>

<script>
import { mapState } from "vuex";
import ComponentWrapper from "../ComponentWrapper.vue";
import Page from "./Page";
import PagerFirstIcon from "../../assets/icons/block/pager-first.svg?inline";
import PagerPreviousIcon from "../../assets/icons/block/pager-previous.svg?inline";
import PagerNextIcon from "../../assets/icons/block/pager-next.svg?inline";

export default {
  components: {
    ComponentWrapper,
    PagerFirstIcon,
    PagerPreviousIcon,
    PagerNextIcon,
    Page,
  },
  inject: ["seekMediaTo"],
  props: {
    /**
     * The associated vuex-orm model
     */
    model: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      hover: false,
      activePageIndex: 0,
    };
  },
  computed: {
    ...mapState("device", {
      deviceHasTouch: "hasTouch",
    }),
    synched() {
      return this.model.synched;
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
    pageCount() {
      return this.model.pages.length;
    },
  },
  mounted() {
    this.setupSwipe();
  },
  methods: {
    async setupSwipe() {
      if (!this.deviceHasTouch) {
        return;
      }

      const { default: Hammer } = await import(
        /* webpackChunkName: "vendors/hammerjs.bundle" */ "hammerjs"
      );

      new Hammer.Manager(this.$refs["pages"], {
        recognizers: [
          [Hammer.Swipe, { direction: Hammer.DIRECTION_HORIZONTAL }],
        ],
        cssProps: {
          userSelect: "auto", // Allow user selection.
        },
      })
        .on("swiperight", this.turnPageBackward)
        .on("swipeleft", this.turnPageForward);
    },

    getPage(index) {
      return this.model.pages[index];
    },

    setActivePage(index) {
      if (this.synched) {
        const page = this.getPage(index);
        this.seekMediaTo(page["start-time"]);
      } else {
        this.activePageIndex = index;
      }
    },

    /**
     * The 'mouseenter' event handler
     */
    onMouseEnter() {
      this.hover = true;
    },

    /**
     * The 'mouseleave' event handler
     */
    onMouseLeave() {
      this.hover = false;
    },

    onTimedPageActivated(component, model) {
      this.activePageIndex = this.model.pages.findIndex((v) => {
        return v.id === model.id;
      });
    },

    reset() {
      this.setActivePage(0);
    },

    turnPageBackward() {
      const index = Math.max(this.activePageIndex - 1, 0);
      this.setActivePage(index);
    },

    turnPageForward() {
      const index = Math.min(this.activePageIndex + 1, this.pageCount - 1);
      this.setActivePage(index);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/theme.scss";

.block {
  min-width: 10px;
  min-height: 10px;
  width: 200px;
  height: 200px;
  color: rgb(66, 66, 66);
  background-repeat: no-repeat;
  background-position: left top;
  background-size: contain;
  background-color: rgb(238, 238, 238);
  border: 1px solid rgb(204, 204, 204);
  font: normal 11px / normal Verdana, Arial, Helvetica, sans-serif;
  border-radius: 10px;
  overflow: hidden;

  .pager {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    width: 100%;
    padding: 0.15em 0;
    flex-direction: row;
    align-items: center;
    justify-content: right;
    background-color: rgba(214, 214, 214, 0.6);
    user-select: none;
    z-index: 1;

    .count {
      display: inline-block;
      margin-right: 10px;
      color: rgb(99, 99, 99);
      font-size: 0.9em;
      font-weight: bold;
      vertical-align: middle;
      cursor: default;
    }

    .links {
      display: flex;
      margin-right: 2px;
      flex-direction: row;
      vertical-align: middle;

      a {
        display: flex;
        width: 1.54em;
        height: 1.54em;
        margin: 0 0.2em;
        align-items: center;
        justify-content: center;
        color: $metascore-color;
        background-color: #fff;
        border-radius: 50%;

        &.disabled {
          color: #ccc;
          pointer-events: none;
        }
      }
    }
  }

  &.toggled {
    display: none;
  }
}
</style>
