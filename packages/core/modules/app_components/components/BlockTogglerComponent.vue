<template>
  <component-wrapper :component="component">
    <template v-for="block in sortedBlocks" :key="block.id">
      <button
        type="button"
        :class="{ active: isBlockHidden(block) }"
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
import useStore from "../store";
import { sortBy } from "lodash";

const BLOCK_TOGGLER_OVERRIDES_KEY = "app_components:block_toggler";
const BLOCK_TOGGLER_OVERRIDES_PRIORITY = 100;

export default {
  props: {
    /**
     * The associated component
     */
    component: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const store = useStore();
    return { store };
  },
  computed: {
    blocks() {
      return this.component.blocks
        .map(({ type, id }) => {
          return this.store.get(type, id);
        })
        .filter((b) => b);
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
    isBlockHidden(block) {
      return block.hidden;
    },
    toggleBlock(block) {
      this.store.setOverrides(
        block,
        BLOCK_TOGGLER_OVERRIDES_KEY,
        {
          hidden: !block.hidden,
        },
        BLOCK_TOGGLER_OVERRIDES_PRIORITY
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.block-toggler {
  > :deep(.metaScore-component--inner) {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: row;
    align-items: stretch;
    align-content: stretch;
  }

  button {
    margin: 1px 2px;
    padding: 0;

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

    &.active {
      opacity: 0.75;
    }

    &:hover {
      opacity: 0.5;
    }
  }
}
</style>
