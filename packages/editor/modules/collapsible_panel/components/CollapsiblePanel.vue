<template>
  <section class="collapsible-panel" :class="{ expanded: isExpanded }">
    <header class="header" @click="toggle">
      <slot name="icon">
        <expander-icon class="icon" />
      </slot>

      <h4 v-if="$slots.title || title" class="title">
        <slot v-if="$slots.title" name="title" />
        <template v-else>{{ title }} </template>
      </h4>
    </header>

    <transition
      name="expand"
      @before-enter="onTransitionBeforeEnter"
      @enter="onTransitionEnter"
      @before-leave="onTransitionBeforeLeave"
      @leave="onTransitionLeave"
    >
      <div v-if="isExpanded" class="body">
        <slot />
      </div>
    </transition>
  </section>
</template>

<script>
import ExpanderIcon from "../assets/icons/expander.svg?inline";

export default {
  components: {
    ExpanderIcon,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    expanded: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isExpanded: this.expanded,
    };
  },
  methods: {
    onTransitionBeforeEnter(element) {
      element.style.height = "0";
    },
    onTransitionEnter(element) {
      element.style.height = `${element.scrollHeight}px`;
    },
    onTransitionBeforeLeave(element) {
      this.onTransitionEnter(element);
    },
    onTransitionLeave(element) {
      this.onTransitionBeforeEnter(element);
    },
    toggle() {
      this.isExpanded = !this.isExpanded;
    },
  },
};
</script>

<style lang="scss" scoped>
.collapsible-panel {
  $easing: cubic-bezier(0.5, 0.25, 0, 1);

  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    cursor: pointer;

    .icon {
      width: 0.75em;
      height: 0.75em;
      margin-right: 0.25em;
      color: #fff;
      transition: transform 0.3s $easing;
    }

    .title {
      margin: 0;
      padding: 0;
      font-size: 1em;
    }
  }

  .body {
    overflow: hidden;
    transition: all 0.3s $easing;
  }

  &.expanded {
    .header {
      .icon {
        transform-origin: center;
        transform: rotate(90deg);
      }
    }
  }

  .expand-enter-from,
  .expand-leave-to {
    opacity: 0.25;
  }
}
</style>
