<template>
  <div class="tabs-container">
    <div class="tabs-nav-wrapper">
      <div v-if="$slots['tabs-left']" class="tabs-left">
        <slot name="tabs-left" />
      </div>
      <ul class="tabs-nav" role="tablist">
        <li
          v-for="(tab, index) in tabs"
          :key="index"
          :class="{ active: index === modelValue }"
        >
          <a role="tab" @click="selectTab(index)">{{ tab.title }}</a>
        </li>
      </ul>
      <div v-if="$slots['tabs-right']" class="tabs-right">
        <slot name="tabs-right" />
      </div>
    </div>
    <div class="tabs-content">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: Number,
      default: 0,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      tabs: [],
    };
  },
  watch: {
    modelValue(value) {
      this.selectTab(value);
    },
  },
  mounted() {
    this.selectTab(this.modelValue);
  },
  methods: {
    addTab(tab) {
      this.tabs.push(tab);
    },
    selectTab(index) {
      this.tabs.forEach((tab, i) => {
        if (i === index) tab.activate();
        else tab.deactivate();
      });
      this.$emit("update:modelValue", index);
    },
  },
};
</script>

<style lang="scss" scoped>
.tabs-container {
  display: flex;
  height: 100%;
  flex-direction: column;

  .tabs-nav-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: stretch;
  }

  .tabs-nav {
    display: flex;
    flex-wrap: nowrap;
    flex: 1 1 auto;
    margin: 0;
    padding: 0;
    list-style: none;
    border-bottom: 2px solid $mediumgray;

    > li {
      flex: 1 1 auto;
      overflow: hidden;

      a {
        display: block;
        padding: 0.25em 0.5em;
        color: #fff;
        background: $mediumgray;
        line-height: 2em;
        user-select: none;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
      }

      &.active {
        a {
          background: $lightgray;
        }
      }
    }
  }

  .tabs-left,
  .tabs-right {
    flex: 1;
  }

  .tabs-content {
    flex: 1 1 100%;
    overflow-y: auto;
  }
}
</style>
