<template>
  <div class="tabs-container">
    <div class="tabs-nav-wrapper">
      <div v-if="$slots['tabs-start']" class="tabs-start">
        <slot name="tabs-start" />
      </div>
      <ul class="tabs-nav" role="tablist">
        <li
          v-for="(tab, index) in tabs"
          :key="index"
          :class="{ active: isActieveTab(index) }"
        >
          <a
            v-tooltip
            :title="!isActieveTab(index) ? tab.title : null"
            role="tab"
            @click="internalValue = index"
          >
            {{ tab.title }}
          </a>
        </li>
      </ul>
      <div v-if="$slots['tabs-end']" class="tabs-end">
        <slot name="tabs-end" />
      </div>
    </div>

    <slot />
  </div>
</template>

<script>
export default {
  provide() {
    return {
      addTab: (tab) => {
        this.tabs.push(tab);
      },
    };
  },
  props: {
    activeTab: {
      type: Number,
      default: 0,
    },
  },
  emits: ["update:activeTab"],
  data() {
    return {
      tabs: [],
      internalValue: null,
    };
  },
  watch: {
    activeTab(value) {
      this.internalValue = value;
    },
    internalValue(value) {
      this.tabs.forEach((tab, i) => {
        if (i === value) tab.activate();
        else tab.deactivate();
      });
      this.$emit("update:activeTab", value);
    },
  },
  mounted() {
    this.internalValue = this.activeTab;
  },
  methods: {
    isActieveTab(index) {
      return index === this.internalValue;
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
    overflow: hidden;
    list-style: none;
    border-bottom: 2px solid var(--metascore-color-bg-secondary);

    > li {
      flex: 1 1 auto;
      overflow: hidden;

      a {
        display: block;
        padding: 0.25em 0.5em;
        color: #fff;
        background: var(--metascore-color-bg-secondary);
        line-height: 2em;
        user-select: none;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
      }

      &.active {
        flex: 1 0 auto;

        a {
          background: var(--metascore-color-bg-primary);
        }
      }
    }
  }

  .tabs-start,
  .tabs-end {
    flex: 1;
  }
}
</style>
