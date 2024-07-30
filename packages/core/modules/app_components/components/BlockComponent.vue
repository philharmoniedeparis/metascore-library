<i18n>
{
  "fr": {
    "pager": {
      "first": "Première",
      "previous": "Précédente",
      "next": "Suivante",
    }
  },
  "en": {
    "pager": {
      "first": "First",
      "previous": "Previous",
      "next": "Next",
    }
  },
}
</i18n>

<template>
  <component-wrapper
    :component="component"
    @mouseenter="onMouseenter"
    @mouseleave="onMouseleave"
  >
    <nav v-show="pagerVisibe" class="pager">
      <div class="count">page {{ activePageIndex + 1 }}/{{ pageCount }}</div>
      <ul class="links">
        <li>
          <a
            href="#"
            data-action="first"
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
            data-action="previous"
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
            data-action="next"
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
          <page-component
            :component="page"
            @activated="onTimedPageActivated"
            @action="$emit('action', $event)"
          />
        </template>
        <template v-else>
          <page-component
            v-show="activePageIndex === index"
            :component="page"
            @action="$emit('action', $event)"
          />
        </template>
      </template>
    </div>
  </component-wrapper>
</template>

<script>
import { hasTouch as deviceHasTouch } from "@core/utils/device";
import useStore from "../store";
import PagerFirstIcon from "../assets/icons/block/pager-first.svg?inline";
import PagerPreviousIcon from "../assets/icons/block/pager-previous.svg?inline";
import PagerNextIcon from "../assets/icons/block/pager-next.svg?inline";

export default {
  components: {
    PagerFirstIcon,
    PagerPreviousIcon,
    PagerNextIcon,
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
    const store = useStore();
    return { store };
  },
  data() {
    return {
      hover: false,
    };
  },
  computed: {
    synched() {
      return this.component.synched;
    },
    activePageIndex: {
      get() {
        const id = this.component.id;
        return id in this.store.blocksActivePage
          ? this.store.blocksActivePage[id]
          : 0;
      },
      set(value) {
        this.store.setBlockActivePage(this.component, value);
      },
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
      return this.store.getChildren(this.component);
    },
    pageCount() {
      return this.pages.length;
    },
  },
  mounted() {
    this.setupSwipe();
  },
  methods: {
    async setupSwipe() {
      if (!deviceHasTouch()) return;

      const { default: Hammer } = await import("hammerjs");

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
      const id = this.component.id;
      this.store.blocksActivePage[id] = this.pages.findIndex((v) => {
        return v.id === component.id;
      });
    },

    reset() {
      this.activePageIndex = 0;
    },

    turnPageBackward() {
      const index = Math.max(this.activePageIndex - 1, 0);
      this.activePageIndex = index;
    },

    turnPageForward() {
      const index = Math.min(this.activePageIndex + 1, this.pageCount - 1);
      this.activePageIndex = index;
    },
  },
};
</script>

<style lang="scss" scoped>
.block {
  > :deep(.metaScore-component--inner) {
    color: rgb(66, 66, 66);
    font:
      normal 11px / normal Verdana,
      Arial,
      Helvetica,
      sans-serif;
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
        color: var(--metascore-color-accent, #0000fe);
        background-color: #fff;
        border-radius: 50%;
        box-sizing: border-box;

        > span {
          flex: 1 0 auto;
        }

        svg {
          display: block;
        }

        &.disabled {
          color: #ccc;
          pointer-events: none;
        }
      }
    }
  }
}
</style>
