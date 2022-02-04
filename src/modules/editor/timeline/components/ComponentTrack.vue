<template>
  <div
    :class="[
      'track',
      {
        'has-children': hasChildren,
        'has-start-time': hasStartTime,
        'has-end-time': hasEndTime,
        'user-expanded': expanded,
        selected,
      },
    ]"
    :data-type="paramCase(model.type)"
    :title="model.name"
    :style="style"
  >
    <div class="handle">
      <component-icon :model="model" />

      <div v-if="hasChildren" class="toggle expander">
        <input
          :id="`handle--expand--${model.id}`"
          v-model="expanded"
          type="checkbox"
        />
        <label
          :for="`handle--expand--${model.id}`"
          title="Verrouiller/Déverrouiller"
        >
          <expander-icon class="icon" />
        </label>
      </div>

      <div class="label">{{ model.name }}</div>

      <div class="togglers">
        <div class="toggle lock">
          <input :id="`handle--lock--${model.id}`" type="checkbox" />
          <label
            :for="`handle--lock--${model.id}`"
            title="Verrouiller/Déverrouiller"
          >
            <lock-icon class="icon" />
          </label>
        </div>
      </div>
    </div>

    <div class="time-wrapper" @click="onTimeWrapperClick">
      <div class="time" tabindex="0"></div>
    </div>

    <div v-if="hasChildren" class="children">
      <component-track
        v-for="child in children"
        :key="child.id"
        :model="child"
      />
    </div>

    <div class="properties"></div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import { paramCase } from "param-case";
import ExpanderIcon from "../assets/icons/expander.svg?inline";
import LockIcon from "../assets/icons/locked.svg?inline";

