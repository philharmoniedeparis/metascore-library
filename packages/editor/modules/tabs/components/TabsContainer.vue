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
.tabs-container {
  display: flex;
  height: 100%;
  flex-direction: column;

  .tabs-nav {
    display: flex;
    flex-wrap: nowrap;
    flex: 0;
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

  .tabs-content {
    flex: 1 1 100%;
    overflow-y: auto;
  }
}
</style>
