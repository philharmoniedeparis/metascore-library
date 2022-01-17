<template>
  <div class="tabs-container">
    <ul class="tabs-nav" role="tablist">
      <li
        v-for="(tab, index) in tabs"
        :key="index"
        :class="{ active: index === selected }"
      >
        <a role="tab" @click="selectTab(index)">{{ tab.title }}</a>
      </li>
    </ul>
    <div class="tabs-content">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tabs: [],
      selected: null,
    };
  },
  mounted() {
    this.selectTab(0);
  },
  methods: {
    addTab(tab) {
      this.tabs.push(tab);
    },
    selectTab(index) {
      this.selected = index;

      this.tabs.forEach((tab, i) => {
        if (i === index) tab.activate();
        else tab.deactivate();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/css/theme.scss";

.tabs-container {
  .tabs-nav {
    display: flex;
    flex-wrap: wrap;
    margin: 0;
    padding: 0;
    list-style: none;
    border-bottom: 2px solid $mediumgray;

    > li {
      flex: 1 1 auto;

      a {
        padding: 0.25em 0.5em;
        color: #fff;
        background: $mediumgray;
        line-height: 2em;
        user-select: none;
        overflow: hidden;
        cursor: pointer;
      }

      &.active {
        a {
          background: $lightgray;
        }
      }
    }
  }
}
</style>
