<template>
  <component-wrapper :model="model" class="block-toggler">
    <template v-for="block in sortedBlocks" :key="block.id">
      <button
        :class="{ toggled: isBlockToggled(block) }"
        @click="toggleBlock(block)"
      >
        <svg preserveAspectRatio="xMidYMid meet" :viewBox="viewBox">
          <template v-for="block_2 in sortedBlocks" :key="block_2.id">
            <rect
              :width="block_2.dimension[0]"
              :height="block_2.dimension[1]"
              :x="block_2.position[0]"
              :y="block_2.position[1]"
              :class="{ current: block.id === block_2.id }"
            ></rect>
          </template>
        </svg>
      </button>
    </template>
  </component-wrapper>
</template>

<script>
import { useStore } from "@metascore-library/core/module-manager";
import { sortBy } from "lodash";

export default {
  props: {
    /**
     * The associated component model
     */
    model: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const componentsStore = useStore("components");
    return { componentsStore };
  },
  computed: {
    blocks() {
      return this.model.blocks.map(this.componentsStore.get);
    },
    sortedBlocks() {
      return sortBy(this.blocks, [
        (block) => {
          return block.position[0];
        },
        (block) => {
          return block.position[1];
        },
      ]);
    },
    viewBox() {
      let width = 0;
      let height = 0;

      this.blocks.forEach((block) => {
        width = Math.max(block.position[0] + block.dimension[0], width);
        height = Math.max(block.position[1] + block.dimension[1], height);
      });

      return `0 0 ${width} ${height}`;
    },
  },
  methods: {
    isBlockToggled(block) {
      return this.componentsStore.isBlockToggled(block);
    },
    toggleBlock(block) {
      this.componentsStore.toggleBlock(block);
    },
  },
};
</script>

<style lang="scss" scoped>
.block-toggler {
  > .metaScore-component--inner {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: row;
    align-items: stretch;
    align-content: stretch;
  }

  button {
    svg {
      width: 100%;
      height: 100%;

      rect {
        opacity: 0.5;
        fill: #cecece;

        &.current {
          opacity: 1;
          fill: #666;
        }
      }
    }

    &.toggled {
      opacity: 0.75;
    }

    &:hover {
      opacity: 0.5;
    }
  }
}
</style>
