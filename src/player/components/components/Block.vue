<i18n>
{
}
</i18n>

<template>
  <component-wrapper
    :model="model"
    class="block"
    @mouseenter="_onMouseEnter"
    @mouseleave="_onMouseLeave"
  >
    <nav v-show="pagerVisibe" class="pager">
      <div class="count"></div>
      <ul class="links">
        <li>
          <a href="#" aria-label="First" @click.prevent="_onPagerFirstClick">
            <span aria-hidden="true">&laquo;</span>
            <span class="sr-only">First</span>
          </a>
        </li>
        <li>
          <a
            href="#"
            aria-label="Previous"
            @click.prevent="_onPagerPreviousClick"
          >
            <span aria-hidden="true">&laquo;</span>
            <span class="sr-only">Previous</span>
          </a>
        </li>
        <li>
          <a href="#" aria-label="Next" @click.prevent="_onPagerNextClick">
            <span aria-hidden="true">&raquo;</span>
            <span class="sr-only">Next</span>
          </a>
        </li>
      </ul>
    </nav>
    <div class="pages">
      {{ model.name }}
      <template v-for="page in model.pages" :key="page.id">
        <page :model="page" />
      </template>
    </div>
  </component-wrapper>
</template>

<script>
import ComponentWrapper from "../ComponentWrapper.vue";
import Page from "./Page";

// @TODO: implement pager

export default {
  components: {
    ComponentWrapper,
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

<style lang="scss" scoped>
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
    width: 100%;
    height: 20px;
    background-color: rgba(214, 214, 214, 0.6);
    text-align: right;
    user-select: none;

    .count {
      display: inline-block;
      margin-right: 10px;
      color: rgb(99, 99, 99);
      font-size: 10px;
      font-weight: bold;
      vertical-align: middle;
      cursor: default;
    }

    .links {
      display: flex;
      margin-right: 2px;
      flex-direction: row;
      vertical-align: middle;
    }
  }
}
</style>
