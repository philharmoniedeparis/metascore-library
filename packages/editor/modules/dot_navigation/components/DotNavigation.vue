<template>
  <div class="dot-navigation">
    <ul>
      <li v-for="i in itemsCount" :key="i" role="presentation">
        <button
          type="button"
          tabindex="0"
          :class="{ active: i - 1 === modelValue }"
          @click="$emit('update:modelValue', i - 1)"
        />
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: Number,
      default: 0,
    },
    itemsCount: {
      type: Number,
      required: true,
    },
  },
  emits: ["update:modelValue"],
};
</script>

<style lang="scss" scoped>
.dot-navigation {
  ul {
    display: flex;
    margin: 0;
    padding: 0;
    justify-content: center;
    list-style: none;
    gap: 0.5em;

    li {
      margin: 0;
      padding: 0;

      button {
        width: 0.5em;
        height: 0.5em;
        background: $mediumgray;
        border-radius: 0.25em;
        transition: width 0.1s ease-in;

        &:hover,
        &.active {
          width: 1em;
          background: $darkgray;
        }
      }
    }
  }
}
</style>
