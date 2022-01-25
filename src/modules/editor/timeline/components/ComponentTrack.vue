<template>
  <div
    :class="[
      'track',
      { 'has-children': hasChildren, 'user-expanded': expanded },
    ]"
    :data-type="component.type"
    :title="component.name"
  >
    <div class="handle">
      <component-icon :component="component" class="icon component-icon" />

      <div v-if="hasChildren" class="expander">
        <input
          :id="`handle--expand--${component.id}`"
          v-model="expanded"
          type="checkbox"
        />
        <label
          :for="`handle--expand--${component.id}`"
          title="Verrouiller/Déverrouiller"
        >
          <expander-icon class="icon" />
        </label>
      </div>

      <div class="label">{{ component.name }}</div>

      <div class="togglers">
        <div class="lock">
          <input :id="`handle--lock--${component.id}`" type="checkbox" />
          <label
            :for="`handle--lock--${component.id}`"
            title="Verrouiller/Déverrouiller"
          >
            <lock-icon class="icon" />
          </label>
        </div>
      </div>
    </div>

    <div class="time-wrapper">
      <div class="time" tabindex="0"></div>
    </div>

    <div v-if="hasChildren" class="children">
      <component-track
        v-for="child in children"
        :key="child.id"
        :component="child"
      />
    </div>

    <div class="properties"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ExpanderIcon from "../assets/icons/expander.svg?inline";
import LockIcon from "../assets/icons/locked.svg?inline";

export default {
  components: {
    ExpanderIcon,
    LockIcon,
  },
  props: {
    component: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      expanded: false,
    };
  },
  computed: {
    ...mapGetters("app-components", { filterComponentsByIds: "filterByIds" }),
    hasChildren() {
      switch (this.component.type) {
        case "Block":
          return this.component.pages?.length;
        case "Page":
        case "Scenario":
          return this.component.children?.length;
      }

      return false;
    },
    children() {
      if (!this.hasChildren) {
        return [];
      }

      let children = [];

      switch (this.component.type) {
        case "Block":
          children = this.component.pages;
          break;

        case "Page":
        case "Scenario":
          children = this.component.children;
      }

      return this.filterComponentsByIds(children).slice().reverse();
    },
  },
};
</script>

<style lang="scss" scoped>
.track {
  display: contents;
  user-select: none;
  cursor: pointer;

  .handle {
    position: sticky;
    display: flex;
    left: 0;
    height: 2em;
    grid-column: 1;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    background: #606060;
    border-right: 2px solid #3f3f3f;
    border-top: 1px solid #3f3f3f;
    border-bottom: 1px solid #3f3f3f;
    box-sizing: border-box;
    z-index: 2;

    input {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: 0;
      visibility: hidden;
      z-index: -1;
    }

    .icon {
      width: 1.5em;
      flex: 0 0 auto;
      margin: 0 0.25em;
      color: $lightgray;
    }

    .expander {
      .icon {
        color: $white;
      }
    }
  }

  .time-wrapper {
    position: relative;
    height: 100%;
    width: var(--timeline-zoom);
    margin-left: calc(var(--timeline-offset) * -100%);
    grid-column: 2;
    background: $lightgray;
    border-top: 1px solid #3f3f3f;
    border-bottom: 1px solid #3f3f3f;
    box-sizing: border-box;

    .time {
      position: absolute;
      top: 0.5em;
      bottom: 0.5em;
      left: 0;
      right: 0;
      background-color: #555;
      box-sizing: border-box;
      box-shadow: 0 0 0.5em 0 rgba(0, 0, 0, 0.5);
      opacity: 0.5;
    }
  }

  .children {
    display: none;
  }

  &[data-type="Scenario"] {
    border-top: 0;

    > .handle,
    > .time-wrapper {
      display: none;
    }

    > .children {
      display: contents;
    }
  }

  &.auto-expanded > .children,
  &.user-expanded > .children {
    display: contents;
  }

  &.selected {
    .time-wrapper {
      background: #777;

      .time {
        background-color: #33312f;
      }
    }
  }
}
</style>