export default {
  components: {
    ExpanderIcon,
    LockIcon,
  },
  props: {
    model: {
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
    ...mapGetters(["isComponentSelected"]),
    ...mapGetters("app-components", { filterComponentsByIds: "filterByIds" }),
    selected() {
      return this.isComponentSelected(this.model);
    },
    hasChildren() {
      switch (this.model.type) {
        case "Block":
          return this.model.pages?.length;
        case "Page":
        case "Scenario":
          return this.model.children?.length;
      }

      return false;
    },
    children() {
      if (!this.hasChildren) {
        return [];
      }

      let children = [];

      switch (this.model.type) {
        case "Block":
          children = this.model.pages;
          break;

        case "Page":
        case "Scenario":
          children = this.model.children;
      }

      return this.filterComponentsByIds(children).slice().reverse();
    },
    hasStartTime() {
      return this.model.$isTimeable && this.model.$hasStartTime;
    },
    hasEndTime() {
      return this.model.$isTimeable && this.model.$hasEndTime;
    },
    style() {
      const style = {};
      if (this.hasStartTime) {
        style["--component-start-time"] = this.model["start-time"];
      }
      if (this.hasEndTime) {
        style["--component-end-time"] = this.model["end-time"];
      }
      return style;
    },
  },
  methods: {
    ...mapMutations([
      "selectComponent",
      "deselectComponent",
      "deselectAllComponents",
    ]),
    paramCase,
    onTimeWrapperClick(evt) {
      const model = this.model;

      if (this.selected) {
        if (evt.shiftKey) {
          this.deselectComponent({ model });
        }
      } else {
        if (!evt.shiftKey) {
          this.deselectAllComponents();
        }

        this.selectComponent({ model });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
/* darken and shift to the right sub-handles */
$handles-initial-level: 2;
$handles-final-level: 3;
$handles-lighten-scale: -10%;
$handles-margin: 0.5em;

.track {
  display: contents;
  user-select: none;

  @for $i from $handles-initial-level through $handles-final-level {
    $selector: "";
    @for $j from 1 through $i {
      $selector: $selector #{&};
    }
    #{$selector} .handle {
      border-left: $handles-margin *
        ($i - $handles-initial-level + 1)
        solid
        $darkgray;
      background: scale-color(
        $mediumgray,
        $lightness: $handles-lighten-scale * ($i - $handles-initial-level + 1)
      );
    }
  }

  .handle,
  .time-wrapper {
    height: 2em;
    border-top: 1px solid $darkgray;
    border-bottom: 1px solid $darkgray;
    box-sizing: border-box;
  }

  .handle {
    display: flex;
    position: sticky;
    left: 0;
    grid-column: 1;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    background: $mediumgray;
    border-right: 2px solid $darkgray;
    z-index: 2;

    > .icon {
      width: 1.5em;
      flex: 0 0 auto;
      margin: 0 0.25em;
      color: white;
    }

    .toggle {
      input {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: 0;
        visibility: hidden;
        z-index: -1;
      }

      label {
        display: block;
        font-size: 0.75em;
        cursor: pointer;

        .icon {
          width: 1em;
          height: 1em;
          color: $white;
          opacity: 0.5;
        }
      }
    }

    .expander {
      label {
        padding: 0 0.5em;
      }

      input:checked + label {
        .icon {
          transform: rotate(90deg);
        }
      }
    }

    .label {
      flex: 1 1 auto;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      user-select: none;
      pointer-events: none;
    }

    .togglers {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      margin-left: 0.25em;
      padding: 0 0.25em;

      .toggle {
        label {
          padding: 0.25em;
          background: $darkgray;
        }

        input:checked + label {
          .icon {
            opacity: 1;
          }
        }
      }
    }
  }

  .time-wrapper {
    position: relative;
    height: 100%;
    width: var(--timeline-zoom);
    margin-left: calc(var(--timeline-offset) * -100%);
    grid-column: 2;
    background: $mediumgray;
    cursor: pointer;

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

      &:focus {
        outline: none;
      }

      &:focus-visible {
        outline-offset: 0.1em;
        outline-style: dashed;
        outline-width: 1px;
      }

      .resize-handle {
        display: none;
        width: 6px;
        height: 6px;
        margin: -3px 0 0;
        background: #fff;
        border-radius: 50%;
        z-index: 1;
      }
    }
  }

  .children {
    display: none;
  }

  .properties {
    display: contents;
  }

  @each $component, $color in $component-colors {
    @if $component == default {
      > .time-wrapper .time {
        background-color: $color;
      }
    } @else {
      &[data-type="#{$component}"] {
        > .time-wrapper .time {
          background-color: $color;
        }
      }
    }
  }

  &[data-type="scenario"] {
    border-top: 0;

    > .handle,
    > .time-wrapper {
      display: none;
    }

    > .children {
      display: contents;
    }
  }

  &[data-type="page"] {
    &:first-child > .time-wrapper .time .resize-handle[data-direction="left"],
    &:last-child > .time-wrapper .time .resize-handle[data-direction="right"] {
      display: none;
    }
  }

  &:not(.has-children) {
    .label {
      margin-left: 0.5em;
    }
  }

  &.has-start-time {
    > .time-wrapper {
      .time {
        left: calc(
          var(--component-start-time) / var(--timeline-duration) * 100%
        );
      }
    }
  }

  &.has-end-time {
    > .time-wrapper {
      .time {
        right: calc(
          100% - (var(--component-end-time) / var(--timeline-duration) * 100%)
        );
      }
    }
  }

  &:not(.has-end-time) {
    > .time-wrapper {
      &::after {
        content: "";
        display: block;
        position: sticky;
        left: 0;
        width: 100%;
        height: 100%;
        background-repeat: repeat-y;
        background-size: 8px 8px;
        pointer-events: none;
      }
    }
  }

  &:not(.has-start-time) {
    > .time-wrapper {
      &::after {
        background-image: linear-gradient(135deg, #606060 4px, transparent 0),
          linear-gradient(45deg, #606060 4px, transparent 0);
        background-position: left 3px;
      }
    }
  }

  &:not(.has-end-time) {
    > .time-wrapper {
      &::after {
        background-image: linear-gradient(-135deg, #606060 4px, transparent 0),
          linear-gradient(-45deg, #606060 4px, transparent 0);
        background-position: right 3px;
      }
    }
  }

  &:not(.has-start-time):not(.has-end-time) {
    > .time-wrapper {
      &::after {
        background-image: linear-gradient(135deg, #606060 4px, transparent 0),
          linear-gradient(45deg, #606060 4px, transparent 0),
          linear-gradient(-135deg, #606060 4px, transparent 0),
          linear-gradient(-45deg, #606060 4px, transparent 0);
        background-position: left 3px, left 3px, right 3px, right 3px;
      }
    }
  }

  &.selected {
    > .handle,
    > .time-wrapper {
      background: $lightgray !important;
    }

    > .time-wrapper {
      .time {
        opacity: 1;

        .resize-handle {
          display: block;
        }
      }
    }
  }

  &.user-expanded,
  &.auto-expanded {
    > .handle {
      button[data-action="expander"] {
        .icon {
          transform: rotate(90deg);
        }
      }
    }

    > .children {
      display: contents;
    }
  }

  &.dragging {
    > * {
      opacity: 0.1;
    }
  }

  &.dragover {
    &.drag-above::before,
    &.drag-below::after {
      content: "";
      grid-column: 1 / span 2;
      outline: #ff00a6 solid 1px;
      z-index: 3;
    }
  }
}
</style>
