<template>
  <player-component-wrapper
    :model="model"
    :class="{ selected: isComponentSelected(model) }"
    @click.stop="onClick"
  >
    <slot />
  </player-component-wrapper>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import PlayerComponentWrapper from "../../../player/components/components/ComponentWrapper";

export default {
  components: {
    PlayerComponentWrapper,
  },
  emits: ["componentclick"],
  props: {
    /**
     * The associated vuex-orm model
     */
    model: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters(["isComponentSelected"]),
  },
  methods: {
    ...mapMutations([
      "selectComponent",
      "deselectComponent",
      "deselectAllComponents",
    ]),
    onClick(evt) {
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
@import "../../../../assets/css/theme.scss";

.metaScore-component {
  &.selected {
    @each $component, $color in $component-colors {
      @if $component == default {
        box-shadow: 0 0 0.5em 0 $color;
      } @else {
        &.#{$component} {
          box-shadow: 0 0 0.5em 0 $color;
        }
      }
    }
  }
}
</style>
