<i18n>
{
  "en": {
    "pager": {
      "first": "First",
      "previous": "Previous",
      "next": "Next",
    }
  },
  "fr": {
    "pager": {
      "first": "Première",
      "previous": "Précédente",
      "next": "Suivante",
    }
  },
}
</i18n>

<template>
  <component-wrapper
    :component="component"
    :class="{ toggled }"
    @mouseenter="onMouseenter"
    @mouseleave="onMouseleave"
  >
    <nav v-show="pagerVisibe" class="pager">
      <div class="count">page {{ activePageIndex + 1 }}/{{ pageCount }}</div>
      <ul class="links">
        <li>
          <a
            href="#"
            aria-label="First"
            :class="{ disabled: activePageIndex === 0 }"
            @click.stop.prevent="reset"
          >
            <span aria-hidden="true"><pager-first-icon class="icon" /></span>
            <span class="sr-only">{{ $t("pager.first") }}</span>
          </a>
        </li>
        <li>
          <a
            href="#"
            aria-label="Previous"
            :class="{ disabled: activePageIndex === 0 }"
            @click.stop.prevent="turnPageBackward"
          >
            <span aria-hidden="true"><pager-previous-icon class="icon" /></span>
            <span class="sr-only">{{ $t("pager.previous") }}</span>
          </a>
        </li>
        <li>
          <a
            href="#"
            aria-label="Next"
            :class="{ disabled: activePageIndex === pageCount - 1 }"
            @click.stop.prevent="turnPageForward"
          >
            <span aria-hidden="true"><pager-next-icon class="icon" /></span>
            <span class="sr-only">{{ $t("pager.next") }}</span>
          </a>
        </li>
      </ul>
    </nav>
    <div ref="pages" class="pages">
      <template v-for="(page, index) in pages" :key="page.id">
        <template v-if="synched">
          <page-component :component="page" @activated="onTimedPageActivated" />
        </template>
        <template v-else>
          <page-component
            v-show="activePageIndex === index"
            :component="page"
          />
        </template>
      </template>
    </div>
  </component-wrapper>
</template>

<script>
import { useModule } from "@metascore-library/core/services/module-manager";
import PagerFirstIcon from "../assets/icons/block/pager-first.svg?inline";
import PagerPreviousIcon from "../assets/icons/block/pager-previous.svg?inline";
import PagerNextIcon from "../assets/icons/block/pager-next.svg?inline";

export default {
  components: {
    PagerFirstIcon,
    PagerPreviousIcon,
    PagerNextIcon,
  },
  inject: ["$deviceHasTouch"],
  props: {
    /**
     * The associated component
     */
    component: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const mediaStore = useModule("media_player").useStore();
    const componentsStore = useModule("app_components").useStore();
    return { mediaStore, componentsStore };
  },
  data() {
    return {
      hover: false,
      activePageIndex: 0,
    };
  },
  computed: {
    toggled() {
      return this.componentsStore.isToggled(this.component);
    },
    synched() {
      return this.component.synched;
    },
    pagerVisibe() {
      if (this.pageCount < 2) {
        return false;
      }

      switch (this.component["pager-visibility"]) {
        case "visible":
          return true;

        case "hidden":
          return false;

        default:
          return this.hover;
      }
    },
    pages() {
      return this.componentsStore.getChildren(this.component);
    },
    pageCount() {
      return this.pages.length;
    },
  },
  mounted() {
    this.setupSwipe();
  },
  methods: {
    seekMediaTo(time) {
      this.mediaStore.seekTo(time);
    },
    async setupSwipe() {
      if (!this.$deviceHasTouch) {
        return;
      }

      const { default: Hammer } = await import(
        /* webpackChunkName: "vendors.hammerjs" */ "hammerjs"
      );

      new Hammer.Manager(this.$refs.pages, {
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
      return this.pages[index];
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
    onMouseenter() {
      this.hover = true;
    },

    /**
     * The 'mouseleave' event handler
     */
    onMouseleave() {
      this.hover = false;
    },

    onTimedPageActivated(component) {
      this.activePageIndex = this.pages.findIndex((v) => {
        return v.id === component.id;
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
.block {
  > .metaScore-component--inner {
    color: rgb(66, 66, 66);
    background-repeat: no-repeat;
    background-position: left top;
    background-size: contain;
    font: normal 11px / normal Verdana, Arial, Helvetica, sans-serif;
    overflow: hidden;
  }

  .pager {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    width: 100%;
    padding: 0.15em 0.5em;
    flex-direction: row;
    align-items: center;
    justify-content: right;
    gap: 0.2em;
    background-color: rgba(214, 214, 214, 0.6);
    box-sizing: border-box;
    user-select: none;
    z-index: 1;

    .count {
      display: inline-block;
      margin-right: 10px;
      color: rgb(99, 99, 99);
      font-size: 0.9em;
      font-weight: bold;
      vertical-align: middle;
    }

    .links {
      display: flex;
      margin: 0;
      padding: 0;
      flex-direction: row;
      gap: 0.2em;
      list-style: none;

      a {
        display: flex;
        width: 1.6em;
        height: 1.6em;
        padding: 0.4em;
        align-items: center;
        justify-content: center;
        color: $metascore-color;
        background-color: #fff;
        border-radius: 50%;
        box-sizing: border-box;

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